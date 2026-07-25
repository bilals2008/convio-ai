import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign } from 'lucide-react'

interface DailyData {
  date: string
  inputTokens: number
  outputTokens: number
}

interface DailyCostChartProps {
  data: DailyData[]
  loading?: boolean
}

const chartConfig = {
  cost: {
    label: 'Cost',
    color: 'hsl(0, 73%, 56%)',
  },
} satisfies ChartConfig

export function DailyCostChart({ data, loading }: DailyCostChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    cost: Math.round(((d.inputTokens * 0.000003) + (d.outputTokens * 0.000015)) * 1000) / 1000,
  }))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Daily Cost</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">USD per day</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 mb-3">
              <DollarSign className="size-5 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No cost data</p>
            <p className="text-xs text-muted-foreground mt-1">Cost tracking will populate once your agents handle conversations.</p>
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
                    formatter={(value) => [`$${Number(value).toFixed(3)}`, 'Cost']}
                    className="fill-card"
                  />
                }
              />
              <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
