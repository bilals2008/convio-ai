import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; isUp: boolean }
  loading?: boolean
}

export function KpiCard({ icon: Icon, label, value, trend, loading }: KpiCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">{value}</p>
            {trend && (
              <div className={cn(
                'mt-1 flex items-center gap-1 text-xs',
                trend.isUp ? 'text-success' : 'text-destructive'
              )}>
                {trend.isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
