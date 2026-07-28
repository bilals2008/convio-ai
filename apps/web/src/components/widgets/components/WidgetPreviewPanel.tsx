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
  borderColor, inputBgColor, sendBtnColor,
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
    ? { background: `linear-gradient(${headerGradientDirection || '135deg'}, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))` }
    : { background: `hsl(var(--widget-header-start))` }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-2xl convio-widget-preview">
      <style
        dangerouslySetInnerHTML={{
          __html: `.convio-widget-preview { ${Object.entries(vars)
            .map(([k, v]) => `${k}: ${v};`)
            .join(' ')} }`,
        }}
      />
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden" style={headerStyle}>
        <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b-2 border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {agentAvatar ? (
                <img src={agentAvatar} alt={agentName} className="size-11 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="size-11 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20">
                  <span className="text-sm font-bold text-white tracking-wide">{initials}</span>
                </div>
              )}
              {showOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 border-2 border-[hsl(var(--widget-header-start))]" />
              )}
            </div>
            <div className="min-w-0">
              {headerTitle && (
                <p className="text-[11px] text-white/60 font-medium leading-tight">{headerTitle}</p>
              )}
              <p className="truncate text-[14px] font-semibold text-white tracking-tight leading-tight">{displayTitle}</p>
              {showOnline && (
                <p className="text-[10px] text-emerald-300/80 font-medium flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                  {displaySubtitle}
                </p>
              )}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-0.5">
            <button type="button" className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <ChevronDown className="size-4" />
            </button>
            <button type="button" className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Welcome area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 overflow-auto" style={{ backgroundColor: `hsl(var(--widget-bg))` }}>
        <div className="flex flex-col items-center text-center w-full max-w-[280px]">
          <div className="relative mb-4">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="size-16 rounded-full object-cover" style={{ boxShadow: `0 0 0 4px hsl(var(--widget-primary) / 0.1)` }} />
            ) : (
              <div
                className="size-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))` }}
              >
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 flex items-center justify-center" style={{ borderColor: `hsl(var(--widget-bg))` }}>
              <Zap className="size-2.5 text-white" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold mb-1 tracking-tight" style={{ color: `hsl(var(--widget-text))` }}>
            {agentName || 'Assistant'}
          </h3>
          <p className="text-[12px] mb-5 leading-relaxed px-2" style={{ color: `hsl(var(--widget-muted-foreground))` }}>
            {headerSubtitle || "Hi there! How can I help you today?"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {replies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="rounded-full border px-4 py-2 text-[12px] font-medium transition-all duration-150"
                style={{
                  borderColor: `hsl(var(--widget-primary) / 0.3)`,
                  backgroundColor: `hsl(var(--widget-primary) / 0.06)`,
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
      <div className="shrink-0 border-t" style={{ borderColor: `hsl(var(--widget-border))`, backgroundColor: `hsl(var(--widget-bg))` }}>
        <div className="flex items-end gap-2 p-3">
          <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors" style={{ color: `hsl(var(--widget-muted-foreground))` }}>
            <Smile className="size-5" />
          </button>
          <div className="flex-1 rounded-xl px-3.5 py-2" style={{ backgroundColor: `hsl(var(--widget-muted))` }}>
            <p className="text-[13px] leading-relaxed" style={{ color: `hsl(var(--widget-muted-foreground))`, opacity: 0.5 }}>
              {placeholderText || 'Enter your message...'}
            </p>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full cursor-not-allowed"
            style={{ backgroundColor: `hsl(var(--widget-muted))`, color: `hsl(var(--widget-muted-foreground))` }}
          >
            <Send className="size-4" />
          </button>
        </div>
        {showPoweredBy !== false && (
          <p className="text-center text-[10px] pb-2.5 font-medium" style={{ color: `hsl(var(--widget-muted-foreground))`, opacity: 0.4 }}>
            Powered by Convio
          </p>
        )}
      </div>
    </div>
  )
}
