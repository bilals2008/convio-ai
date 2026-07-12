import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ChartTooltipContent, ChartLegendContent, selectEvenlySpacedItems } from "@/components/application/charts/charts-base"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartDataPoint {
  date: string
  userMessages: number
  assistantMessages: number
}

interface MessagesChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  userMessages: {
    label: "User",
    color: "var(--chart-1)",
  },
  assistantMessages: {
    label: "Assistant",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function MessagesChart({ data, loading }: MessagesChartProps) {
  const ticks = useMemo(() => selectEvenlySpacedItems(data, 7).map((d) => d.date), [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Messages Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 18 }}>
              <CartesianGrid vertical={false} stroke="currentColor" className="text-border" />
              <XAxis
                fill="currentColor"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                interval="preserveStartEnd"
                dataKey="date"
                ticks={ticks}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                className="text-xs [&_.recharts-text]:fill-muted-foreground"
              />
              <YAxis
                fill="currentColor"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value) => Number(value).toLocaleString()}
                className="text-xs [&_.recharts-text]:fill-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) =>
                      new Date(label as string).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    className="fill-card"
                  />
                }
                cursor={{ className: "fill-muted/50" }}
              />
              <Bar
                dataKey="userMessages"
                name="User"
                fill="var(--color-userMessages)"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                dataKey="assistantMessages"
                name="Assistant"
                fill="var(--color-assistantMessages)"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
