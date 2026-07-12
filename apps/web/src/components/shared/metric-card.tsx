import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'flat'

type ColorVariant = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'info' | 'success' | 'warning' | 'destructive'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend: TrendDirection
  change: string
  period: string
  color?: ColorVariant
  className?: string
}

const colorMap: Record<ColorVariant, { bg: string; text: string; trend: string }> = {
  green: {
    bg: 'bg-success/10 text-success',
    text: 'text-success',
    trend: 'text-success',
  },
  blue: {
    bg: 'bg-info/10 text-info',
    text: 'text-info',
    trend: 'text-info',
  },
  amber: {
    bg: 'bg-warning/10 text-warning',
    text: 'text-warning',
    trend: 'text-warning',
  },
  red: {
    bg: 'bg-destructive/10 text-destructive',
    text: 'text-destructive',
    trend: 'text-destructive',
  },
  purple: {
    bg: 'bg-chart-4/10 text-chart-4',
    text: 'text-chart-4',
    trend: 'text-chart-4',
  },
  info: {
    bg: 'bg-info/10 text-info',
    text: 'text-info',
    trend: 'text-info',
  },
  success: {
    bg: 'bg-success/10 text-success',
    text: 'text-success',
    trend: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10 text-warning',
    text: 'text-warning',
    trend: 'text-warning',
  },
  destructive: {
    bg: 'bg-destructive/10 text-destructive',
    text: 'text-destructive',
    trend: 'text-destructive',
  },
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  change,
  period,
  color = 'green',
  className,
}: MetricCardProps) {
  const colors = colorMap[color]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'group flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 transition-all duration-200 hover:border-border hover:shadow-sm',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'flat' && 'text-muted-foreground'
            )}
          >
            <TrendIcon className="size-3" />
            {change}
          </span>
          <span className="text-muted-foreground">{period}</span>
        </span>
      </div>
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          colors.bg
        )}
      >
        <Icon className="size-5" />
      </div>
    </div>
  )
}
