import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Line, LineChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartDataPoint {
  date: string
  avgResponseTime: number
}

interface ResponseTimeChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  avgResponseTime: {
    label: 'Response Time',
    color: 'hsl(38, 92%, 50%)',
  },
} satisfies ChartConfig

export function ResponseTimeChart({ data, loading }: ResponseTimeChartProps) {
  const chartData = data

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Response Time Trend</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Avg seconds per response</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData}>
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
                    formatter={(value) => [`${Number(value).toFixed(2)}s`, 'Response Time']}
                    className="fill-card"
                  />
                }
              />
              <Line
                dataKey="avgResponseTime"
                type="natural"
                stroke="var(--color-avgResponseTime)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
