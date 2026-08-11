import { Zap, Send, Smile, X, ChevronDown } from 'lucide-react'
import { getWidgetCSSVariables } from '@/components/widget/WidgetStyles'

interface WidgetPreviewPanelProps {
  primaryColor: string
  backgroundColor: string
  textColor: string
  promptBgColor: string
  headerGradientStart: string
  headerGradientEnd: string
  headerGradientDirection: string
  borderColor: string
  inputBgColor: string
  sendBtnColor: string
  footerBgColor: string
  agentName: string
  agentAvatar?: string
  headerTitle?: string
  headerSubtitle?: string
  showOnlineIndicator?: boolean
  placeholderText?: string
  showPoweredBy?: boolean
  quickReplies?: string[]
  headerGradient: boolean
  previewThemeMode: 'auto' | 'light' | 'dark'
}

export function WidgetPreviewPanel({
  primaryColor, backgroundColor, textColor, promptBgColor,
  headerGradientStart, headerGradientEnd, headerGradientDirection,
  borderColor, inputBgColor,   sendBtnColor,
  footerBgColor,
  agentName, agentAvatar, headerTitle, headerSubtitle,
  showOnlineIndicator, placeholderText, showPoweredBy, quickReplies,
  headerGradient, previewThemeMode,
}: WidgetPreviewPanelProps) {
  const isDark = previewThemeMode === 'dark'
  const theme = { primaryColor, backgroundColor, textColor, promptBgColor, headerGradientStart, headerGradientEnd, headerGradientDirection, borderColor, inputBgColor, sendBtnColor }
  const vars = getWidgetCSSVariables(theme, isDark)

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AI'

  const displayTitle = headerTitle || agentName || 'Assistant'
  const displaySubtitle = headerSubtitle || "We're online"
  const showOnline = showOnlineIndicator !== false
  const replies = quickReplies && quickReplies.length > 0 ? quickReplies.slice(0, 4) : ['What can you help with?', 'How does this work?', 'Tell me about Convio', 'Get started']

  const headerStyle = headerGradient
    ? { background: `linear-gradient(var(--widget-header-direction, 135deg), hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))` }
    : { background: `hsl(var(--widget-header-start))` }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden convio-widget-preview">
      <style
        dangerouslySetInnerHTML={{
          __html: `.convio-widget-preview { ${Object.entries(vars)
            .map(([k, v]) => `${k}: ${v};`)
            .join(' ')} }`,
        }}
      />
      {/* Header */}
      <div className="relative shrink-0" style={headerStyle}>
        <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {agentAvatar ? (
                <img src={agentAvatar} alt={agentName} className="size-9 rounded-full object-cover ring-2 ring-white/15" />
              ) : (
                <div className="size-9 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/15">
                  <span className="text-xs font-semibold text-white tracking-wide">{initials}</span>
                </div>
              )}
              {showOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--widget-header-start))]" />
              )}
            </div>
            <div className="min-w-0">
              {headerTitle && (
                <p className="text-[10px] text-white/50 font-medium leading-tight">{headerTitle}</p>
              )}
              <p className="truncate text-[13px] font-semibold text-white tracking-tight leading-tight">{displayTitle}</p>
              {showOnline && (
                <p className="text-[10px] text-emerald-300/70 font-medium flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                  {displaySubtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button type="button" className="flex size-7 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors">
              <ChevronDown className="size-3.5" />
            </button>
            <button type="button" className="flex size-7 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Welcome area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-5 overflow-auto" style={{ backgroundColor: `hsl(var(--widget-bg))` }}>
        <div className="flex flex-col items-center text-center w-full max-w-[260px]">
          <div className="relative mb-3.5">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="size-14 rounded-full object-cover" style={{ boxShadow: `0 0 0 3px hsl(var(--widget-primary) / 0.08)` }} />
            ) : (
              <div
                className="size-14 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))` }}
              >
                <span className="text-base font-semibold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 border-2 flex items-center justify-center" style={{ borderColor: `hsl(var(--widget-bg))` }}>
              <Zap className="size-2 text-white" />
            </div>
          </div>
          <h3 className="text-[14px] font-semibold mb-0.5 tracking-tight" style={{ color: `hsl(var(--widget-text))` }}>
            {agentName || 'Assistant'}
          </h3>
          <p className="text-[11px] mb-4 leading-relaxed px-2" style={{ color: `hsl(var(--widget-muted-foreground))` }}>
            {headerSubtitle || "Hi there! How can I help you today?"}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center w-full">
            {replies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all duration-150"
                style={{
                  borderColor: `hsl(var(--widget-primary) / 0.2)`,
                  backgroundColor: `hsl(var(--widget-primary) / 0.04)`,
                  color: `hsl(var(--widget-primary))`,
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t" style={{ borderColor: `hsl(var(--widget-border))`, backgroundColor: footerBgColor ? footerBgColor : `hsl(var(--widget-bg))` }}>
        <div className="flex items-end gap-1.5 p-2.5">
          <button type="button" className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors" style={{ color: `hsl(var(--widget-muted-foreground))` }}>
            <Smile className="size-4" />
          </button>
          <div className="flex-1 rounded-lg px-3 py-1.5" style={{ backgroundColor: `hsl(var(--widget-input-bg))` }}>
            <p className="text-[12px] leading-relaxed" style={{ color: `hsl(var(--widget-muted-foreground))`, opacity: 0.4 }}>
              {placeholderText || 'Enter your message...'}
            </p>
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full cursor-not-allowed"
            style={{ backgroundColor: `hsl(var(--widget-send-btn))`, color: `hsl(var(--widget-muted-foreground))` }}
          >
            <Send className="size-3.5" />
          </button>
        </div>
        {showPoweredBy !== false && (
          <p className="text-center text-[9px] pb-2 font-medium" style={{ color: `hsl(var(--widget-muted-foreground))`, opacity: 0.35 }}>
            Powered by Convio
          </p>
        )}
      </div>
    </div>
  )
}
