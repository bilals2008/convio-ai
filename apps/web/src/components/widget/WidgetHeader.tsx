import { useWidgetState } from './WidgetState'
import { ChevronDown, MessageSquarePlus, X } from 'lucide-react'

export function WidgetHeader() {
  const { agentName, agentAvatar, isEmbed, headerGradient, headerTitle, headerSubtitle, showOnlineIndicator, messages, isTyping, onMinimize, onClose, onClearChat } = useWidgetState()

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  const displayTitle = (headerTitle?.trim()) || agentName || 'Assistant'
  const showOnline = showOnlineIndicator !== false
  const subtitle = headerSubtitle?.trim()
  const displaySubtitle = subtitle || (showOnline ? "We're online" : '')

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
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b-2 border-[hsl(var(--widget-header-icon)_/_0.1)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="size-9 rounded-full object-cover ring-2 ring-[hsl(var(--widget-header-icon)_/_0.2)] sm:size-11"
              />
            ) : (
              <div className="size-9 rounded-full bg-[hsl(var(--widget-header-icon)_/_0.15)] flex items-center justify-center ring-2 ring-[hsl(var(--widget-header-icon)_/_0.2)] sm:size-11">
                <span className="text-xs font-bold text-[hsl(var(--widget-header-title))] tracking-wide sm:text-sm">
                  {initials}
                </span>
              </div>
            )}
            {showOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[hsl(var(--widget-header-online))] border-2 border-[hsl(var(--widget-header-start))] sm:size-3.5" />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-[13px] font-semibold text-[hsl(var(--widget-header-title))] tracking-tight leading-tight sm:text-[14px]">
              {displayTitle}
            </p>
            {displaySubtitle && (
              <p className="text-[9px] text-[hsl(var(--widget-header-subtitle))] font-medium sm:text-[10px]">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-0.5">
          <button
            type="button"
            onClick={onClearChat}
            disabled={isTyping || messages.length === 0}
            className="flex size-8 items-center justify-center rounded-lg text-[hsl(var(--widget-header-icon)_/_0.6)] hover:bg-[hsl(var(--widget-header-icon)_/_0.1)] hover:text-[hsl(var(--widget-header-icon))] transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[hsl(var(--widget-header-icon)_/_0.6)]"
            aria-label="Start new chat"
            title="Start new chat"
          >
            <MessageSquarePlus className="size-4" />
          </button>
          {!isEmbed && (
            <button
              type="button"
              onClick={onMinimize}
              className="flex size-8 items-center justify-center rounded-lg text-[hsl(var(--widget-header-icon)_/_0.6)] hover:bg-[hsl(var(--widget-header-icon)_/_0.1)] hover:text-[hsl(var(--widget-header-icon))] transition-colors"
              aria-label="Minimize"
            >
              <ChevronDown className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-[hsl(var(--widget-header-icon)_/_0.6)] hover:bg-[hsl(var(--widget-header-icon)_/_0.1)] hover:text-[hsl(var(--widget-header-icon))] transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
