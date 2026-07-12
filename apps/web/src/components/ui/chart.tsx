import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  type ResponsiveContainerProps,
} from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
>

interface ChartContainerProps extends ResponsiveContainerProps {
  config: ChartConfig
  children: React.ReactElement
}

function ChartContainer({
  config,
  className,
  children,
  id,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(config)) {
      if (value.color) {
        vars[`--color-${key}`] = value.color
      }
    }
    return vars
  }, [config])

  return (
    <div
      id={chartId}
      style={cssVars as React.CSSProperties}
      className={cn(
        "flex aspect-video w-full justify-center text-xs [&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-cartesian-axis-tick]:fill-muted-foreground",
        className
      )}
    >
      <ResponsiveContainer {...props}>{children}</ResponsiveContainer>
    </div>
  )
}

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {
  content?: React.ComponentProps<typeof Tooltip>["content"]
}

function ChartTooltip({ content, ...props }: ChartTooltipProps) {
  return <Tooltip content={content} {...props} />
}

interface ChartLegendProps extends React.ComponentProps<typeof Legend> {
  content?: React.ComponentProps<typeof Legend>["content"]
}

function ChartLegend({ content, ...props }: ChartLegendProps) {
  return <Legend content={content} {...props} />
}

export { ChartContainer, ChartTooltip, ChartLegend }
