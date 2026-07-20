import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { MessageCircle, X } from 'lucide-react'

export function WidgetButton() {
  const { isOpen, isEmbed, unreadCount, agentAvatar, agentName, position, onToggle } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  // In embed mode the open window fills the whole iframe, so the floating
  // toggle would overlap the input row. Hide it while open.
  if (isEmbed && isOpen) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'convio-trigger group fixed bottom-5 z-[9999] flex size-14 shrink-0 items-center justify-center rounded-full shadow-lg shadow-black/20 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-black/25 overflow-hidden',
        position === 'bottom-left' ? 'left-5' : 'right-5'
      )}
      style={{
        backgroundColor: agentAvatar ? 'transparent' : `hsl(var(--widget-primary))`,
        boxShadow: agentAvatar ? `0 0 0 3px hsl(var(--widget-primary))` : undefined,
      }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
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
          <MessageCircle className="size-5 text-[hsl(var(--widget-primary-foreground))]" />
        )}
      </span>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-300',
          isOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
        )}
      >
        <X className="size-5 text-[hsl(var(--widget-primary-foreground))]" />
      </span>
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 flex min-w-[20px] h-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-in zoom-in duration-200">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
