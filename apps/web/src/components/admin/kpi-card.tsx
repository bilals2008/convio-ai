import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trend = 'up' | 'down' | 'flat'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: string
  trend?: Trend
  period?: string
  color?: string
  loading?: boolean
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  change = '0%',
  trend,
  period,
  color = 'bg-primary/10 text-primary',
  loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="size-9 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border hover:shadow-sm">
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">
          {label}
        </span>
        <span className="text-lg font-semibold leading-none tracking-tight text-foreground sm:text-xl">
          {value}
        </span>
        {(change || trend) && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] sm:text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                trend === 'up' && 'text-emerald-500',
                trend === 'down' && 'text-destructive',
                trend === 'flat' && 'text-muted-foreground',
              )}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {change}
            </span>
            {period && <span className="hidden text-muted-foreground sm:inline">{period}</span>}
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 sm:size-9',
          color,
        )}
      >
        <Icon className="size-3.5 sm:size-4" />
      </div>
    </div>
  )
}
