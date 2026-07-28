import { Minus, X, Send } from 'lucide-react'
import { getWidgetCSSVariables } from '@/components/widget/WidgetStyles'
import { isLightColor } from '../helpers'

interface WidgetPreviewProps {
  primaryColor: string
  backgroundColor: string
  textColor: string
  promptBgColor: string
  headerGradientStart: string
  headerGradientEnd: string
  headerGradientDirection: number
  borderColor: string
  inputBgColor: string
  sendBtnColor: string
  position: 'bottom-right' | 'bottom-left'
  greeting: string
  agentName: string
  agentAvatar: string
  publicKey: string
  widgetHeight: number
}

export function WidgetPreview({
  primaryColor,
  backgroundColor,
  textColor,
  promptBgColor,
  headerGradientStart,
  headerGradientEnd,
  headerGradientDirection,
  borderColor,
  inputBgColor,
  sendBtnColor,
  greeting,
  agentName,
  agentAvatar,
  widgetHeight,
}: WidgetPreviewProps) {
  const initials = (agentName || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')
    .toUpperCase()

  const vars = getWidgetCSSVariables(
    {
      primaryColor,
      backgroundColor,
      textColor,
      promptBgColor,
      headerGradientStart,
      headerGradientEnd,
      headerGradientDirection,
      borderColor,
      inputBgColor,
      sendBtnColor,
    },
    true
  )

  return (
    <aside className="self-start lg:sticky lg:top-6" aria-label="Widget live preview">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10 shadow-sm">
        <div
          className="convio-widget flex flex-col overflow-hidden rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.06]"
          style={{
            height: widgetHeight,
            ...vars,
            backgroundColor: `hsl(var(--widget-bg))`,
          }}
        >
          {/* Header */}
          <div
            className="relative shrink-0 flex items-center justify-between px-4 h-[60px]"
                    style={{
                      background: `linear-gradient(${headerGradientDirection}deg, ${headerGradientStart}, ${headerGradientEnd})`,
                    }}
          >
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
            <div className="relative z-10 flex items-center gap-1">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Minimize"
              >
                <Minus className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <div className="text-center mb-3">
              <span className="text-[11px] font-medium text-[hsl(var(--widget-muted-foreground))]">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex gap-2 mb-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
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
              background: `linear-gradient(${headerGradientDirection}deg, ${headerGradientStart}, ${headerGradientEnd})`,
                    }}
                  >
                    <span className="text-[9px] font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              <div
                className="relative max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-bl-md shadow-sm"
                style={{
                  backgroundColor: `hsl(var(--widget-prompt-bg))`,
                  color: isLightColor(promptBgColor) ? '#1f2937' : textColor,
                }}
              >
                <p className="whitespace-pre-wrap break-words">
                  {greeting || 'Hi there! How can I help you today?'}
                </p>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-xl border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] px-3.5 py-2">
                <span className="text-[13px] leading-relaxed text-[hsl(var(--widget-muted-foreground))]/50">
                  Type a message...
                </span>
              </div>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 text-white"
                style={{
                  background: `hsl(var(--widget-send-btn))`,
                }}
              >
                <Send className="size-4 -rotate-45" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[hsl(var(--widget-muted-foreground))]/40 mt-2 font-medium">
              Powered by Convio
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
