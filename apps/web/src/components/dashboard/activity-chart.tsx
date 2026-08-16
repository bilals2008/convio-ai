import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'

interface ChartDataPoint {
  date: string
  conversations: number
  messages: number
}

interface ActivityChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  messages: {
    label: 'Messages',
    color: 'hsl(160, 60%, 37%)',
  },
} satisfies ChartConfig

export function ActivityChart({ data, loading }: ActivityChartProps) {
  const chartData = data

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Message Volume</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
              <MessageSquare className="size-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No data found</p>
            <p className="text-xs text-muted-foreground mt-1">Message volume will show here once your agents start chatting.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-messages)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-messages)" stopOpacity={0.05} />
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
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }}
                    className="fill-card"
                  />
                }
              />
              <Area
                dataKey="messages"
                type="natural"
                stroke="var(--color-messages)"
                strokeWidth={2}
                fill="url(#fillMessages)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
