import { createPortal } from 'react-dom'
import { useWidget, type WidgetTheme } from '@/hooks/useWidget'
import { WidgetStateProvider } from './WidgetState'
import { WidgetStyles } from './WidgetStyles'
import { WidgetButton } from './WidgetButton'
import { WidgetWindow } from './WidgetWindow'
import { cn } from '@/lib/utils'

export interface ChatWidgetProps {
  agentId: string
  publicKey?: string
  host?: string
  preview?: boolean
  position?: 'bottom-right' | 'bottom-left'
  theme?: Partial<WidgetTheme>
  themeMode?: 'auto' | 'light' | 'dark'
  greeting?: string
  agentName?: string
  agentAvatar?: string
  quickReplies?: string[]
  homeMenu?: { icon: string; label: string; description: string }[]
  widgetWidth?: 'narrow' | 'default' | 'wide'
  launcherSize?: 'small' | 'default' | 'large'
  borderRadius?: 'none' | 'default' | 'full'
  headerGradient?: boolean
  headerTitle?: string
  headerSubtitle?: string
  showOnlineIndicator?: boolean
  launcherLabel?: string
  placeholderText?: string
  showPoweredBy?: boolean
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

function WidgetBackdrop({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null

  return (
    <div
      className={cn(
        'convio-backdrop fixed inset-0 z-[9997] bg-black/20 backdrop-blur-[1px]',
        'animate-in fade-in duration-200'
      )}
      onClick={onClose}
      aria-hidden
    />
  )
}

export function ChatWidget({
  agentId,
  publicKey,
  host,
  preview,
  position = 'bottom-right',
  theme: themeOverride,
  themeMode = 'auto',
  greeting = "Hi there! 👋 I'm here to help. What can I do for you today?",
  agentName = 'Convio Assistant',
  agentAvatar,
  quickReplies,
  homeMenu,
  widgetWidth = 'default',
  launcherSize = 'default',
  borderRadius = 'default',
  headerGradient = true,
  headerTitle,
  headerSubtitle,
  showOnlineIndicator,
  launcherLabel,
  placeholderText,
  showPoweredBy,
  widgetHeight,
}: ChatWidgetProps) {
  const theme = { ...defaultTheme, ...themeOverride }
  const widget = useWidget({ agentId, publicKey, host, preview, position, theme, greeting, agentName, agentAvatar, quickReplies, homeMenu, widgetWidth, launcherSize, borderRadius, headerGradient, widgetHeight })

  const stateValue = {
    isOpen: widget.isOpen,
    isMinimized: widget.isMinimized,
    isEmbed: widget.isEmbed,
    entering: widget.entering,
    exiting: widget.exiting,
    messages: widget.messages,
    isTyping: widget.isTyping,
    isCreatingConversation: widget.isCreatingConversation,
    unreadCount: widget.unreadCount,
    error: widget.error,
    theme,
    agentName,
    agentAvatar: agentAvatar,
    quickReplies: quickReplies || [],
    streamingContent: widget.streamingContent,
    position,
    homeMenu: homeMenu || [],
    widgetWidth,
    launcherSize,
    borderRadius,
    headerGradient,
    headerTitle,
    headerSubtitle,
    showOnlineIndicator,
    launcherLabel,
    placeholderText,
    showPoweredBy,
    widgetHeight,
    onSendMessage: widget.sendMessage,
    onToggle: widget.toggleWidget,
    onClose: widget.closeWidget,
    onMinimize: () => widget.setIsMinimized((prev) => !prev),
    dismissError: () => widget.setError(null),
  }

  return createPortal(
    <WidgetStateProvider value={stateValue}>
      <WidgetStyles theme={theme} themeMode={themeMode} />
      <WidgetBackdrop show={widget.isOpen && !widget.isEmbed} onClose={widget.closeWidget} />
      <div className="convio-widget font-sans antialiased">
        <WidgetButton />
        <WidgetWindow />
      </div>
    </WidgetStateProvider>,
    document.body
  )
}
