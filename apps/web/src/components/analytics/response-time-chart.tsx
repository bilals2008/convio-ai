import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Timer } from 'lucide-react'

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
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 mb-3">
              <Timer className="size-5 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No response time data</p>
            <p className="text-xs text-muted-foreground mt-1">Response time trends will appear once your agents handle conversations.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 13, right: 10, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="fillResponseTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-avgResponseTime)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-avgResponseTime)" stopOpacity={0.08} />
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
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={50}
                domain={[0, 'auto']}
                tickFormatter={(v: number) => (v === 0 ? '0s' : `${v.toFixed(0)}s`)}
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
              <Area
                dataKey="avgResponseTime"
                type="natural"
                baseValue={0}
                stroke="var(--color-avgResponseTime)"
                strokeWidth={2}
                fill="url(#fillResponseTime)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
