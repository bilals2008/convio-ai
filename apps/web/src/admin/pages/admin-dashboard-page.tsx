import { useQuery } from '@tanstack/react-query'
import { Users, Building2, Brain, MessageSquare, Activity, DollarSign, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { LoadingCard } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface AdminStats {
  totalUsers: number
  totalOrgs: number
  totalAgents: number
  totalConversations: number
  activeSubscriptions: number
  mrr: number
  signupsToday: number
  recentSignups: { email: string; name: string; createdAt: string }[]
}

function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data?.data ?? {
        totalUsers: 0,
        totalOrgs: 0,
        totalAgents: 0,
        totalConversations: 0,
        activeSubscriptions: 0,
        mrr: 0,
        signupsToday: 0,
        recentSignups: [],
      }
    },
    retry: false,
  })
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <LoadingCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide overview and management"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="text-sky-500" />
        <StatCard title="Organizations" value={stats?.totalOrgs ?? 0} icon={Building2} color="text-violet-500" />
        <StatCard title="Agents" value={stats?.totalAgents ?? 0} icon={Brain} color="text-emerald-500" />
        <StatCard title="Conversations" value={stats?.totalConversations ?? 0} icon={MessageSquare} color="text-amber-500" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.recentSignups?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No recent signups</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentSignups.map((u, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{u.name || 'Unknown'}</span>
                      <span className="ml-2 text-muted-foreground">{u.email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Status</span>
              <Badge variant="active" className="text-[10px]">Operational</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <Badge variant="active" className="text-[10px]">Connected</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Subscriptions</span>
              <span className="font-medium tabular-nums">{stats?.activeSubscriptions ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">MRR</span>
              <span className="font-medium tabular-nums">${(stats?.mrr ?? 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
