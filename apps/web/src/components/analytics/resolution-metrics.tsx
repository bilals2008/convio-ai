import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sublabel?: string
  iconClassName?: string
}

function MetricCard({ icon: Icon, label, value, sublabel, iconClassName }: MetricCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex size-9 items-center justify-center rounded-lg shrink-0', iconClassName)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sublabel && <p className="text-[10px] text-muted-foreground/70">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

interface ResolutionMetricsProps {
  resolutionRate: number
  avgHandleTime: number
  totalConversations: number
  totalMessages: number
  loading?: boolean
}

export function ResolutionMetrics({
  resolutionRate,
  avgHandleTime,
  totalConversations,
  totalMessages,
  loading,
}: ResolutionMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        icon={CheckCircle}
        label="Resolution"
        value={`${resolutionRate}%`}
        iconClassName="bg-emerald-500/10 text-emerald-600"
      />
      <MetricCard
        icon={Clock}
        label="Handle Time"
        value={`${avgHandleTime}m`}
        iconClassName="bg-amber-500/10 text-amber-600"
      />
      <MetricCard
        icon={MessageSquare}
        label="Msgs/Conv"
        value={totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : '0'}
        iconClassName="bg-blue-500/10 text-blue-600"
      />
      <MetricCard
        icon={XCircle}
        label="Escalation"
        value={`${(100 - resolutionRate).toFixed(0)}%`}
        iconClassName="bg-purple-500/10 text-purple-600"
      />
    </div>
  )
}
