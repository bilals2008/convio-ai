import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'

interface ChartDataPoint {
  date: string
  conversations: number
  messages: number
}

interface OverviewChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  messages: {
    label: 'Messages',
    color: 'hsl(142, 71%, 45%)',
  },
  conversations: {
    label: 'Conversations',
    color: 'hsl(160, 60%, 37%)',
  },
} satisfies ChartConfig

export function OverviewChart({ data, loading }: OverviewChartProps) {
  const chartData = data

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Conversation Analytics</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Messages vs Conversations</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 mb-3">
              <BarChart3 className="size-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No analytics data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Conversation and message trends will appear here once activity starts.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-messages)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-messages)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillConversations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-conversations)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-conversations)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }}
                    indicator="dot"
                    className="fill-card"
                  />
                }
              />
              <Area
                dataKey="messages"
                type="natural"
                fill="url(#fillMessages)"
                stroke="var(--color-messages)"
                stackId="a"
              />
              <Area
                dataKey="conversations"
                type="natural"
                fill="url(#fillConversations)"
                stroke="var(--color-conversations)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
