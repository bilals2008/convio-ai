import { useState, useCallback, useEffect, useRef } from 'react'
import { publicApi as api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export interface WidgetMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
}

export interface WidgetConfig {
  agentId: string
  publicKey: string
  host?: string
  visitorId?: string
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
}

function generateId(): string {
  return crypto.randomUUID()
}

export function useWidget(config: WidgetConfig) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<WidgetMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [entering, setEntering] = useState(false)
  const [exiting, setExiting] = useState(false)

  const theme = { ...defaultTheme, ...config.theme }

  const CONV_KEY = `convio:conv:${config.publicKey}`

  const authHeaders = useCallback(async (): Promise<Record<string, string> | undefined> => {
    if (!config.preview) return undefined
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
  }, [config.preview])

  const publicHeaders = useCallback((): Record<string, string> => ({
    ...(config.host ? { 'X-Widget-Host': config.host } : {}),
    ...(config.widgetToken ? { 'X-Widget-Token': config.widgetToken } : {}),
  }), [config.host, config.widgetToken])

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
        try { localStorage.setItem(CONV_KEY, conversation.id) } catch { /* storage unavailable */ }
      }
      return conversation.id
    } catch {
      setError('Failed to start conversation')
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }, [config.publicKey, config.preview, config.visitorId, authHeaders, publicHeaders, CONV_KEY])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
      setStreamingContent('')
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
        const response = await fetch(`${baseURL}/widget/conversations/${activeConversationId}/messages/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...publicHeaders(),
            ...(extraHeaders ?? {}),
          },
          body: JSON.stringify({ content: content.trim() }),
        })

        if (!response.ok) throw new Error('Stream request failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''
        let streamError: string | null = null
        let streamDone = false

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
                  streamError = parsed.error
                } else if (parsed.content) {
                  fullContent += parsed.content
                  setStreamingContent(fullContent)
                }
              } catch (e) { console.warn('Malformed SSE chunk:', data, e) }
            }
          }
        }

        setIsTyping(false)
        setStreamingContent('')

        if (streamError) {
          setError(streamError)
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: streamError,
            timestamp: new Date(),
          }])
        } else if (fullContent) {
          setMessages((prev) => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: fullContent,
            timestamp: new Date(),
          }])
        }
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
    [conversationId, createConversation, publicHeaders, authHeaders]
  )

  const isEmbed = useRef(typeof window !== 'undefined' && window.parent !== window)
  // Closed iframe size: must fit the 56px bubble + its inset + shadow so it
  // isn't clipped by the iframe's overflow:hidden.
  const BTN_SIZE = 80
  const OPEN_WIDTH_MAP: Record<string, number> = { narrow: 320, default: 400, wide: 480 }
  const OPEN_WIDTH = OPEN_WIDTH_MAP[config.widgetWidth || 'default'] || 400
  const OPEN_HEIGHT = Math.min(Math.max(config.widgetHeight || 620, 300), 900)

  const sendResize = useCallback((w: number, h: number, open: boolean) => {
    if (!isEmbed.current) return
    window.parent.postMessage({ type: 'convio-resize', width: w, height: h, open, position: config.position }, '*')
  }, [config.position])

  const openWidget = useCallback(() => {
    setError(null)
    setEntering(true)
    setExiting(false)
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
    sendResize(OPEN_WIDTH, OPEN_HEIGHT, true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false))
    })
  }, [sendResize])

  const closeWidget = useCallback(() => {
    setExiting(true)
    sendResize(BTN_SIZE, BTN_SIZE, false)
    setTimeout(() => {
      setIsOpen(false)
      setIsMinimized(false)
      setExiting(false)
    }, 200)
  }, [sendResize])

  const toggleWidget = useCallback(() => {
    if (isOpen) {
      closeWidget()
    } else {
      openWidget()
    }
  }, [isOpen, openWidget, closeWidget])

  const addAgentMessage = useCallback((content: string) => {
    const agentMessage: WidgetMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, agentMessage])
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setStreamingContent('')
    setError(null)
    setIsTyping(false)
    setUnreadCount(0)
    if (!config.preview) {
      try { localStorage.removeItem(CONV_KEY) } catch { /* storage unavailable */ }
    }
  }, [config.preview, CONV_KEY])

  const [historyLoaded, setHistoryLoaded] = useState(() => !!config.preview)

  // Resume a returning visitor's conversation. The conversation id is stored
  // per widget, so the embedded widget reloads history on return visits.
  useEffect(() => {
    if (config.preview) return
    let cancelled = false
    async function resume() {
      try {
        const storedId = localStorage.getItem(CONV_KEY)
        if (!storedId) return
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
        }
      } catch {
        try { localStorage.removeItem(CONV_KEY) } catch { /* ignore */ }
      } finally {
        if (!cancelled) setHistoryLoaded(true)
      }
    }
    resume()
    return () => { cancelled = true }
  }, [config.preview, CONV_KEY, authHeaders, publicHeaders])

  useEffect(() => {
    if (historyLoaded && config.greeting && messages.length === 0 && !(config.quickReplies?.length)) {
      const timer = setTimeout(() => {
        addAgentMessage(config.greeting)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [config.greeting, messages.length, addAgentMessage, config.quickReplies, historyLoaded])

  useEffect(() => {
    if (isEmbed.current) {
      setTimeout(() => sendResize(BTN_SIZE, BTN_SIZE, false), 100)
    }
  }, [sendResize])

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
    sendMessage,
    clearChat,
    openWidget,
    closeWidget,
    toggleWidget,
    setIsMinimized,
    widgetHeight: config.widgetHeight,
  }
}