import * as React from "react"
import { type TooltipProps } from "recharts"

import { cn } from "@/lib/utils"

type NameType = string | number
type ValueType = string | number | Array<string | number>

export function selectEvenlySpacedItems<T extends Record<string, unknown>>(
  data: T[],
  count: number,
  key = "date" as keyof T,
): T[] {
  if (data.length <= count) return data
  const step = Math.floor(data.length / count)
  return data.filter((_, i) => i % step === 0).slice(0, count)
}

interface ChartTooltipContentProps
  extends TooltipProps<ValueType, NameType> {
  className?: string
  labelKey?: string
  nameKey?: string
  labelFormatter?: (label: string | number) => string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  const formattedLabel = labelFormatter
    ? labelFormatter(label as string | number)
    : String(label)

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md",
        className
      )}
    >
      <p className="mb-1 font-medium text-muted-foreground">{formattedLabel}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium text-foreground ml-auto tabular-nums">
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface ChartLegendContentProps {
  className?: string
  payload?: Array<{
    value: string
    color: string
    type?: string
  }>
}

export function ChartLegendContent({
  className,
  payload,
}: ChartLegendContentProps) {
  if (!payload?.length) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-xs", className)}>
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-1.5">
          <div
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
