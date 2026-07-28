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
    <div className="space-y-5">
      <SectionCard
        icon={<Move className="size-3.5" />}
        title="Widget"
        description="Position, size and shape of the widget window."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Position</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                <button
                  key={pos}
                  role="radio"
                  aria-checked={position === pos}
                  onClick={() => onPositionChange(pos)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    position === pos
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {pos === 'bottom-right' ? 'Right' : 'Left'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Height</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {HEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={widgetHeight === opt.value}
                  onClick={() => onWidgetHeightChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    widgetHeight === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Width</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {WIDTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={widgetWidth === opt.value}
                  onClick={() => onWidgetWidthChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    widgetWidth === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Launcher size</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {LAUNCHER_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={launcherSize === opt.value}
                  onClick={() => onLauncherSizeChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    launcherSize === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Corner radius</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {BORDER_RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={borderRadius === opt.value}
                  onClick={() => onBorderRadiusChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    borderRadius === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
