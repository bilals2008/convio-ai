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
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('flex size-10 items-center justify-center rounded-lg bg-muted', `hover:${color}/10`)}>
            <Icon className={cn('size-5', color)} />
          </div>
          {change && (
            <Badge variant="secondary" className="text-xs">
              {change}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  )
}
