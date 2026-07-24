import { ExternalLink, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getContrastText, isLightColor } from '../helpers'
import type { PromptItem } from '../types'

interface WidgetPreviewProps {
  primaryColor: string
  backgroundColor: string
  textColor: string
  position: 'bottom-right' | 'bottom-left'
  greeting: string
  prompts: PromptItem[]
  agentName: string
  agentAvatar: string
  publicKey: string
}

export function WidgetPreview({
  primaryColor,
  backgroundColor,
  textColor,
  position,
  greeting,
  prompts,
  agentName,
  agentAvatar,
  publicKey,
}: WidgetPreviewProps) {
  const isLightBg = isLightColor(backgroundColor)
  const previewTextColor = isLightBg ? '#1f2937' : textColor
  const headerTextOnPrimary = getContrastText(primaryColor)
  const initials = (agentName || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')
    .toUpperCase()

  return (
    <aside className="lg:sticky lg:top-6" aria-label="Widget live preview">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
              <Eye className="size-3.5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-foreground">Live preview</span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            preview
          </span>
        </div>

        <div className="bg-muted/20 p-4">
          <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10 shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border/60 bg-card/60 px-3 py-2">
              <span className="size-2 rounded-full bg-destructive/40" aria-hidden="true" />
              <span className="size-2 rounded-full bg-warning/40" aria-hidden="true" />
              <span className="size-2 rounded-full bg-success/40" aria-hidden="true" />
              <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-background/60 px-2 py-0.5">
                <span className="size-2 shrink-0 rounded-full bg-success/70" aria-hidden="true" />
                <span className="truncate font-mono text-[9px] text-muted-foreground">
                  {publicKey.slice(0, 12)}…
                </span>
              </div>
            </div>

            <div
              className="relative transition-colors duration-200"
              style={{ backgroundColor, height: 280 }}
              role="img"
              aria-label="Widget appearance preview"
            >
              <div
                className="flex h-11 items-center gap-2 px-3"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))`,
                }}
              >
                <div
                  className="size-6 shrink-0 overflow-hidden rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${primaryColor}` }}
                >
                  {agentAvatar ? (
                    <img src={agentAvatar} alt="" className="size-full object-cover" />
                  ) : (
                    <span
                      className="flex size-full items-center justify-center text-[8px] font-bold"
                      style={{ color: headerTextOnPrimary }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
                <span
                  className="truncate text-[10px] font-semibold"
                  style={{ color: headerTextOnPrimary }}
                >
                  {agentName || 'Assistant'}
                </span>
              </div>

              <div className="px-3 pt-3">
                <div
                  className="inline-block max-w-[85%] rounded-xl rounded-bl-md px-2.5 py-1.5 text-[10px] leading-snug"
                  style={{
                    color: previewTextColor,
                    backgroundColor: `color-mix(in srgb, ${backgroundColor} 85%, ${isLightBg ? 'black' : 'white'})`,
                  }}
                >
                  {greeting || 'Hi there! How can I help you today?'}
                </div>
              </div>

              {prompts.length > 0 && (
                <div className="flex flex-wrap gap-1 px-3 pt-2">
                  {prompts.slice(0, 2).map((p) => (
                    <span
                      key={p.id}
                       className="inline-block rounded border px-2 py-0.5 text-[9px]"
                      style={{
                        borderColor: `color-mix(in srgb, ${primaryColor} 40%, transparent)`,
                        color: primaryColor,
                      }}
                    >
                      {p.text.length > 18 ? `${p.text.slice(0, 18)}…` : p.text}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  'absolute bottom-3 transition-all duration-200',
                  position === 'bottom-right' ? 'right-3' : 'left-3',
                )}
              >
                <div
                  className="flex size-8 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg
                    className="size-4"
                    style={{ color: headerTextOnPrimary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 bg-card px-4 py-2.5">
          <ExternalLink className="size-3 text-muted-foreground" aria-hidden="true" />
          <p className="text-[11px] text-muted-foreground">
            Static preview — open the live preview to test the full chat.
          </p>
        </div>
      </div>
    </aside>
  )
}
