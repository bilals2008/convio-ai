import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'

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
}

export interface WidgetConfig {
  botId: string
  position: 'bottom-right' | 'bottom-left'
  theme: WidgetTheme
  greeting: string
  botName?: string
  botAvatar?: string
  quickReplies?: string[]
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#fb923c',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
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
  const [entering, setEntering] = useState(false)
  const [exiting, setExiting] = useState(false)

  const theme = { ...defaultTheme, ...config.theme }

  const createConversation = useCallback(async () => {
    try {
      const { data } = await api.post('/widget/conversations', { botId: config.botId })
      setConversationId(data.id)
      return data.id
    } catch {
      setError('Failed to start conversation')
      return null
    }
  }, [config.botId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
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
        const { data } = await api.post(`/widget/conversations/${activeConversationId}/messages`, {
          content: content.trim(),
          role: 'user',
        })
        const assistantMessage: WidgetMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response || data.content || 'Sorry, I could not process that.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        const fallbackMessage: WidgetMessage = {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, fallbackMessage])
        setError('Failed to send message')
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId, createConversation]
  )

  const openWidget = useCallback(() => {
    setEntering(true)
    setExiting(false)
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false))
    })
  }, [])

  const closeWidget = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsMinimized(false)
      setExiting(false)
    }, 200)
  }, [])

  const toggleWidget = useCallback(() => {
    if (isOpen) {
      closeWidget()
    } else {
      openWidget()
    }
  }, [isOpen, openWidget, closeWidget])

  const addBotMessage = useCallback((content: string) => {
    const botMessage: WidgetMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }, [])

  useEffect(() => {
    if (config.greeting && messages.length === 0) {
      const timer = setTimeout(() => {
        addBotMessage(config.greeting)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [config.greeting, messages.length, addBotMessage])

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
    messages,
    isTyping,
    unreadCount,
    conversationId,
    error,
    theme,
    entering,
    exiting,
    sendMessage,
    openWidget,
    closeWidget,
    toggleWidget,
    setIsMinimized,
  }
}
