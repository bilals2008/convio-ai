import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins } from 'lucide-react'

interface DailyData {
  date: string
  inputTokens: number
  outputTokens: number
}

interface TokenUsageChartProps {
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
} satisfies ChartConfig

export function TokenUsageChart({ data, loading }: TokenUsageChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    input: Math.round(d.inputTokens / 1000),
    output: Math.round(d.outputTokens / 1000),
  }))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Token Usage</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Thousands of tokens per day</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 mb-3">
              <Coins className="size-5 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No token usage data</p>
            <p className="text-xs text-muted-foreground mt-1">Token usage will appear once your agents start handling conversations.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={chartData} margin={{ top: 13, right: 10, bottom: 0, left: -10 }}>
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
                    labelFormatter={(value) => new Date(value as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    indicator="dot"
                    className="fill-card"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="input" stackId="a" fill="var(--color-inputTokens)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="output" stackId="a" fill="var(--color-outputTokens)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
