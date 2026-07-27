import { Maximize2, Move } from 'lucide-react'
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
    <>
      <SectionCard
        icon={<Move className="size-3.5" />}
        title="Launcher position"
        description="Where the floating launcher appears on the page."
      >
        <div
          className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5"
          role="radiogroup"
          aria-label="Launcher position"
        >
          {(['bottom-right', 'bottom-left'] as const).map((pos) => (
            <button
              key={pos}
              role="radio"
              aria-checked={position === pos}
              onClick={() => onPositionChange(pos)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                position === pos
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'relative size-3.5 rounded-sm border',
                  position === pos ? 'border-primary-foreground/40' : 'border-current/40',
                )}
              >
                <span
                  className={cn(
                    'absolute size-1.5 rounded-full',
                    pos === 'bottom-right' ? 'bottom-0 right-0' : 'bottom-0 left-0',
                    position === pos ? 'bg-primary-foreground' : 'bg-current',
                  )}
                />
              </span>
              {pos === 'bottom-right' ? 'Right' : 'Left'}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        icon={<Maximize2 className="size-3.5" />}
        title="Widget height"
        description="Set how tall the widget appears on your site."
      >
        <div
          className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5"
          role="radiogroup"
          aria-label="Widget height"
        >
          {HEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={widgetHeight === opt.value}
              onClick={() => onWidgetHeightChange(opt.value)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 text-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                widgetHeight === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
              <span className="ml-1 font-mono text-[10px] opacity-60">
                {opt.value}px
              </span>
            </button>
          ))}
        </div>
      </SectionCard>
    </>
  )
}
