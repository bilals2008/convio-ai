import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ChartTooltipContent, selectEvenlySpacedItems } from "@/components/application/charts/charts-base"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartDataPoint {
  date: string
  conversations: number
}

interface ConversationsChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ConversationsChart({ data, loading }: ConversationsChartProps) {
  const ticks = useMemo(() => selectEvenlySpacedItems(data, 7).map((d) => d.date), [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 18 }}>
              <defs>
                <linearGradient id="fillConversations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-conversations)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-conversations)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="conversations"
                stroke="var(--color-conversations)"
                strokeWidth={2}
                fill="url(#fillConversations)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
