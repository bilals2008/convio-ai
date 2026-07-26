import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Area, AreaChart, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Bar, Legend } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap } from 'lucide-react'

interface DailyData {
  date: string
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  inputTokens: number
  outputTokens: number
}

interface TokenCostChartProps {
  data: DailyData[]
  loading?: boolean
}

const chartConfig = {
  inputTokens: {
    label: 'Input Tokens',
    color: 'hsl(217, 91%, 60%)',
  },
  outputTokens: {
    label: 'Output Tokens',
    color: 'hsl(142, 71%, 45%)',
  },
  avgResponseTime: {
    label: 'Avg Response (s)',
    color: 'hsl(27, 96%, 61%)',
  },
} satisfies ChartConfig

export function TokenCostChart({ data, loading }: TokenCostChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Token Usage & Response Time</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mb-3">
              <Zap className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">No usage data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Token usage and performance metrics will appear here once your agents start processing conversations.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ComposedChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                yAxisId="tokens"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <YAxis
                yAxisId="time"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `${v}s`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    }
                  />
                }
              />
              <Legend content={<ChartLegendContent />} />
              <Area
                yAxisId="tokens"
                dataKey="inputTokens"
                name="Input Tokens"
                type="monotone"
                fill="var(--color-inputTokens)"
                fillOpacity={0.3}
                stroke="var(--color-inputTokens)"
                strokeWidth={1.5}
                stackId="1"
              />
              <Area
                yAxisId="tokens"
                dataKey="outputTokens"
                name="Output Tokens"
                type="monotone"
                fill="var(--color-outputTokens)"
                fillOpacity={0.3}
                stroke="var(--color-outputTokens)"
                strokeWidth={1.5}
                stackId="1"
              />
              <Line
                yAxisId="time"
                dataKey="avgResponseTime"
                name="Avg Response (s)"
                type="monotone"
                stroke="var(--color-avgResponseTime)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
