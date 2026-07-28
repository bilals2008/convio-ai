import { useState, useCallback, useEffect, useRef } from 'react'
import { publicApi as api } from '@/lib/api'

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
}

export interface WidgetConfig {
  agentId: string
  publicKey?: string
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
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#fb923c',
  backgroundColor: '#1c1c1c',
  textColor: '#f3f4f6',
  promptBgColor: '#2a2a2a',
  headerGradientStart: '#fb923c',
  headerGradientEnd: '#c2410c',
  headerGradientDirection: '135deg',
  borderColor: '',
  inputBgColor: '',
  sendBtnColor: '',
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

  const createConversation = useCallback(async () => {
    setIsCreatingConversation(true)
    try {
      const query = config.preview ? '?preview=true' : ''
      const { data } = config.publicKey
        ? await api.post(`/public/widgets/${config.publicKey}/conversations${query}`, {})
        : await api.post(`/widget/agents/${config.agentId}/conversations`, { channel: 'web' })
      const conversation = data.data || data
      setConversationId(conversation.id)
      return conversation.id
    } catch {
      setError('Failed to start conversation')
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }, [config.agentId, config.publicKey, config.preview])

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
        const response = await fetch(`${baseURL}/widget/conversations/${activeConversationId}/messages/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
        })

        if (!response.ok) throw new Error('Stream request failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''
        let streamError: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
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
    [conversationId, createConversation]
  )

  const isEmbed = useRef(typeof window !== 'undefined' && window.parent !== window)
  // Closed iframe size: must fit the 56px bubble + its inset + shadow so it
  // isn't clipped by the iframe's overflow:hidden.
  const BTN_SIZE = 80
  const OPEN_WIDTH = 400
  const OPEN_HEIGHT = 620

  const sendResize = useCallback((w: number, h: number, open: boolean) => {
    if (!isEmbed.current) return
    window.parent.postMessage({ type: 'convio-resize', width: w, height: h, open }, '*')
  }, [])

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

  useEffect(() => {
    if (config.greeting && messages.length === 0) {
      const timer = setTimeout(() => {
        addAgentMessage(config.greeting)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [config.greeting, messages.length, addAgentMessage])

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
    openWidget,
    closeWidget,
    toggleWidget,
    setIsMinimized,
  }
}
