import { Activity, Globe, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSystemHealth } from '@/admin/hooks/use-admin'

function ConversationStatusBar({ status, count }: { status: string; count: number }) {
  const colors: Record<string, string> = {
    active: 'bg-success',
    resolved: 'bg-info',
    waiting: 'bg-warning',
    closed: 'bg-muted-foreground',
  }
  return (
    <div className="flex items-center gap-3">
      <div className={`h-2 w-2 rounded-full shrink-0 ${colors[status] || 'bg-muted-foreground'}`} />
      <span className="text-xs capitalize min-w-24">{status}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[status] || 'bg-muted-foreground'}`}
          style={{ width: `${Math.min(count * 5, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
    </div>
  )
}

export default function AdminSystemPage() {
  const { data: health, isLoading } = useSystemHealth()

  return (
    <div>
      <PageHeader title="System Health" description="Platform health overview." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <KpiCard icon={Activity} label="Active Deployments" value={health?.activeDeployments ?? 0} loading={isLoading} />
        <KpiCard icon={AlertTriangle} label="Errors (24h)" value={health?.errorsLast24h ?? 0} loading={isLoading} />
        <KpiCard icon={Globe} label="Conversation Statuses" value={health ? Object.keys(health.conversationsByStatus).length : 0} loading={isLoading} />
      </div>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Conversations by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {Object.entries(health.conversationsByStatus).map(([status, count]) => (
              <ConversationStatusBar key={status} status={status} count={count} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
