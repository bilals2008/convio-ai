import { useState } from 'react'
import { Move, HelpCircle, Plus, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { WidgetConfig } from '../types'
import {
  HEIGHT_OPTIONS,
  WIDTH_OPTIONS,
  LAUNCHER_SIZE_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  MOBILE_BEHAVIOR_OPTIONS,
  LAUNCHER_SHAPE_OPTIONS,
} from '../constants'

interface LayoutTabProps {
  config: WidgetConfig
  onChange: (patch: Partial<WidgetConfig>) => void
}

export function LayoutTab({ config, onChange }: LayoutTabProps) {
  const position = config.position ?? 'bottom-right'
  const widgetHeight = config.widgetHeight ?? 540
  const widgetWidth = config.widgetWidth ?? 'default'
  const launcherSize = config.launcherSize ?? 'default'
  const borderRadius = config.borderRadius ?? 'default'
  const mobileBehavior = config.mobileBehavior ?? 'default'
  const launcherShape = config.launcherShape ?? 'circle'
  const customWidth = config.customWidth ?? 0
  const customHeight = config.customHeight ?? 0
  const launcherOffset = config.launcherOffset ?? 0
  const showTeaser = config.showTeaser !== false
  const teaserMessage = config.teaserMessage ?? ''
  const teaserDelay = config.teaserDelay ?? 5
  const hiddenPages = config.hiddenPages ?? []

  const fields: {
    label: string
    value: string | number
    options: readonly { value: string | number; label: string }[]
    onSelect: (value: string) => void
    tooltip?: string
  }[] = [
    {
      label: 'Position',
      value: position,
      options: [
        { value: 'bottom-right', label: 'Bottom right' },
        { value: 'bottom-left', label: 'Bottom left' },
      ],
      onSelect: (v) => onChange({ position: v as WidgetConfig['position'] }),
    },
    {
      label: 'Height',
      value: widgetHeight,
      options: HEIGHT_OPTIONS,
      onSelect: (v) => onChange({ widgetHeight: Number(v), customHeight: 0 }),
    },
    {
      label: 'Width',
      value: widgetWidth,
      options: WIDTH_OPTIONS,
      onSelect: (v) => onChange({ widgetWidth: v as WidgetConfig['widgetWidth'], customWidth: 0 }),
    },
    {
      label: 'Launcher size',
      value: launcherSize,
      options: LAUNCHER_SIZE_OPTIONS,
      onSelect: (v) => onChange({ launcherSize: v as WidgetConfig['launcherSize'] }),
    },
    {
      label: 'Launcher shape',
      value: launcherShape,
      options: LAUNCHER_SHAPE_OPTIONS,
      onSelect: (v) => onChange({ launcherShape: v as WidgetConfig['launcherShape'] }),
    },
    {
      label: 'Corner radius',
      value: borderRadius,
      options: BORDER_RADIUS_OPTIONS,
      onSelect: (v) => onChange({ borderRadius: v as WidgetConfig['borderRadius'] }),
    },
    {
      label: 'On mobile',
      value: mobileBehavior,
      options: MOBILE_BEHAVIOR_OPTIONS,
      onSelect: (v) => onChange({ mobileBehavior: v as WidgetConfig['mobileBehavior'] }),
      tooltip: 'Fullscreen opens the widget edge-to-edge on small screens.',
    },
  ]

  const [pagePatternInput, setPagePatternInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const addPagePattern = () => {
    const p = pagePatternInput.trim()
    if (!p || hiddenPages.includes(p) || hiddenPages.length >= 20) return
    onChange({ hiddenPages: [...hiddenPages, p] })
    setPagePatternInput('')
  }

  const removePagePattern = (pattern: string) => {
    onChange({ hiddenPages: hiddenPages.filter((x) => x !== pattern) })
  }

  return (
    <SectionCard
      icon={<Move className="size-3.5" />}
      title="Layout"
      description="Position, size and shape of the widget window"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-foreground">{field.label}</p>
              {field.tooltip && (
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label={field.tooltip}
                  >
                    <HelpCircle className="size-3" />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4} className="max-w-[200px]">
                    {field.tooltip}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
              {field.options.map((opt) => (
                <button
                  key={String(opt.value)}
                  role="radio"
                  aria-checked={field.value === opt.value}
                  onClick={() => field.onSelect(String(opt.value))}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    field.value === opt.value
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced controls — collapsed by default */}
      <div className="mt-6 border-t border-border/40 pt-5">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className={cn('size-3.5 transition-transform', showAdvanced && 'rotate-90')} />
          Advanced
        </button>
        {showAdvanced && (<div className="mt-4 space-y-4">
          {/* Custom width / height sliders */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Width</span>
                <span className="text-[11px] font-mono text-muted-foreground/60 tabular-nums">{customWidth > 0 ? `${customWidth}px` : 'auto'}</span>
              </div>
              <input type="range" min={0} max={500} step={10} value={customWidth} onChange={(e) => onChange({ customWidth: Number(e.target.value) })} className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
              <p className="text-[11px] text-muted-foreground/50">0 = use preset above</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Height</span>
                <span className="text-[11px] font-mono text-muted-foreground/60 tabular-nums">{customHeight > 0 ? `${customHeight}px` : 'auto'}</span>
              </div>
              <input type="range" min={0} max={1200} step={10} value={customHeight} onChange={(e) => onChange({ customHeight: Number(e.target.value) })} className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
              <p className="text-[11px] text-muted-foreground/50">0 = use preset above</p>
            </div>
          </div>

          {/* Launcher offset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Bottom spacing</span>
              <span className="text-[11px] font-mono text-muted-foreground/60 tabular-nums">{launcherOffset}px</span>
            </div>
            <input type="range" min={0} max={200} step={5} value={launcherOffset} onChange={(e) => onChange({ launcherOffset: Number(e.target.value) })} className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
            <p className="text-[11px] text-muted-foreground/50">Offset from bottom edge — useful if a cookie banner overlaps the launcher.</p>
          </div>

          {/* Teaser message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Teaser message</span>
              <Switch checked={showTeaser} onCheckedChange={(v) => onChange({ showTeaser: v })} />
            </div>
            {showTeaser && (
              <div className="space-y-3 rounded-lg border border-border/40 bg-muted/20 p-3">
                <Input value={teaserMessage} onChange={(e) => onChange({ teaserMessage: e.target.value })} placeholder="Need help? Chat with us" maxLength={80} className="h-8 text-xs" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Show after</span>
                  <input type="number" min={1} max={60} value={teaserDelay} onChange={(e) => onChange({ teaserDelay: Number(e.target.value) || 5 })} className="h-7 w-14 rounded-md border border-border bg-muted/30 px-2 text-center text-xs tabular-nums" />
                  <span className="text-[11px] text-muted-foreground">seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden pages */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground">Hide widget on pages</span>
            <div className="flex flex-wrap gap-1.5">
              {hiddenPages.map((pattern) => (
                <span key={pattern} className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 px-2 py-0.5 text-[11px] text-foreground font-mono">
                  {pattern}
                  <button type="button" onClick={() => removePagePattern(pattern)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Input value={pagePatternInput} onChange={(e) => setPagePatternInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPagePattern() } }} placeholder="/checkout, /admin/*" className="h-8 text-xs flex-1 min-w-[140px]" maxLength={200} />
              <Button type="button" size="sm" className="h-8 text-xs" onClick={addPagePattern} disabled={!pagePatternInput.trim()}>
                <Plus className="size-3" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/50">URL path prefixes. Supports trailing * as wildcard (e.g. /admin/*).</p>
          </div>
        </div>)}
      </div>
    </SectionCard>
  )
}
