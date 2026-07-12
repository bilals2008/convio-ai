import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ChartTooltipContent } from "@/components/application/charts/charts-base"
import { Skeleton } from "@/components/ui/skeleton"
import { mockAgentsData } from "@/lib/mock-chart-data"

interface AgentData {
  name: string
  conversations: number
  messages: number
}

interface AgentBarChartProps {
  data: AgentData[]
  loading?: boolean
  metric?: "conversations" | "messages"
}

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "var(--chart-1)",
  },
  messages: {
    label: "Messages",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function AgentBarChart({ data, loading, metric = "conversations" }: AgentBarChartProps) {
  const chartData = data.length >= 2 && data.some((a) => a[metric] > 0)
    ? data.map((a) => ({ name: a.name, value: a[metric] }))
    : mockAgentsData.map((a) => ({ name: a.name, value: a[metric] }))

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">
            {metric === "conversations" ? "Conversations by Agent" : "Messages by Agent"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={100}
                tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + "…" : value}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => Number(value).toLocaleString()}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="fill-card"
                  />
                }
              />
              <Bar
                dataKey="value"
                name={metric === "conversations" ? "Conversations" : "Messages"}
                fill={`var(--color-${metric})`}
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
