import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { MessageCircle, Sparkles, MessageSquareText, Headphones, Bot, HelpCircle, X } from 'lucide-react'

const SIZE_MAP = { small: 'size-12', default: 'size-14', large: 'size-16' }

const ICON_MAP = {
  chat: MessageCircle,
  sparkle: Sparkles,
  message: MessageSquareText,
  headphones: Headphones,
  bot: Bot,
  help: HelpCircle,
}

export function WidgetButton() {
  const { isOpen, isEmbed, unreadCount, agentAvatar, agentName, position, launcherSize, launcherIcon, launcherLabel, onToggle } = useWidgetState()

  const IconComponent = launcherIcon ? ICON_MAP[launcherIcon] : MessageCircle

  if (isEmbed && isOpen) return null
  if (isOpen) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'convio-trigger group fixed bottom-5 z-[9999] flex shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 overflow-hidden',
        SIZE_MAP[launcherSize],
        position === 'bottom-left' ? (launcherLabel ? 'left-5' : 'left-5') : (launcherLabel ? 'right-5' : 'right-5')
      )}
      style={{
        background: agentAvatar
          ? 'transparent'
          : `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 85%, black))`,
        boxShadow: agentAvatar
          ? `0 0 0 3px hsl(var(--widget-primary)), 0 4px 20px rgba(0,0,0,0.2)`
          : `0 4px 20px rgba(0,0,0,0.2)`,
      }}
      aria-label={launcherLabel || (isOpen ? 'Close chat' : 'Open chat')}
    >
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-300',
          isOpen ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
        )}
      >
        {agentAvatar ? (
          <img src={agentAvatar} alt={agentName} className="size-full rounded-full object-cover" />
        ) : (
          <IconComponent className="size-5 text-white" />
        )}
        {launcherLabel && (
          <span className="absolute -top-8 text-nowrap text-[10px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full shadow-sm border border-border">
            {launcherLabel}
          </span>
        )}
      </span>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-300',
          isOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
        )}
      >
        <X className="size-5 text-white" />
      </span>
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 flex min-w-[20px] h-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-in zoom-in duration-200">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
