import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { WidgetMessage as WidgetMessageType } from '@/hooks/useWidget'
import { useWidgetState } from './WidgetState'

interface WidgetMessageProps {
  message: WidgetMessageType
  showAvatar?: boolean
}

export function WidgetMessage({ message, showAvatar = false }: WidgetMessageProps) {
  const { agentAvatar, agentName } = useWidgetState()
  const isUser = message.role === 'user'

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  return (
    <div
      className={cn(
        'convio-msg flex gap-2 mb-3 animate-in fade-in slide-in-from-bottom-1 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && showAvatar && (
        <div className="mt-1 shrink-0">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              className="size-7 rounded-full object-cover ring-2 ring-[hsl(var(--widget-primary))]"
            />
          ) : (
            <div
              className="size-7 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 80%, black))`,
              }}
            >
              <span className="text-[9px] font-bold text-white">{initials}</span>
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          'group relative max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'rounded-2xl rounded-br-md text-white shadow-sm'
            : 'rounded-2xl rounded-bl-md text-[hsl(var(--widget-text))] bg-[hsl(var(--widget-muted))] shadow-sm',
          !isUser && !showAvatar && 'ml-9'
        )}
        style={
          isUser
            ? {
                background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 85%, black))`,
              }
            : undefined
        }
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            'absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-[hsl(var(--widget-muted-foreground))]',
            isUser ? 'right-0' : 'left-0'
          )}
        >
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
