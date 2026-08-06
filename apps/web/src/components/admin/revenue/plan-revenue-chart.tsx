import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers } from 'lucide-react'
import { formatCurrency } from './format'

const COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6']

interface PlanRevenueChartProps {
  data: Array<{ plan: string; revenue: number }>
  loading?: boolean
}

export function PlanRevenueChart({ data, loading }: PlanRevenueChartProps) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <Card>
      <CardHeader className="border-b py-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Revenue by Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 mb-3">
              <Layers className="size-5 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No revenue data</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="revenue" nameKey="plan" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {data.map((d, i) => {
                const share = total > 0 ? Math.round((d.revenue / total) * 100) : 0
                return (
                  <div key={d.plan} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="w-20 truncate capitalize text-muted-foreground">{d.plan}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length], width: `${share}%` }} />
                    </div>
                    <span className="w-16 text-right font-medium tabular-nums">{formatCurrency(d.revenue)}</span>
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{share}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
