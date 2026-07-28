import { useWidgetState } from './WidgetState'
import { ChevronDown, X } from 'lucide-react'

export function WidgetHeader() {
  const { agentName, agentAvatar, isEmbed, headerGradient, onMinimize, onClose } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  return (
    <div
      className="convio-header relative shrink-0 sm:rounded-t-2xl overflow-hidden"
      style={
        headerGradient
          ? {
              background: `linear-gradient(var(--widget-header-direction, 135deg), hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))`,
            }
          : {
              background: `hsl(var(--widget-header-start))`,
            }
      }
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="size-11 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="size-11 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20">
                <span className="text-sm font-bold text-white tracking-wide">
                  {initials}
                </span>
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 border-2 border-[hsl(var(--widget-header-start))]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/60 font-medium leading-tight">
              Chat with
            </p>
            <p className="truncate text-[14px] font-semibold text-white tracking-tight leading-tight">
              {agentName || 'Assistant'}
            </p>
            <p className="text-[10px] text-emerald-300/80 font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
              We&apos;re online
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-0.5">
          {!isEmbed && (
            <button
              type="button"
              onClick={onMinimize}
              className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Minimize"
            >
              <ChevronDown className="size-4" />
            </button>
          )}
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
    </div>
  )
}
