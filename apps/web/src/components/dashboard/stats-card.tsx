import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconClassName?: string
}

export function StatsCard({ icon: Icon, label, value, iconClassName }: StatsCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-3">
        <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', iconClassName)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tracking-tight leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
