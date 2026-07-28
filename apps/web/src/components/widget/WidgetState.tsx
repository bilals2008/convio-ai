import { createContext, useContext, type ReactNode } from 'react'
import type { WidgetMessage, WidgetTheme } from '@/hooks/useWidget'

export interface WidgetStateValue {
  isOpen: boolean
  isMinimized: boolean
  isEmbed: boolean
  entering: boolean
  exiting: boolean
  messages: WidgetMessage[]
  isTyping: boolean
  isCreatingConversation: boolean
  unreadCount: number
  error: string | null
  theme: WidgetTheme
  agentName: string
  agentAvatar?: string
  quickReplies: string[]
  streamingContent: string
  position: 'bottom-right' | 'bottom-left'
  homeMenu: { icon: string; label: string; description: string }[]
  widgetWidth: 'narrow' | 'default' | 'wide'
  launcherSize: 'small' | 'default' | 'large'
  borderRadius: 'none' | 'default' | 'full'
  headerGradient: boolean
  headerTitle?: string
  headerSubtitle?: string
  showOnlineIndicator?: boolean
  launcherIcon?: 'chat' | 'sparkle' | 'message' | 'headphones' | 'bot' | 'help'
  launcherLabel?: string
  placeholderText?: string
  showPoweredBy?: boolean
  onSendMessage: (content: string) => void
  onToggle: () => void
  onClose: () => void
  onMinimize: () => void
  dismissError: () => void
}

const WidgetStateContext = createContext<WidgetStateValue | null>(null)

export function useWidgetState() {
  const ctx = useContext(WidgetStateContext)
  if (!ctx) {
    throw new Error('useWidgetState must be used within WidgetStateProvider')
  }
  return ctx
}

interface WidgetStateProviderProps {
  children: ReactNode
  value: WidgetStateValue
}

export function WidgetStateProvider({ children, value }: WidgetStateProviderProps) {
  return (
    <WidgetStateContext.Provider value={value}>
      {children}
    </WidgetStateContext.Provider>
  )
}
