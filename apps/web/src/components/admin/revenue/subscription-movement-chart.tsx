import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import { type AdminRevenueTimeline } from '@/admin/services/admin-api'

const chartConfig = {
  newSubscriptions: {
    label: 'New',
    color: 'hsl(142, 71%, 45%)',
  },
  churnedSubscriptions: {
    label: 'Churned',
    color: 'hsl(347, 80%, 55%)',
  },
} satisfies ChartConfig

interface SubscriptionMovementChartProps {
  data: AdminRevenueTimeline[]
  loading?: boolean
}

export function SubscriptionMovementChart({ data, loading }: SubscriptionMovementChartProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Subscription Movement</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">New vs Churned</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 mb-3">
              <Users className="size-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No subscription data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Subscription changes will appear here.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={data}>
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
              <Bar dataKey="newSubscriptions" fill="var(--color-newSubscriptions)" radius={4} />
              <Bar dataKey="churnedSubscriptions" fill="var(--color-churnedSubscriptions)" radius={4} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
