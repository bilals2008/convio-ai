import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── Shared base styles ────────────────────────────────────────────────────────
const cardBase =
  'rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-sm'

// ─── 1. StatsCard (Horizontal) ─────────────────────────────────────────────────
// Icon right · label + value + optional description left

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconClassName?: string
  description?: string
  descriptionClassName?: string
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  description,
  descriptionClassName,
}: StatsCardProps) {
  return (
    <div className={cn(cardBase, 'group flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4')}>
      <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
        <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-xl sm:text-2xl font-semibold leading-none tracking-tight text-foreground truncate">
          {value}
        </span>
        {description && (
          <span className={cn('mt-0.5 hidden text-xs text-muted-foreground sm:block', descriptionClassName)}>
            {description}
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          iconClassName
        )}
      >
        <Icon className="size-4 sm:size-5" />
      </div>
    </div>
  )
}

// ─── 2. KPICard ────────────────────────────────────────────────────────────────
// Trend indicator (up/down/flat) · percentage change · period comparison

type TrendDirection = 'up' | 'down' | 'flat'

interface KPICardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconClassName?: string
  trend?: TrendDirection
  change?: string
  period?: string
}

export function KPICard({
  icon: Icon,
  label,
  value,
  iconClassName,
  trend = 'flat',
  change,
  period = 'vs last period',
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up'
      ? 'text-emerald-500'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground'

  return (
    <div className={cn(cardBase, 'group flex items-center justify-between gap-4 px-5 py-4')}>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {(change || period) && (
          <span className="mt-0.5 flex items-center gap-1.5 text-xs">
            {change && (
              <span className={cn('inline-flex items-center gap-0.5 font-medium', trendColor)}>
                <TrendIcon className="size-3" />
                {change}
              </span>
            )}
            {period && <span className="text-muted-foreground">{period}</span>}
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          iconClassName
        )}
      >
        <Icon className="size-5" />
      </div>
    </div>
  )
}

// ─── 3. ChartCard ──────────────────────────────────────────────────────────────
// Mini sparkline / area chart slot at the bottom

interface ChartCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconClassName?: string
  description?: string
  children?: React.ReactNode
}

export function ChartCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  description,
  children,
}: ChartCardProps) {
  return (
    <div className={cn(cardBase, 'group overflow-hidden')}>
      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </span>
          {description && (
            <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>
          )}
        </div>
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {children && (
        <div className="border-t border-border/40 px-5 pt-3 pb-4">{children}</div>
      )}
    </div>
  )
}

// ─── 4. ProgressCard ───────────────────────────────────────────────────────────
// Progress bar with percentage · used for AI usage, completion rates

interface ProgressCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  progress: number
  iconClassName?: string
  barClassName?: string
  description?: string
}

export function ProgressCard({
  icon: Icon,
  label,
  value,
  progress,
  iconClassName,
  barClassName,
  description,
}: ProgressCardProps) {
  return (
    <div className={cn(cardBase, 'group px-5 py-4')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </span>
        </div>
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              barClassName ?? 'bg-foreground'
            )}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      {description && (
        <span className="mt-2 block text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  )
}
