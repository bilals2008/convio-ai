import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

interface TemperatureSliderProps {
  value: number
  onValueChange: (value: number) => void
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

const STOPS = [
  { value: 0, label: "Precise" },
  { value: 0.5, label: "Balanced" },
  { value: 1, label: "Creative" },
]

export function TemperatureSlider({ value, onValueChange, disabled, min = 0, max = 1, step = 0.1 }: TemperatureSliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Temperature</span>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {value.toFixed(1)}
        </span>
      </div>

      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([v]) => onValueChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      >
        <SliderPrimitive.Control className="relative flex h-5 w-full touch-none items-center select-none data-disabled:opacity-50">
          <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-muted">
            <SliderPrimitive.Indicator className="absolute left-0 h-full rounded-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              "block size-4 rounded-full border-2 border-background bg-primary shadow-sm transition-shadow",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "data-dragging:shadow-md",
            )}
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        {STOPS.map((stop) => (
          <span key={stop.value}>{stop.label}</span>
        ))}
      </div>
    </div>
  )
}
