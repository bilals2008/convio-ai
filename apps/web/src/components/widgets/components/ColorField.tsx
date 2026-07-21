import { Check, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isLightColor } from '../helpers'

interface ColorFieldProps {
  label: string
  hint: string
  value: string
  onChange: (color: string) => void
  presets: readonly { label: string; color: string }[]
}

export function ColorField({ label, hint, value, onChange, presets }: ColorFieldProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <code className="font-mono text-[11px] tabular-nums text-muted-foreground/80">
          {value}
        </code>
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {presets.map((p) => {
          const selected = value === p.color
          return (
            <button
              key={p.color}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label}: ${p.label}`}
              onClick={() => onChange(p.color)}
              title={p.label}
              className={cn(
                'relative size-9 rounded-lg ring-1 transition-all duration-200',
                'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'ring-foreground/10 hover:ring-foreground/20',
              )}
              style={{ backgroundColor: p.color }}
            >
              {selected && (
                <Check
                  className="absolute inset-0 m-auto size-4 drop-shadow-sm"
                  style={{ color: isLightColor(p.color) ? '#1f2937' : '#ffffff' }}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}

        <label
          className={cn(
            'group relative flex size-9 items-center justify-center overflow-hidden rounded-lg ring-1 transition-all duration-200',
            'ring-foreground/10 hover:ring-foreground/20',
            'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
          )}
          title="Custom color"
        >
          <span
            className="absolute inset-0"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
          <span
            className="relative flex items-center justify-center rounded-md bg-background/80 px-1 py-0.5 backdrop-blur-sm"
            aria-hidden="true"
          >
            <Pipette className="size-3.5 text-foreground" />
          </span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Custom ${label.toLowerCase()}`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  )
}
