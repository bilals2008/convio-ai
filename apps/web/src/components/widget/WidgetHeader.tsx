import { useWidgetState } from './WidgetState'
import { X, Minus } from 'lucide-react'

export function WidgetHeader() {
  const { agentName, agentAvatar, onClose, onMinimize } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  return (
    <div
      className="convio-header relative shrink-0 flex items-center justify-between px-4 h-[60px]"
      style={{
        background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 80%, black))`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              className="size-10 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <div className="size-10 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20">
              <span className="text-sm font-bold text-white tracking-wide">
                {initials}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-white tracking-tight leading-tight">
            {agentName || 'Assistant'}
          </p>
          <p className="text-[11px] text-white/70 font-medium">
            Typically replies instantly
          </p>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-0.5">
        <button
          type="button"
          onClick={onMinimize}
          className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Minimize"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
