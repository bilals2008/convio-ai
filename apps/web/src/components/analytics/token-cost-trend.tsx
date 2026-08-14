import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins } from 'lucide-react'

interface DailyData {
  date: string
  inputTokens: number
  outputTokens: number
}

interface TokenCostTrendProps {
  data: DailyData[]
  totalCost: number
  loading?: boolean
}

const chartConfig = {
  input: { label: 'Input Tokens', color: 'hsl(217, 91%, 60%)' },
  output: { label: 'Output Tokens', color: 'hsl(142, 71%, 45%)' },
  cost: { label: 'Cost', color: 'hsl(0, 73%, 56%)' },
} satisfies ChartConfig

export function TokenCostTrend({ data, totalCost, loading }: TokenCostTrendProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    input: Math.round(d.inputTokens / 1000),
    output: Math.round(d.outputTokens / 1000),
    cost: Math.round(((d.inputTokens * 0.000003) + (d.outputTokens * 0.000015)) * 1000) / 1000,
  }))

  const hasData = chartData.length > 0 && chartData.some((d) => d.input + d.output > 0)

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Token Usage &amp; Cost Trend</CardTitle>
        </div>
        <div className="hidden items-center gap-4 text-sm sm:flex">
          <span className="text-muted-foreground">Total cost: <span className="font-medium text-foreground">${totalCost.toFixed(2)}</span></span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 mb-3">
              <Coins className="size-5 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No usage data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Token usage and cost will appear once your agents handle conversations.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 13, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="fillInput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-input)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-input)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillOutput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-output)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-output)" stopOpacity={0.05} />
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
              <YAxis yAxisId="tokens" orientation="left" tickLine={false} axisLine={false} tickMargin={8} width={50} />
              <YAxis yAxisId="cost" orientation="right" tickLine={false} axisLine={false} tickMargin={8} width={50} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
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
              <Area yAxisId="tokens" dataKey="input" type="natural" stroke="var(--color-input)" strokeWidth={2} fill="url(#fillInput)" dot={false} />
              <Area yAxisId="tokens" dataKey="output" type="natural" stroke="var(--color-output)" strokeWidth={2} fill="url(#fillOutput)" dot={false} />
              <Line yAxisId="cost" dataKey="cost" type="natural" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
