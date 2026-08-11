import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import { type AdminRevenueTimeline } from '@/admin/services/admin-api'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(142, 71%, 45%)',
  },
  profit: {
    label: 'Profit',
    color: 'hsl(217, 91%, 55%)',
  },
} satisfies ChartConfig

interface RevenueTrendChartProps {
  data: AdminRevenueTimeline[]
  loading?: boolean
}

export function RevenueTrendChart({ data, loading }: RevenueTrendChartProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Revenue Trend</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Revenue vs Profit</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
              <TrendingUp className="size-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No revenue data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue trends will appear here once invoices are paid.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    className="fill-card"
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="var(--color-profit)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
