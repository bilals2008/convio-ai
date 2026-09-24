import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useWidget, type WidgetMessage, type WidgetTheme } from '@/hooks/useWidget'
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
  currentPath?: string
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
  /** Bottom offset of the open chat window. Defaults to 80px (clears the launcher). */
  windowBottomOffset?: number
  showTeaser?: boolean
  teaserMessage?: string
  teaserDelay?: number
  hiddenPages?: string[]
  /** Portal target for the widget tree. Defaults to document.body. */
  portalContainer?: HTMLElement | null
  /** Render open on first paint (preview only). */
  defaultOpen?: boolean
  /** Use local sample replies in the widget configuration preview only. */
  demoResponses?: boolean
}

function createDemoMessages(): WidgetMessage[] {
  const timestamp = new Date()
  return [
    {
      id: 'demo-user-1',
      role: 'user',
      content: 'What can you help me with?',
      timestamp,
    },
    {
      id: 'demo-assistant-1',
      role: 'assistant',
      content: '## I can help with that\n\nI can answer questions and guide you through common tasks. For example, I can help you:\n\n- Find the right information\n- Understand your options\n- Get started with the next step\n\nWhat would you like to know?',
      timestamp,
    },
  ]
}

const DEMO_REPLY = '## Happy to help\n\nTell me a little more about what you need, and I’ll point you in the right direction.\n\n- I can explain your options\n- I can walk you through the next steps'

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
  currentPath,
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
  windowBottomOffset,
  showTeaser = true,
  teaserMessage = '',
  teaserDelay = 5,
  hiddenPages = [],
  portalContainer,
  defaultOpen,
  demoResponses = false,
}: ChatWidgetProps) {
  const theme = { ...defaultTheme, ...themeOverride }
  const widget = useWidget({ agentId, publicKey, host, visitorId, currentPath, widgetToken, preview, position, theme, greeting, agentName, agentAvatar, quickReplies, homeMenu, widgetWidth, launcherSize, borderRadius, headerGradient, widgetHeight, mobileBehavior, launcherShape, customWidth, customHeight, launcherOffset, showTeaser, teaserMessage, teaserDelay, hiddenPages, defaultOpen })
  const isDemoMode = Boolean(preview && demoResponses)
  const [demoMessages, setDemoMessages] = useState<WidgetMessage[]>(() =>
    isDemoMode ? createDemoMessages() : [],
  )
  const [demoTyping, setDemoTyping] = useState(false)
  const demoReplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (demoReplyTimer.current) clearTimeout(demoReplyTimer.current)
  }, [])

  const sendDemoMessage = (content: string) => {
    const timestamp = new Date()
    setDemoMessages((messages) => [
      ...messages,
      { id: crypto.randomUUID(), role: 'user', content, timestamp },
    ])
    setDemoTyping(true)
    demoReplyTimer.current = window.setTimeout(() => {
      setDemoMessages((messages) => [
        ...messages,
        { id: crypto.randomUUID(), role: 'assistant', content: DEMO_REPLY, timestamp: new Date() },
      ])
      setDemoTyping(false)
      demoReplyTimer.current = null
    }, 500)
  }
  // Fullscreen windows are edge-to-edge — sharp corners regardless of setting.
  const effectiveBorderRadius = widget.isFullscreen ? 'none' : borderRadius

  const stateValue = {
    isOpen: widget.isOpen,
    isMinimized: widget.isMinimized,
    isEmbed: widget.isEmbed,
    entering: widget.entering,
    exiting: widget.exiting,
    messages: isDemoMode ? demoMessages : widget.messages,
    pendingQuestions: isDemoMode ? null : widget.pendingQuestions,
    onAnswerQuestions: widget.answerQuestions,
    isTyping: isDemoMode ? demoTyping : widget.isTyping,
    isCreatingConversation: isDemoMode ? false : widget.isCreatingConversation,
    unreadCount: widget.unreadCount,
    error: isDemoMode ? null : widget.error,
    theme,
    agentName,
    agentAvatar: agentAvatar,
    greeting,
    quickReplies: quickReplies || [],
    streamingContent: widget.streamingContent,
    position,
    homeMenu: homeMenu || [],
    widgetWidth,
    launcherSize,
    borderRadius: effectiveBorderRadius,
    launcherShape: widget.launcherShape,
    customWidth,
    customHeight,
    windowBottomOffset,
    headerGradient,
    headerTitle,
    headerSubtitle,
    showOnlineIndicator,
    launcherLabel,
    placeholderText,
    showPoweredBy,
    widgetHeight,
    onSendMessage: isDemoMode ? sendDemoMessage : widget.sendMessage,
    onToggle: widget.toggleWidget,
    onClose: widget.closeWidget,
    onMinimize: () => widget.setIsMinimized((prev) => !prev),
    onClearChat: isDemoMode
      ? () => {
          if (demoReplyTimer.current) clearTimeout(demoReplyTimer.current)
          demoReplyTimer.current = null
          setDemoMessages(createDemoMessages())
          setDemoTyping(false)
        }
      : widget.clearChat,
    dismissError: () => widget.setError(null),
    isHidden: widget.isHidden,
    teaserMessage,
    teaserVisible: widget.teaserVisible,
    dismissTeaser: widget.dismissTeaser,
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
    portalContainer ?? document.body
  )
}
