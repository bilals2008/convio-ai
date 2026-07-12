import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, MessagesSquare, Send, Timer, Cpu, Building2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { ChannelDistribution } from '@/components/dashboard/channel-distribution'
import { DailyConversationsChart } from '@/components/analytics/daily-conversations-chart'
import { AgentBarChart } from '@/components/analytics/agent-bar-chart'
import { AgentsPerformanceTable } from '@/components/analytics/agents-performance-table'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { analytics as analyticsApi } from '@/lib/api'
import api from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const dateRanges = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
] as const

function getDateRange(range: string) {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  let from: string

  switch (range) {
    case '7d':
      from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
      break
    case '90d':
      from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10)
      break
    case '30d':
    default:
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
      break
  }

  return { from, to }
}

export default function AnalyticsPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const [dateRange, setDateRange] = useState<string>('30d')
  const { from, to } = getDateRange(dateRange)

  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ['analytics', orgId, dateRange],
    queryFn: async () => {
      const res = await analyticsApi.overview(orgId!, { from, to })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
  })

  const { data: topAgentsData } = useQuery({
    queryKey: ['analytics-top-agents', orgId, dateRange],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/analytics/top-agents`, {
        params: { from, to, limit: 10 },
      })
      return res.data.data as { agentId: string; agentName: string; totalConversations: number; totalMessages: number; avgResponseTime: number; satisfactionScore?: number | null }[]
    },
    enabled: !!orgId,
    retry: false,
  })

  if (orgLoading) return <OverviewSkeleton />

  if (!orgId) {
    return (
      <PageContainer>
        <PageHeader title="Analytics" description="Track performance across your agents and channels" />
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
        <PageHeader title="Analytics" description="Track performance across your agents and channels" />
        <EmptyState
          icon={Building2}
          title="Failed to load analytics"
          description={(error as Error)?.message || 'Something went wrong. Please try again.'}
        />
      </PageContainer>
    )
  }

  const chartData = (overview?.dailyBreakdown || []).map(
    (d: { date: string; totalConversations: number; totalMessages: number }) => ({
      date: d.date,
      conversations: d.totalConversations,
      messages: d.totalMessages,
    }),
  )

  const channelData = (overview?.channelBreakdown || []).map(
    (c: { channel: string; count: number }) => ({
      channel: c.channel as 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api',
      count: c.count,
    }),
  )

  const agentsPerformance = (topAgentsData || []).map(
    (b) => ({
      id: b.agentId,
      name: b.agentName,
      conversations: b.totalConversations,
      messages: b.totalMessages,
      avgResponseTime: b.avgResponseTime,
      satisfactionScore: b.satisfactionScore ?? undefined,
    }),
  )

  const dailyConversationsData = (overview?.dailyBreakdown || []).map(
    (d: { date: string; totalConversations: number }) => ({
      date: d.date,
      conversations: d.totalConversations,
    }),
  )

  const totalConversations = overview?.totalConversations || 0
  const totalMessages = overview?.totalMessages || 0
  const avgResponseTime = overview?.avgResponseTime || 0
  const activeAgents = (topAgentsData || []).length

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Track performance across your agents and channels"
        action={
          <div className="flex flex-wrap items-center gap-2">
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
            <Button variant="outline" size="default">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={MessagesSquare}
          label="Conversations"
          value={totalConversations.toLocaleString()}
          description={`${overview?.conversationsChange >= 0 ? '+' : ''}${overview?.conversationsChange ?? 0}% from prev`}
          iconClassName="bg-blue-500/10 text-blue-500 dark:text-blue-400"
        />
        <StatsCard
          icon={Send}
          label="Messages"
          value={totalMessages.toLocaleString()}
          description={`${Math.round(totalMessages / Math.max(totalConversations, 1))} per conversation`}
          iconClassName="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
        />
        <StatsCard
          icon={Timer}
          label="Avg Response"
          value={`${avgResponseTime}s`}
          description={avgResponseTime < 1 ? 'Excellent' : avgResponseTime < 2 ? 'Good' : 'Needs improvement'}
          descriptionClassName={avgResponseTime < 1 ? 'text-emerald-500' : avgResponseTime < 2 ? 'text-amber-500' : 'text-red-500'}
          iconClassName="bg-amber-500/10 text-amber-500 dark:text-amber-400"
        />
        <StatsCard
          icon={Cpu}
          label="Active Agents"
          value={activeAgents.toString()}
          description="Across all channels"
          iconClassName="bg-violet-500/10 text-violet-500 dark:text-violet-400"
        />
      </div>

      <div>
        <OverviewChart data={chartData} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChannelDistribution data={channelData} loading={isLoading} />
        </div>
        <div>
          <DailyConversationsChart data={dailyConversationsData} loading={isLoading} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AgentsPerformanceTable agents={agentsPerformance} loading={isLoading} />
        </div>
        <div>
          <AgentBarChart data={agentsPerformance} loading={isLoading} metric="conversations" />
        </div>
      </div>
    </PageContainer>
  )
}
