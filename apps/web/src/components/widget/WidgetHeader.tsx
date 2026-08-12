import { useWidgetState } from './WidgetState'
import { ChevronDown, X } from 'lucide-react'

export function WidgetHeader() {
  const { agentName, agentAvatar, isEmbed, headerGradient, headerTitle, headerSubtitle, showOnlineIndicator, onMinimize, onClose } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  const displayTitle = headerTitle || agentName || 'Assistant'
  const displaySubtitle = headerSubtitle || 'We\'re online'
  const showOnline = showOnlineIndicator !== false

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
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b-2 border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="size-9 rounded-full object-cover ring-2 ring-white/20 sm:size-11"
              />
            ) : (
              <div className="size-9 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20 sm:size-11">
                <span className="text-xs font-bold text-white tracking-wide sm:text-sm">
                  {initials}
                </span>
              </div>
            )}
            {showOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--widget-header-start))] sm:size-3.5" />
            )}
          </div>
          <div className="min-w-0">
            {headerTitle && (
              <p className="text-[10px] text-white/60 font-medium leading-tight sm:text-[11px]">
                {headerTitle}
              </p>
            )}
            <p className="truncate text-[13px] font-semibold text-white tracking-tight leading-tight sm:text-[14px]">
              {displayTitle}
            </p>
            {showOnline && (
              <p className="text-[9px] text-emerald-300/80 font-medium flex items-center gap-1 sm:text-[10px]">
                <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                {displaySubtitle}
              </p>
            )}
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
