import { useState, useCallback, useEffect, useRef } from 'react'
import { publicApi as api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export interface WidgetMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface WidgetQuestion {
  question: string
  choices: string[]
}

export interface WidgetTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  promptBgColor: string
  headerGradientStart: string
  headerGradientEnd: string
  headerGradientDirection: string
  borderColor: string
  inputBgColor: string
  sendBtnColor: string
  footerBgColor: string
  headerTitleColor: string
  headerSubtitleColor: string
  onlineIndicatorColor: string
  headerIconColor: string
}

export interface WidgetConfig {
  agentId: string
  publicKey: string
  host?: string
  visitorId?: string
  currentPath?: string
  widgetToken?: string
  preview?: boolean
  position: 'bottom-right' | 'bottom-left'
  theme: WidgetTheme
  greeting: string
  agentName?: string
  agentAvatar?: string
  quickReplies?: string[]
  homeMenu?: { icon: string; label: string; description: string }[]
  widgetWidth?: 'narrow' | 'default' | 'wide'
  launcherSize?: 'small' | 'default' | 'large'
  borderRadius?: 'none' | 'default' | 'full'
  headerGradient?: boolean
  widgetHeight?: number
  mobileBehavior?: 'default' | 'fullscreen'
  launcherShape?: 'circle' | 'pill' | 'square'
  customWidth?: number
  customHeight?: number
  launcherOffset?: number
  showTeaser?: boolean
  teaserMessage?: string
  teaserDelay?: number
  hiddenPages?: string[]
  /** Preview embeds can render open on first paint. Ignored outside preview. */
  defaultOpen?: boolean
}
const defaultTheme: WidgetTheme = {
  primaryColor: '#1cca4a',
  backgroundColor: '#1c1c1c',
  textColor: '#f3f4f6',
  promptBgColor: '#2a2a2a',
  headerGradientStart: '#1cca4a',
  headerGradientEnd: '#0d7a34',
  headerGradientDirection: '135deg',
  borderColor: '',
  inputBgColor: '',
  sendBtnColor: '',
  footerBgColor: '',
  headerTitleColor: '',
  headerSubtitleColor: '',
  onlineIndicatorColor: '',
  headerIconColor: '',
}

function generateId(): string {
  return crypto.randomUUID()
}

// Hidden-page patterns are URL path prefixes: "/checkout" hides "/checkout" and
// "/checkout/success" but not "/checkout-legacy". A trailing "*" is accepted and
// behaves identically, and "*" alone hides the widget everywhere.
function matchesHiddenPage(path: string, pattern: string): boolean {
  const withoutWildcard = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern
  const prefix = withoutWildcard.endsWith('/') ? withoutWildcard.slice(0, -1) : withoutWildcard
  if (prefix === '') return true
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function useWidget(config: WidgetConfig) {
  const [isOpen, setIsOpen] = useState(() => Boolean(config.preview && config.defaultOpen))
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<WidgetMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [pendingQuestions, setPendingQuestions] = useState<{ questions: WidgetQuestion[] } | null>(null)
  const [entering, setEntering] = useState(false)
  const [exiting, setExiting] = useState(false)

  const theme = { ...defaultTheme, ...config.theme }

  const CONV_KEY = `convio:conv:${config.publicKey}`
  const CONV_TS_KEY = `convio:conv_ts:${config.publicKey}`
  // ponytail: 4-hour stale window — visitor gets a fresh welcome on return.
  const CONV_MAX_AGE_MS = 4 * 60 * 60 * 1000

  const authHeaders = useCallback(async (): Promise<Record<string, string> | undefined> => {
    if (!config.preview) return undefined
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
  }, [config.preview])

  const publicHeaders = useCallback((): Record<string, string> => ({
    ...(config.host ? { 'X-Widget-Host': config.host } : {}),
    ...(config.widgetToken ? { 'X-Widget-Token': config.widgetToken } : {}),
    ...(config.visitorId ? { 'X-Widget-Visitor': config.visitorId } : {}),
  }), [config.host, config.widgetToken, config.visitorId])

  const createConversation = useCallback(async () => {
    setIsCreatingConversation(true)
    try {
      const query = config.preview ? '?preview=true' : ''
      const extraHeaders = await authHeaders()
      const headers = { ...publicHeaders(), ...(extraHeaders ?? {}) }
      const body = config.visitorId ? { visitorId: config.visitorId } : {}
      const { data } = await api.post(`/public/widgets/${config.publicKey}/conversations${query}`, body, { headers })
      const conversation = data.data || data
      setConversationId(conversation.id)
      if (!config.preview) {
        try {
          localStorage.setItem(CONV_KEY, conversation.id)
          localStorage.setItem(CONV_TS_KEY, String(Date.now()))
        } catch { /* storage unavailable */ }
      }
      return conversation.id
    } catch {
      setError('Failed to start conversation')
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }, [config.publicKey, config.preview, config.visitorId, authHeaders, publicHeaders, CONV_KEY, CONV_TS_KEY])

  // Shared SSE reader for both the message stream and the ask_user resume
  // stream. Returns the accumulated text, an error, or the questions when the
  // backend pauses for user input (ask_user).
  const readAssistantStream = useCallback(async (
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
    onFlush: (content: string) => void,
  ): Promise<{ fullContent: string; error: string | null; questions: WidgetQuestion[] | null }> => {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('Stream request failed')

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''
    let error: string | null = null
    let questions: WidgetQuestion[] | null = null
    let streamDone = false
    // Flush streamed text once per animation frame instead of once per
    // token, so the markdown bubble doesn't re-parse on every chunk.
    let rafHandle: number | null = null
    const scheduleFlush = () => {
      if (rafHandle !== null) return
      rafHandle = requestAnimationFrame(() => {
        rafHandle = null
        onFlush(fullContent)
      })
    }

    while (!streamDone) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            streamDone = true
            break
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              error = parsed.error
            } else if (parsed.type === 'tool_requires_input' && parsed.tool === 'ask_user') {
              const rawQuestions = parsed.args?.questions
              if (Array.isArray(rawQuestions)) {
                questions = rawQuestions as WidgetQuestion[]
              }
            } else if (parsed.content) {
              fullContent += parsed.content
              scheduleFlush()
            }
          } catch (e) { console.warn('Malformed SSE chunk:', data, e) }
        }
      }
    }

    if (rafHandle !== null) cancelAnimationFrame(rafHandle)
    return { fullContent, error, questions }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
      setStreamingContent('')
      setPendingQuestions(null)
      const userMessage: WidgetMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      setIsTyping(true)

      let activeConversationId = conversationId
      if (!activeConversationId) {
        activeConversationId = await createConversation()
      }

      if (!activeConversationId) {
        setIsTyping(false)
        return
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const extraHeaders = await authHeaders()
        const result = await readAssistantStream(
          `${baseURL}/widget/conversations/${activeConversationId}/messages/stream`,
          {
            'Content-Type': 'application/json',
            ...publicHeaders(),
            ...(extraHeaders ?? {}),
          },
          { content: content.trim() },
          setStreamingContent,
        )

        setIsTyping(false)

        if (result.error) {
          setError(result.error)
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: result.error ?? 'Something went wrong',
            timestamp: new Date(),
          }])
        } else if (result.questions && result.questions.length > 0) {
          // Backend paused for user input — keep any preamble text the model
          // streamed before the questions, then show the question card.
          if (result.fullContent) {
            setMessages((prev) => [...prev, {
              id: generateId(),
              role: 'assistant',
              content: result.fullContent,
              timestamp: new Date(),
            }])
          }
          setPendingQuestions({ questions: result.questions })
        } else if (result.fullContent) {
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: result.fullContent,
            timestamp: new Date(),
          }])
        }
        // Same-commit swap: final message replaces the streaming bubble with
        // no blank frame in between.
        setStreamingContent('')
      } catch {
        setIsTyping(false)
        setStreamingContent('')
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        }])
        setError('Failed to send message')
      }
    },
    [conversationId, createConversation, publicHeaders, authHeaders, readAssistantStream]
  )

  // Continue after the visitor answers the ask_user questions.
  const answerQuestions = useCallback(
    async (answers: Array<{ question: string; answer: string }>) => {
      if (!pendingQuestions || answers.length === 0) return
      setPendingQuestions(null)
      setError(null)
      setStreamingContent('')
      setIsTyping(true)

      let activeConversationId = conversationId
      if (!activeConversationId) {
        activeConversationId = await createConversation()
      }

      if (!activeConversationId) {
        setIsTyping(false)
        return
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const extraHeaders = await authHeaders()
        const result = await readAssistantStream(
          `${baseURL}/widget/conversations/${activeConversationId}/messages/ask-user-resume`,
          {
            'Content-Type': 'application/json',
            ...publicHeaders(),
            ...(extraHeaders ?? {}),
          },
          { answers },
          setStreamingContent,
        )

        setIsTyping(false)

        if (result.error) {
          setError(result.error)
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: result.error ?? 'Something went wrong',
            timestamp: new Date(),
          }])
        } else if (result.fullContent) {
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: result.fullContent,
            timestamp: new Date(),
          }])
        }
        setStreamingContent('')
      } catch {
        setIsTyping(false)
        setStreamingContent('')
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        }])
        setError('Failed to send message')
      }
    },
    [pendingQuestions, conversationId, createConversation, publicHeaders, authHeaders, readAssistantStream]
  )

  const isEmbed = useRef(typeof window !== 'undefined' && window.parent !== window)
  const LAUNCHER_PX = { small: 48, default: 56, large: 64 } as const
  const OPEN_WIDTH_MAP: Record<string, number> = { narrow: 320, default: 380, wide: 440 }
  const OPEN_WIDTH = config.customWidth && config.customWidth > 0
    ? Math.min(Math.max(config.customWidth, 300), 500)
    : OPEN_WIDTH_MAP[config.widgetWidth || 'default'] || 380
  const OPEN_HEIGHT = config.customHeight && config.customHeight > 0
    ? Math.min(Math.max(config.customHeight, 300), 1200)
    : Math.min(Math.max(config.widgetHeight || 540, 300), 900)
  const LAUNCHER_OFFSET = Math.min(Math.max(config.launcherOffset ?? 0, 0), 200)

  // Hide widget on specific pages (pattern matching against current path).
  const isPathHidden = useCallback((): boolean => {
    if (config.preview) return false
    const pages = config.hiddenPages
    if (!pages || pages.length === 0) return false
    // Inside the embed iframe window.location is the widget's own URL, so use
    // the embedding page's path passed in by widget.js (fall back for preview).
    const path = config.currentPath || window.location.pathname
    return pages.some((pattern) => matchesHiddenPage(path, pattern))
  }, [config.preview, config.hiddenPages, config.currentPath])
  const [isHidden, setIsHidden] = useState(isPathHidden)
  useEffect(() => {
    if (config.preview) return
    const check = () => setIsHidden(isPathHidden())
    check()
    // Listen for SPA navigations via popstate (covers browser back/forward).
    window.addEventListener('popstate', check)
    return () => window.removeEventListener('popstate', check)
  }, [isPathHidden, config.preview])

  // Teaser message — appears after a delay, dismisses on open.
  const [teaserVisible, setTeaserVisible] = useState(false)
  useEffect(() => {
    // Teasers are shown in preview too (once the widget is closed) so the
    // Layout tab's teaser controls have visible feedback.
    if (config.showTeaser === false || !config.teaserMessage || isOpen || isHidden) {
      setTeaserVisible(false)
      return
    }
    const delay = Math.max(config.teaserDelay ?? 5, 1) * 1000
    const id = setTimeout(() => setTeaserVisible(true), delay)
    return () => clearTimeout(id)
  }, [config.showTeaser, config.teaserMessage, config.teaserDelay, isOpen, isHidden])
  const dismissTeaser = useCallback(() => setTeaserVisible(false), [])

  // Fullscreen on small screens: track viewport so open/close sizing follows
  // orientation changes. Preview mode keeps the fixed-size dashboard preview.
  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1280),
  )
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isFullscreen =
    !config.preview && config.mobileBehavior === 'fullscreen' && viewportWidth < 640

  const launcherShape = config.launcherShape ?? 'circle'
  const launcherPx = LAUNCHER_PX[config.launcherSize || 'default']
  const teaserOpen = Boolean(teaserVisible && config.teaserMessage)
  // Iframe must match the launcher button. Extra padding for labels painted a
  // white rectangle around the avatar on host pages.
  const closedWidth = teaserOpen ? Math.max(launcherPx, 220) : launcherPx
  const closedHeight = teaserOpen ? launcherPx + 44 : launcherPx
  const launcherRadius = teaserOpen
    ? '16px'
    : launcherShape === 'circle'
      ? '50%'
      : launcherShape === 'pill'
        ? '16px'
        : '8px'

  const sendResize = useCallback((w: number, h: number, open: boolean) => {
    if (!isEmbed.current) return
    window.parent.postMessage({
      type: 'convio-resize',
      width: w,
      height: h,
      open,
      position: config.position,
      fullscreen: open && isFullscreen,
      offset: LAUNCHER_OFFSET,
      launcherRadius,
    }, '*')
  }, [config.position, isFullscreen, LAUNCHER_OFFSET, launcherRadius])

  const openWidget = useCallback(() => {
    if (isHidden) return
    setError(null)
    setEntering(true)
    setExiting(false)
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
    setTeaserVisible(false)
    if (isFullscreen) {
      sendResize(viewportWidth, window.innerHeight, true)
    } else {
      sendResize(OPEN_WIDTH, OPEN_HEIGHT, true)
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false))
    })
  }, [sendResize, isFullscreen, viewportWidth, OPEN_WIDTH, OPEN_HEIGHT, isHidden])

  const closeWidget = useCallback(() => {
    setExiting(true)
    sendResize(closedWidth, closedHeight, false)
    setTimeout(() => {
      setIsOpen(false)
      setIsMinimized(false)
      setExiting(false)
    }, 200)
  }, [sendResize, closedWidth, closedHeight])

  const toggleWidget = useCallback(() => {
    if (isOpen) {
      closeWidget()
    } else {
      openWidget()
    }
  }, [isOpen, openWidget, closeWidget])

  // Keep the window sized to the viewport while fullscreen and, when the
  // viewport grows past the fullscreen breakpoint (portrait -> landscape
  // rotation), shrink it back to the configured window size — otherwise the
  // iframe stays stuck fullscreen.
  const prevFullscreenRef = useRef(isFullscreen)
  useEffect(() => {
    if (!isOpen) return
    if (prevFullscreenRef.current === isFullscreen) return
    prevFullscreenRef.current = isFullscreen
    sendResize(
      isFullscreen ? viewportWidth : OPEN_WIDTH,
      isFullscreen ? window.innerHeight : OPEN_HEIGHT,
      true,
    )
  }, [isOpen, isFullscreen, viewportWidth, OPEN_WIDTH, OPEN_HEIGHT, sendResize])

  const clearChat = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setStreamingContent('')
    setPendingQuestions(null)
    setError(null)
    setIsTyping(false)
    setUnreadCount(0)
    if (!config.preview) {
      try {
        localStorage.removeItem(CONV_KEY)
        localStorage.removeItem(CONV_TS_KEY)
      } catch { /* storage unavailable */ }
    }
  }, [config.preview, CONV_KEY])

  // Resume a returning visitor's conversation. The conversation id is stored
  // per widget, so the embedded widget reloads history on return visits.
  useEffect(() => {
    if (config.preview) return
    let cancelled = false
    async function resume() {
      try {
        const storedId = localStorage.getItem(CONV_KEY)
        if (!storedId) return

        // Expire stale conversations (older than CONV_MAX_AGE_MS).
        const storedTs = localStorage.getItem(CONV_TS_KEY)
        if (storedTs && Date.now() - Number(storedTs) > CONV_MAX_AGE_MS) {
          try {
            localStorage.removeItem(CONV_KEY)
            localStorage.removeItem(CONV_TS_KEY)
          } catch { /* ignore */ }
          return
        }
        const extraHeaders = await authHeaders()
        const response = await api.get(`/widget/conversations/${storedId}/messages?limit=50`, {
          headers: { ...publicHeaders(), ...(extraHeaders ?? {}) },
        })
        const history = response.data.data || []
        if (cancelled) return
        if (Array.isArray(history) && history.length > 0) {
          setConversationId(storedId)
          setMessages(history.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
          })))
        } else {
          localStorage.removeItem(CONV_KEY)
          localStorage.removeItem(CONV_TS_KEY)
        }
      } catch {
        try {
          localStorage.removeItem(CONV_KEY)
          localStorage.removeItem(CONV_TS_KEY)
        } catch { /* ignore */ }
      }
    }
    resume()
    return () => { cancelled = true }
  }, [config.preview, CONV_KEY, CONV_TS_KEY, authHeaders, publicHeaders])

  // The welcome screen owns the greeting, so no assistant greeting message is
  // auto-appended — that previously rendered the greeting twice (once in the
  // welcome view, once as a chat bubble).

  useEffect(() => {
    if (!isEmbed.current || isOpen) return
    if (isHidden) {
      sendResize(0, 0, false)
      return
    }
    sendResize(closedWidth, closedHeight, false)
  }, [sendResize, isOpen, isHidden, closedWidth, closedHeight])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWidget()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeWidget])

  return {
    isOpen,
    isMinimized,
    isEmbed: isEmbed.current,
    isFullscreen,
    isHidden,
    messages,
    isTyping,
    isCreatingConversation,
    unreadCount,
    conversationId,
    error,
    setError,
    theme,
    entering,
    exiting,
    streamingContent,
    pendingQuestions,
    sendMessage,
    answerQuestions,
    clearChat,
    openWidget,
    closeWidget,
    toggleWidget,
    setIsMinimized,
    widgetHeight: config.widgetHeight,
    teaserVisible,
    dismissTeaser,
    launcherShape: config.launcherShape ?? 'circle',
    LAUNCHER_OFFSET,
  }
}