import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  change?: number
  iconClassName?: string
}

export function StatsCard({ icon: Icon, label, value, change, iconClassName }: StatsCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNeutral = change === undefined || change === 0

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('flex size-10 items-center justify-center rounded-xl', iconClassName)}>
            <Icon className="size-5" />
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                isPositive && 'bg-success/10 text-success',
                !isPositive && !isNeutral && 'bg-destructive/10 text-destructive',
                isNeutral && 'bg-muted text-muted-foreground'
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : isNeutral ? (
                <Minus className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {isPositive ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
