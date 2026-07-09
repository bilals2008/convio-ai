import { useWidgetState } from './WidgetState'

export function WidgetTyping() {
  const { agentAvatar, agentName } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  return (
    <div className="convio-typing flex items-start gap-2 mb-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="mt-1 shrink-0">
        {agentAvatar ? (
          <img
            src={agentAvatar}
            alt={agentName}
            className="size-7 rounded-full object-cover"
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
      <div className="rounded-2xl rounded-bl-md bg-[hsl(var(--widget-muted))] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full bg-[hsl(var(--widget-muted-foreground))]/50 animate-typing-dot"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="size-2 rounded-full bg-[hsl(var(--widget-muted-foreground))]/50 animate-typing-dot"
            style={{ animationDelay: '200ms' }}
          />
          <span
            className="size-2 rounded-full bg-[hsl(var(--widget-muted-foreground))]/50 animate-typing-dot"
            style={{ animationDelay: '400ms' }}
          />
        </div>
      </div>
    </div>
  )
}
