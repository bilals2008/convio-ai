import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color?: string
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'text-primary',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('ring-0 hover:bg-muted/50 transition-colors', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-9 items-center justify-center rounded-lg bg-muted shrink-0')}>
            <Icon className={cn('size-4.5', color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold tracking-tight leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{title}</p>
          </div>
          {change && (
            <Badge variant="secondary" className="text-[10px] font-normal shrink-0">
              {change}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
