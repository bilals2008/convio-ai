import { cn } from '@/lib/utils'

interface UsageMeterProps {
  label: string
  used: number
  limit: number
  className?: string
}

export function UsageMeter({ label, used, limit, className }: UsageMeterProps) {
  const isInfinite = limit === Infinity || limit === 0
  const percent = isInfinite ? 0 : Math.min(Math.round((used / limit) * 100), 100)
  const isNearLimit = !isInfinite && percent >= 80
  const isOverLimit = !isInfinite && used >= limit

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn('text-muted-foreground tabular-nums', isOverLimit && 'text-destructive font-medium')}>
          {used.toLocaleString()}
          {isInfinite ? '' : ` / ${limit.toLocaleString()}`}
          {!isInfinite && ` (${percent}%)`}
        </span>
      </div>
      {!isInfinite && (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isOverLimit ? 'bg-destructive' : isNearLimit ? 'bg-warning' : 'bg-primary',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
