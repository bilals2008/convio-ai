import { Move, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { WidgetConfig } from '../types'
import {
  HEIGHT_OPTIONS,
  WIDTH_OPTIONS,
  LAUNCHER_SIZE_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  MOBILE_BEHAVIOR_OPTIONS,
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
      onSelect: (v) => onChange({ widgetHeight: Number(v) }),
    },
    {
      label: 'Width',
      value: widgetWidth,
      options: WIDTH_OPTIONS,
      onSelect: (v) => onChange({ widgetWidth: v as WidgetConfig['widgetWidth'] }),
    },
    {
      label: 'Launcher size',
      value: launcherSize,
      options: LAUNCHER_SIZE_OPTIONS,
      onSelect: (v) => onChange({ launcherSize: v as WidgetConfig['launcherSize'] }),
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
                    <span className="text-[10px] leading-none font-medium">?</span>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4} className="max-w-[200px]">
                    <Smartphone className="size-3 shrink-0" />
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
    </SectionCard>
  )
}
