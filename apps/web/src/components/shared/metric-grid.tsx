import { MetricCard, type MetricCardProps } from './metric-card'
import { cn } from '@/lib/utils'

interface MetricGridProps {
  metrics: MetricCardProps[]
  columns?: 2 | 3 | 4
  className?: string
  loading?: boolean
}

export function MetricGrid({ metrics, columns = 3, className, loading }: MetricGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          className
        )}
      >
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="h-[120px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {metrics.map((metric, i) => (
        <MetricCard key={i} {...metric} />
      ))}
    </div>
  )
}
