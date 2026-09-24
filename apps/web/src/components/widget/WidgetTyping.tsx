import { useWidgetState } from './WidgetState'

export function WidgetTyping() {
  const { agentAvatar, agentName } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  return (
    <div className="convio-typing mb-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200" role="status" aria-label="Assistant is thinking">
      <div className="shrink-0">
        {agentAvatar ? (
          <img
            src={agentAvatar}
            alt={agentName}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-7 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 80%, black))`,
            }}
          >
            <span className="text-[9px] font-bold text-white">{initials}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] leading-none text-[hsl(var(--widget-muted-foreground))]">Thinking…</span>
    </div>
  )
}
