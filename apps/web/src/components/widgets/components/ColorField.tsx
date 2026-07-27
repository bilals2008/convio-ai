import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Check, HelpCircle, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isLightColor } from '../helpers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'

interface ColorPreset {
  label: string
  color: string
}

interface ColorFieldProps {
  label: string
  description: string
  value: string
  onChange: (color: string) => void
  presets: readonly ColorPreset[]
}

function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)
}

function normalizeHex(hex: string): string {
  return hex.startsWith('#') ? hex : `#${hex}`
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
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{label}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
                />
              )}
            </button>
          )
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              'relative flex size-9 items-center justify-center overflow-hidden rounded-lg ring-1 transition-all duration-200',
              'ring-foreground/10 hover:ring-foreground/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span className="absolute inset-0" style={{ backgroundColor: value }} />
            <span className="relative flex items-center justify-center rounded-md bg-background/80 px-1 py-0.5 backdrop-blur-sm">
              <Pipette className="size-3.5 text-foreground" />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-3">
            <div className="space-y-3">
              <HexColorPicker
                color={value}
                onChange={onChange}
                style={{ width: '100%', height: 150 }}
              />
              <div className="flex items-center gap-2">
                <div
                  className="size-8 shrink-0 rounded-md ring-1 ring-foreground/10"
                  style={{ backgroundColor: value }}
                />
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  onBlur={handleHexBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleHexBlur()
                  }}
                  className="h-8 flex-1 font-mono text-xs"
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