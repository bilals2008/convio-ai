import { useState } from "react"
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

const TEMPERATURE_STOPS = [
  { value: 0, label: "Precise", color: "#3b82f6" },
  { value: 0.3, label: "Balanced", color: "#22c55e" },
  { value: 0.7, label: "Creative", color: "#f59e0b" },
  { value: 1, label: "Wild", color: "#ef4444" },
]

export function TemperatureSlider({ value, onValueChange, disabled, min = 0, max = 1, step = 0.1 }: TemperatureSliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const getTrackColor = (val: number) => {
    if (val <= 0.3) return "from-blue-500 to-emerald-500"
    if (val <= 0.7) return "from-emerald-500 to-amber-500"
    return "from-amber-500 to-red-500"
  }

  const getThumbColor = (val: number) => {
    if (val <= 0.3) return "bg-blue-500"
    if (val <= 0.7) return "bg-emerald-500"
    if (val <= 0.9) return "bg-amber-500"
    return "bg-red-500"
  }

  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {/* Labels row */}
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {TEMPERATURE_STOPS.map((stop) => (
          <span key={stop.value} className="text-center w-20" style={{ left: `${stop.value * 100}%` }}>
            {stop.label}
          </span>
        ))}
      </div>

      {/* Slider with gradient track */}
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([v]) => onValueChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        thumbAlignment="edge"
        className="w-full"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50">
          <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full select-none h-2.5 w-full">
            {/* Background track */}
            <div className="absolute inset-0 rounded-full bg-muted" />
            {/* Gradient fill track */}
            <div
              className={cn(
                "absolute left-0 top-0 h-full rounded-full transition-all duration-75",
                getTrackColor(value)
              )}
              style={{ width: `${percent}%` }}
            />
            {/* Gradient overlay on fill */}
            <div
              className={cn(
                "absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-75",
                getTrackColor(value)
              )}
              style={{ width: `${percent}%`, opacity: 0.9 }}
            />
          </SliderPrimitive.Track>

          <SliderPrimitive.Thumb
            className={cn(
              "relative block size-5 shrink-0 rounded-full border-2 border-white shadow-lg transition-all duration-100 select-none",
              "focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-hidden",
              "data-[state=dragging]:scale-110",
              "disabled:pointer-events-none disabled:opacity-50",
              getThumbColor(value)
            )}
            style={{
              left: `calc(${percent}% - 10px)`,
            }}
          >
            {/* Value tooltip on hover/drag */}
            {(isDragging || value > 0) && (
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover/opacity-100:opacity-100 pointer-events-none"
                style={{ opacity: isDragging ? 1 : 0 }}
              >
                {value.toFixed(1)}
              </div>
            )}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      {/* Current value display */}
      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
        <span className="text-xs">Current:</span>
        <span className="font-mono font-semibold text-foreground">{value.toFixed(1)}</span>
      </div>
    </div>
  )
}