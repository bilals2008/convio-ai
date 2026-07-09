import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { MessagesChart } from '@/components/dashboard/messages-chart'
import { ChannelDistribution } from '@/components/dashboard/channel-distribution'
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

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  const stats = {
    totalConversations: overview?.totalConversations || 0,
    totalMessages: overview?.totalMessages || 0,
    activeUsers: overview?.uniqueUsers || 0,
    avgResponseTime: overview?.avgResponseTime || 0,
    conversationsChange: overview?.conversationsChange ?? 0,
    messagesChange: overview?.messagesChange ?? 0,
    usersChange: overview?.usersChange ?? 0,
    responseTimeChange: overview?.responseTimeChange ?? 0,
  }

  const conversationsChartData = (overview?.dailyBreakdown || []).map(
    (d: { date: string; totalConversations: number }) => ({
      date: formatShortDate(d.date),
      conversations: d.totalConversations,
    }),
  )

  const messagesChartData = (overview?.dailyBreakdown || []).map(
    (d: { date: string; totalMessages: number }) => {
      const half = Math.round(d.totalMessages / 2)
      return {
        date: formatShortDate(d.date),
        userMessages: half,
        assistantMessages: d.totalMessages - half,
      }
    },
  )

  const channelData = (overview?.channelBreakdown || []).map(
    (c: { channel: string; count: number }) => ({
      channel: c.channel as 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api',
      count: c.count,
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

      <StatsGrid data={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ConversationsChart data={conversationsChartData} />
          <MessagesChart data={messagesChartData} />
        </div>
        <div className="space-y-6">
          <ChannelDistribution data={channelData} />
          <TopAgents agents={topAgents} />
        </div>
      </div>

      <RecentActivity activities={activities} />
    </PageContainer>
  )
}
