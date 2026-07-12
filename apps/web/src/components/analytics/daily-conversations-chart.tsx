import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ChartTooltipContent } from "@/components/application/charts/charts-base"
import { Skeleton } from "@/components/ui/skeleton"
import { mockOverviewData } from "@/lib/mock-chart-data"

interface ConversationPoint {
  date: string
  conversations: number
}

interface DailyConversationsChartProps {
  data: ConversationPoint[]
  loading?: boolean
}

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function DailyConversationsChart({ data, loading }: DailyConversationsChartProps) {
  const chartData = data.length >= 5 && data.some((d) => d.conversations > 0) ? data : mockOverviewData

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Daily Conversations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                    className="fill-card"
                  />
                }
              />
              <Bar
                dataKey="conversations"
                fill="var(--color-conversations)"
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
