import { useState, useCallback, useEffect } from 'react'
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
}

export interface WidgetConfig {
  agentId: string
  position: 'bottom-right' | 'bottom-left'
  theme: WidgetTheme
  greeting: string
  agentName?: string
  agentAvatar?: string
  quickReplies?: string[]
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#fb923c',
  backgroundColor: '#1c1c1c',
  textColor: '#f3f4f6',
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
      const { data } = await api.post(`/widget/agents/${config.agentId}/conversations`, { channel: 'web' })
      const conversation = data.data || data
      setConversationId(conversation.id)
      return conversation.id
    } catch {
      setError('Failed to start conversation')
      return null
    }
  }, [config.agentId])

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
        const res = data.data || data
        const assistantMessage: WidgetMessage = {
          id: generateId(),
          role: 'assistant',
          content: res.response || res.content || data.response || data.content || 'Sorry, I could not process that.',
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
