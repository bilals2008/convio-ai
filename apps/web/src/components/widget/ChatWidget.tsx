import { createPortal } from 'react-dom'
import { useWidget, type WidgetTheme } from '@/hooks/useWidget'
import { WidgetStateProvider } from './WidgetState'
import { WidgetStyles } from './WidgetStyles'
import { WidgetButton } from './WidgetButton'
import { WidgetWindow } from './WidgetWindow'
import { cn } from '@/lib/utils'

export interface ChatWidgetProps {
  agentId: string
  publicKey: string
  host?: string
  visitorId?: string
  widgetToken?: string
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
  mobileBehavior?: 'default' | 'fullscreen'
  launcherShape?: 'circle' | 'pill' | 'square'
  customWidth?: number
  customHeight?: number
  launcherOffset?: number
  teaserMessage?: string
  teaserDelay?: number
  hiddenPages?: string[]
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
  visitorId,
  widgetToken,
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
  mobileBehavior = 'default',
  launcherShape = 'circle',
  customWidth = 0,
  customHeight = 0,
  launcherOffset = 0,
  teaserMessage = '',
  teaserDelay = 5,
  hiddenPages = [],
}: ChatWidgetProps) {
  const theme = { ...defaultTheme, ...themeOverride }
  const widget = useWidget({ agentId, publicKey, host, visitorId, widgetToken, preview, position, theme, greeting, agentName, agentAvatar, quickReplies, homeMenu, widgetWidth, launcherSize, borderRadius, headerGradient, widgetHeight, mobileBehavior, launcherShape, customWidth, customHeight, launcherOffset, teaserMessage, teaserDelay, hiddenPages })
  // Fullscreen windows are edge-to-edge — sharp corners regardless of setting.
  const effectiveBorderRadius = widget.isFullscreen ? 'none' : borderRadius

  const stateValue = {
    isOpen: widget.isOpen,
    isMinimized: widget.isMinimized,
    isEmbed: widget.isEmbed,
    entering: widget.entering,
    exiting: widget.exiting,
    messages: widget.messages,
    pendingQuestions: widget.pendingQuestions,
    onAnswerQuestions: widget.answerQuestions,
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
    borderRadius: effectiveBorderRadius,
    launcherShape,
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
    onClearChat: widget.clearChat,
    dismissError: () => widget.setError(null),
    isHidden: widget.isHidden,
    teaserMessage,
    teaserVisible: widget.teaserVisible,
    dismissTeaser: widget.dismissTeaser,
    launcherShape: widget.launcherShape,
    launcherOffset: widget.LAUNCHER_OFFSET,
  }

  if (widget.isHidden) return null

  return createPortal(
    <WidgetStateProvider value={stateValue}>
      <WidgetStyles theme={theme} themeMode={themeMode} />
      <WidgetBackdrop show={widget.isOpen && !widget.isEmbed} onClose={widget.closeWidget} />
      <div className="convio-widget font-sans antialiased" style={{ background: 'transparent' }}>
        <WidgetButton />
        <WidgetWindow />
      </div>
    </WidgetStateProvider>,
    document.body
  )
}
