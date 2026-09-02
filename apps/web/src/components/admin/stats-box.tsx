import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsBoxProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  subColor?: string
  iconBg?: string
  loading?: boolean
}

export function StatsBox({
  icon: Icon,
  label,
  value,
  sub,
  subColor = 'text-emerald-500',
  iconBg = 'bg-primary/10 text-primary',
  loading,
}: StatsBoxProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20 rounded bg-muted" />
          <Skeleton className="h-5 w-12 rounded bg-muted" />
          {sub && <Skeleton className="h-3 w-24 rounded bg-muted" />}
        </div>
        <Skeleton className="size-8 shrink-0 rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {sub && (
          <span className={cn('text-xs font-medium', subColor)}>{sub}</span>
        )}
      </div>
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="size-4" />
      </div>
    </div>
  )
}
