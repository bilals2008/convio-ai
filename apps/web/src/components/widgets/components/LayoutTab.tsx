import { Move } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'

const HEIGHT_OPTIONS = [
  { label: 'Compact', value: 400 },
  { label: 'Default', value: 540 },
  { label: 'Tall', value: 640 },
] as const

interface LayoutTabProps {
  position: 'bottom-right' | 'bottom-left'
  onPositionChange: (value: 'bottom-right' | 'bottom-left') => void
  widgetHeight: number
  onWidgetHeightChange: (value: number) => void
}

export function LayoutTab({
  position,
  onPositionChange,
  widgetHeight,
  onWidgetHeightChange,
}: LayoutTabProps) {
  return (
    <SectionCard
      icon={<Move className="size-3.5" />}
      title="Layout"
      description="Position and size of the launcher widget."
    >
      <div className="space-y-5">
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
      </div>
    </SectionCard>
  )
}
