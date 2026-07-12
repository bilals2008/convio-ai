import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, MessageSquare, MessageCircle, Users, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { MetricGrid } from '@/components/shared/metric-grid'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TopAgents } from '@/components/dashboard/top-agents'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { analytics as analyticsApi, conversations as conversationsApi } from '@/lib/api'
import api from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
] as const

function getDateRange(range: string) {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  let from: string

  switch (range) {
    case 'today':
      from = to
      break
    case '7d':
      from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
      break
    case '30d':
    default:
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
      break
  }

  return { from, to }
}

export default function DashboardOverviewPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const [dateRange, setDateRange] = useState<string>('30d')
  const { from, to } = getDateRange(dateRange)

  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', orgId, dateRange],
    queryFn: async () => {
      const res = await analyticsApi.overview(orgId!, { from, to })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
  })

  const { data: topAgentsData } = useQuery({
    queryKey: ['dashboard-top-agents', orgId, dateRange],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/analytics/top-agents`, {
        params: { from, to, limit: 5 },
      })
      return res.data.data as { agentId: string; agentName: string; totalConversations: number; totalMessages: number; avgResponseTime: number; satisfactionScore?: number | null }[]
    },
    enabled: !!orgId,
    retry: false,
  })

  const { data: recentConversations } = useQuery({
    queryKey: ['dashboard-recent-activity', orgId],
    queryFn: async () => {
      const res = await conversationsApi.list({ limit: 8 })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
  })

  if (orgLoading) return <OverviewSkeleton />

  if (!orgId) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" description="Overview of your AI agent platform" />
        <EmptyState
          icon={Building2}
          title="No organization found"
          description="Create an organization to get started with Convio."
          action={{ label: 'Create Organization', onClick: () => window.location.href = '/settings/organization' }}
        />
      </PageContainer>
    )
  }

  if (isLoading) return <OverviewSkeleton />

  if (isError) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" description="Overview of your AI agent platform" />
        <EmptyState
          icon={Building2}
          title="Failed to load dashboard"
          description={(error as Error)?.message || 'Something went wrong. Please try again.'}
        />
      </PageContainer>
    )
  }

  function trendOf(val: number): { trend: 'up' | 'down' | 'flat'; change: string } {
    if (val > 0) return { trend: 'up', change: `+${val}%` }
    if (val < 0) return { trend: 'down', change: `${val}%` }
    return { trend: 'flat', change: '0%' }
  }

  const metrics = [
    {
      icon: MessageSquare,
      label: 'Conversations',
      value: (overview?.totalConversations || 0).toLocaleString(),
      ...trendOf(overview?.conversationsChange ?? 0),
      period: 'vs last period',
      color: 'info' as const,
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      value: (overview?.totalMessages || 0).toLocaleString(),
      ...trendOf(overview?.messagesChange ?? 0),
      period: 'vs last period',
      color: 'success' as const,
    },
    {
      icon: Users,
      label: 'Active Users',
      value: (overview?.uniqueUsers || 0).toLocaleString(),
      ...trendOf(overview?.usersChange ?? 0),
      period: 'vs last period',
      color: 'green' as const,
    },
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: `${overview?.avgResponseTime || 0}s`,
      ...trendOf(overview?.responseTimeChange ?? 0),
      period: 'vs last period',
      color: 'amber' as const,
    },
  ]

  const chartData = (overview?.dailyBreakdown || []).map(
    (d: { date: string; totalConversations: number; totalMessages: number }) => ({
      date: d.date,
      conversations: d.totalConversations,
      messages: d.totalMessages,
    }),
  )

  const topAgents = (topAgentsData || []).map(
    (b: { agentId: string; agentName: string; totalConversations: number }) => ({
      id: b.agentId,
      name: b.agentName,
      conversationCount: b.totalConversations,
    }),
  )

  const activities = (recentConversations || []).slice(0, 5).map(
    (c: { id: string; agent?: { name?: string }; channel: string; status: string; createdAt: string }) => ({
      id: c.id,
      agentName: c.agent?.name ?? 'Unknown Agent',
      channel: (c.channel || 'web') as 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api',
      action: c.status === 'active' ? 'started conversation on' : `${c.status} conversation on`,
      timestamp: c.createdAt,
    }),
  )

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your AI agent platform"
        action={
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setDateRange(range.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  dateRange === range.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        }
      />

      <MetricGrid columns={4} metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={chartData} />
        </div>
        <div>
          <TopAgents agents={topAgents} />
        </div>
      </div>

      <RecentActivity activities={activities} />

      <Link
        to="/dashboard/analytics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        View detailed analytics
        <ArrowRight className="size-4" />
      </Link>
    </PageContainer>
  )
}
