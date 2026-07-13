import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatTileProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: string
  trend?: { value: string; positive?: boolean }
  className?: string
  accent?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
}

const accentMap: Record<NonNullable<StatTileProps['accent']>, string> = {
  default: 'bg-muted/60 text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  className,
  accent = 'default',
}: StatTileProps) {
  return (
    <div
      className={cn(
        'group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:border-border hover:shadow-sm',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span className="mt-0.5 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                trend.positive ? 'text-success' : 'text-destructive',
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          </span>
        )}
        {hint && !trend && (
          <span className="mt-0.5 text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
            accentMap[accent],
          )}
        >
          <Icon className="size-4" />
        </div>
      )}
    </div>
  )
}
