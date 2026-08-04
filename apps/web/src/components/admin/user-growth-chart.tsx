import { useState, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { useAdminAnalytics } from '@/admin/hooks/use-admin'

const ranges = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

const chartConfig = {
  signups: { label: 'New Users', color: 'hsl(142, 71%, 45%)' },
} satisfies ChartConfig

export function UserGrowthChart() {
  const [days, setDays] = useState(30)
  const { data, isLoading } = useAdminAnalytics(days)

  const chartData = useMemo(() => data?.userSignups || [], [data])
  const total = useMemo(() => chartData.reduce((s, d) => s + d.count, 0), [chartData])

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3 border-b py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-muted-foreground" />
          User Growth
        </CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setDays(r.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                days === r.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">No signup data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">User growth will appear here as new users join.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{total.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">new users in selected period</span>
            </div>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value as string).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                  }
                />
                <Area
                  type="natural"
                  dataKey="count"
                  stroke="var(--color-signups)"
                  strokeWidth={2}
                  fill="url(#fillSignups)"
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
