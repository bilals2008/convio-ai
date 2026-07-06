import { createPortal } from 'react-dom'
import { useWidget, type WidgetTheme } from '@/hooks/useWidget'
import { WidgetStateProvider } from './WidgetState'
import { WidgetStyles } from './WidgetStyles'
import { WidgetButton } from './WidgetButton'
import { WidgetWindow } from './WidgetWindow'
import { cn } from '@/lib/utils'

export interface ChatWidgetProps {
  botId: string
  position?: 'bottom-right' | 'bottom-left'
  theme?: Partial<WidgetTheme>
  greeting?: string
  botName?: string
  botAvatar?: string
  quickReplies?: string[]
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#fb923c',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
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
  botId,
  position = 'bottom-right',
  theme: themeOverride,
  greeting = "Hi there! 👋 I'm here to help. What can I do for you today?",
  botName = 'Convio Assistant',
  botAvatar,
  quickReplies,
}: ChatWidgetProps) {
  const theme = { ...defaultTheme, ...themeOverride }
  const widget = useWidget({ botId, position, theme, greeting, botName, botAvatar, quickReplies })

  const stateValue = {
    isOpen: widget.isOpen,
    isMinimized: widget.isMinimized,
    entering: widget.entering,
    exiting: widget.exiting,
    messages: widget.messages,
    isTyping: widget.isTyping,
    unreadCount: widget.unreadCount,
    error: widget.error,
    theme,
    botName,
    botAvatar: botAvatar,
    quickReplies: quickReplies || [],
    position,
    onSendMessage: widget.sendMessage,
    onToggle: widget.toggleWidget,
    onClose: widget.closeWidget,
    onMinimize: () => widget.setIsMinimized((prev) => !prev),
  }

  return createPortal(
    <WidgetStateProvider value={stateValue}>
      <WidgetStyles theme={theme} />
      <WidgetBackdrop show={widget.isOpen} onClose={widget.closeWidget} />
      <div className="convio-widget font-sans antialiased">
        <WidgetButton />
        <WidgetWindow />
      </div>
    </WidgetStateProvider>,
    document.body
  )
}
