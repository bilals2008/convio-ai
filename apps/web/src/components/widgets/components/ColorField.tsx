import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Check, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isLightColor } from '../helpers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface ColorPreset {
  label: string
  color: string
}

interface ColorFieldProps {
  label: string
  description?: string
  value: string
  onChange: (color: string) => void
  presets: readonly ColorPreset[]
}

function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)
}

function normalizeHex(hex: string): string {
  let h = hex.startsWith('#') ? hex : `#${hex}`
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h
}

export function ColorField({ label, description, value, onChange, presets }: ColorFieldProps) {
  const [hexInput, setHexInput] = useState(value)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setHexInput(value)
  }, [value])

  const handleHexChange = (hex: string) => {
    setHexInput(hex)
    if (isValidHex(hex)) {
      onChange(normalizeHex(hex))
    }
  }

  const handleHexBlur = () => {
    if (isValidHex(hexInput)) {
      const hex = normalizeHex(hexInput)
      onChange(hex)
      setHexInput(hex)
    } else {
      setHexInput(value)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-[11px] text-muted-foreground/70">{description}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
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
                'relative size-8 rounded-lg transition-all duration-150',
                'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                selected
                  ? 'ring-2 ring-primary/60 ring-offset-1 ring-offset-card'
                  : 'ring-1 ring-border/40 hover:ring-border/80',
              )}
              style={{ backgroundColor: p.color }}
            >
              {selected && (
                <Check
                  className="absolute inset-0 m-auto size-3.5 drop-shadow-sm"
                  style={{ color: isLightColor(p.color) ? '#1f2937' : '#ffffff' }}
                />
              )}
            </button>
          )
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              'relative flex size-8 items-center justify-center overflow-hidden rounded-lg transition-all duration-150',
              'ring-1 ring-border/40 hover:ring-border/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
          >
            <span className="absolute inset-0" style={{ backgroundColor: value }} />
            <span className="relative flex items-center justify-center rounded bg-background/70 p-0.5 backdrop-blur-sm">
              <Pipette className="size-3 text-foreground" />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2.5" align="start">
            <div className="space-y-2.5">
              <HexColorPicker
                color={value || '#000000'}
                onChange={onChange}
                style={{ width: '100%', height: 130 }}
              />
              <div className="flex items-center gap-2">
                <div
                  className="size-7 shrink-0 rounded-md ring-1 ring-border/40"
                  style={{ backgroundColor: value || 'transparent' }}
                />
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  onBlur={handleHexBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleHexBlur()
                  }}
                  className="h-7 flex-1 font-mono text-xs"
                  maxLength={7}
                  aria-label={`${label} hex value`}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
