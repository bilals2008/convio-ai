import { Users, Building2, Bot, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { useAdminStats } from '@/admin/hooks/use-admin'

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div>
      <PageHeader title="Overview" description="Platform-wide metrics and key performance indicators." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} loading={isLoading} />
        <KpiCard icon={Building2} label="Organizations" value={stats?.totalOrgs ?? 0} loading={isLoading} />
        <KpiCard icon={Bot} label="Agents" value={stats?.totalAgents ?? 0} loading={isLoading} />
        <KpiCard icon={MessageSquare} label="Messages (24h)" value={stats?.messagesLast24h ?? 0} loading={isLoading} />
      </div>
    </div>
  )
}
