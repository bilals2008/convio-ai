import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonStat {
  label: string
  thisWeek: number
  lastWeek: number
  format: 'number' | 'percent' | 'seconds'
}

const stats: ComparisonStat[] = [
  { label: 'Conversations', thisWeek: 234, lastWeek: 198, format: 'number' },
  { label: 'Messages', thisWeek: 1456, lastWeek: 1289, format: 'number' },
  { label: 'Success Rate', thisWeek: 96, lastWeek: 93, format: 'percent' },
  { label: 'Avg Response', thisWeek: 1.2, lastWeek: 1.5, format: 'seconds' },
]

function formatValue(value: number, format: ComparisonStat['format']) {
  switch (format) {
    case 'percent': return `${value}%`
    case 'seconds': return `${value.toFixed(1)}s`
    default: return value.toLocaleString()
  }
}

function getTrend(thisWeek: number, lastWeek: number) {
  const diff = ((thisWeek - lastWeek) / Math.max(lastWeek, 1)) * 100
  if (diff > 0) return { direction: 'up' as const, value: `+${Math.round(diff)}%`, color: 'text-emerald-500' }
  if (diff < 0) return { direction: 'down' as const, value: `${Math.round(diff)}%`, color: 'text-red-500' }
  return { direction: 'flat' as const, value: '0%', color: 'text-muted-foreground' }
}

export function WeeklyComparison() {
  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Weekly Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const trend = getTrend(stat.thisWeek, stat.lastWeek)
            return (
              <div key={stat.label} className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{formatValue(stat.thisWeek, stat.format)}</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{formatValue(stat.lastWeek, stat.format)}</p>
                    <p className="text-xs text-muted-foreground">Last week</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {trend.direction === 'up' ? (
                    <ArrowUpRight className={cn('size-3.5', trend.color)} />
                  ) : trend.direction === 'down' ? (
                    <ArrowDownRight className={cn('size-3.5', trend.color)} />
                  ) : (
                    <Minus className="size-3.5 text-muted-foreground" />
                  )}
                  <span className={cn('text-xs font-medium', trend.color)}>{trend.value}</span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
