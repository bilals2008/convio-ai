import { Move } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'

const HEIGHT_OPTIONS = [
  { label: 'Compact', value: 400 },
  { label: 'Default', value: 540 },
  { label: 'Tall', value: 640 },
] as const

const WIDTH_OPTIONS = [
  { label: 'Narrow', value: 'narrow' as const },
  { label: 'Default', value: 'default' as const },
  { label: 'Wide', value: 'wide' as const },
] as const

const LAUNCHER_SIZE_OPTIONS = [
  { label: 'Small', value: 'small' as const },
  { label: 'Default', value: 'default' as const },
  { label: 'Large', value: 'large' as const },
] as const

const BORDER_RADIUS_OPTIONS = [
  { label: 'Sharp', value: 'none' as const },
  { label: 'Rounded', value: 'default' as const },
  { label: 'Full', value: 'full' as const },
] as const

interface LayoutTabProps {
  position: 'bottom-right' | 'bottom-left'
  onPositionChange: (value: 'bottom-right' | 'bottom-left') => void
  widgetHeight: number
  onWidgetHeightChange: (value: number) => void
  widgetWidth: 'narrow' | 'default' | 'wide'
  onWidgetWidthChange: (value: 'narrow' | 'default' | 'wide') => void
  launcherSize: 'small' | 'default' | 'large'
  onLauncherSizeChange: (value: 'small' | 'default' | 'large') => void
  borderRadius: 'none' | 'default' | 'full'
  onBorderRadiusChange: (value: 'none' | 'default' | 'full') => void
}

export function LayoutTab({
  position,
  onPositionChange,
  widgetHeight,
  onWidgetHeightChange,
  widgetWidth,
  onWidgetWidthChange,
  launcherSize,
  onLauncherSizeChange,
  borderRadius,
  onBorderRadiusChange,
}: LayoutTabProps) {
  return (
    <SectionCard
      icon={<Move className="size-3.5" />}
      title="Layout"
      description="Position, size and shape of the widget window"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-foreground">Position</p>
          <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
            {(['bottom-right', 'bottom-left'] as const).map((pos) => (
              <button
                key={pos}
                role="radio"
                aria-checked={position === pos}
                onClick={() => onPositionChange(pos)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  position === pos
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {pos === 'bottom-right' ? 'Bottom right' : 'Bottom left'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-foreground">Height</p>
          <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
            {HEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="radio"
                aria-checked={widgetHeight === opt.value}
                onClick={() => onWidgetHeightChange(opt.value)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  widgetHeight === opt.value
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-foreground">Width</p>
          <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
            {WIDTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="radio"
                aria-checked={widgetWidth === opt.value}
                onClick={() => onWidgetWidthChange(opt.value)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  widgetWidth === opt.value
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-foreground">Launcher size</p>
          <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
            {LAUNCHER_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="radio"
                aria-checked={launcherSize === opt.value}
                onClick={() => onLauncherSizeChange(opt.value)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  launcherSize === opt.value
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-foreground">Corner radius</p>
          <div className="flex flex-wrap rounded-lg bg-muted/30 p-0.5" role="radiogroup">
            {BORDER_RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="radio"
                aria-checked={borderRadius === opt.value}
                onClick={() => onBorderRadiusChange(opt.value)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  borderRadius === opt.value
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
