import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { MessageCircle, X } from 'lucide-react'

const SIZE_MAP = { small: 'size-12', default: 'size-14', large: 'size-16' }
const SHAPE_MAP = {
  circle: 'rounded-full',
  pill: 'rounded-2xl',
  square: 'rounded-lg',
}

export function WidgetButton() {
  const { isOpen, isEmbed, unreadCount, agentAvatar, agentName, position, launcherSize, launcherLabel, launcherShape, launcherOffset, teaserMessage, teaserVisible, dismissTeaser, onToggle } = useWidgetState()

  if (isEmbed && isOpen) return null
  if (isOpen) return null

  const offset = launcherOffset ?? 0
  const posClass = position === 'bottom-left' ? 'left-5' : 'right-5'

  return (
    <>
      {/* Teaser bubble */}
      {teaserVisible && teaserMessage && (
        <div
          className={cn(
            'fixed z-[9999] flex items-center gap-1.5 rounded-xl bg-background px-3 py-1.5 text-xs text-foreground shadow-lg border border-border/40 cursor-pointer transition-all duration-300',
            position === 'bottom-left' ? 'left-5' : 'right-5',
          )}
          style={{ bottom: `${20 + offset + 56 + 8}px` }}
          onClick={dismissTeaser}
          role="button"
          tabIndex={0}
        >
          {teaserMessage}
          <X className="size-3 text-muted-foreground/50 shrink-0" />
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'convio-trigger group fixed z-[9999] flex shrink-0 items-center justify-center transition-all duration-300 ease-out hover:scale-105 active:scale-95 overflow-hidden',
          SIZE_MAP[launcherSize],
          SHAPE_MAP[launcherShape ?? 'circle'],
          posClass,
        )}
        style={{
          bottom: `${20 + offset}px`,
          background: agentAvatar
            ? `transparent`
            : `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 85%, black))`,
          boxShadow: agentAvatar ? 'none' : `0 4px 20px rgba(0,0,0,0.2)`,
          border: agentAvatar ? `3px solid hsl(var(--widget-primary))` : 'none',
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
            <img src={agentAvatar} alt={agentName} className="size-full object-cover" style={{ borderRadius: launcherShape === 'circle' ? '50%' : launcherShape === 'pill' ? '16px' : '8px' }} />
          ) : (
            <MessageCircle className="size-5 text-white" />
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
    </>
  )
}
