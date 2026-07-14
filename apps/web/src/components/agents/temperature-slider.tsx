import { useCallback } from "react"

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(parseFloat(e.target.value))
  }, [onValueChange])

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Temperature</span>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {value.toFixed(1)}
        </span>
      </div>

      <div className="relative flex h-5 w-full items-center">
        <div className="relative h-1.5 w-full rounded-full bg-muted">
          <div
            className="absolute left-0 h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-md [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm"
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        {STOPS.map((stop) => (
          <span key={stop.value}>{stop.label}</span>
        ))}
      </div>
    </div>
  )
}
