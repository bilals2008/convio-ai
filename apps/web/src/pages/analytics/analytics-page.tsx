import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessagesSquare, Send, Timer, Cpu, Building2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PageHeader } from '@/components/shared/page-header'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { ResponseTimeChart } from '@/components/analytics/response-time-chart'
import { ChannelPerformanceChart } from '@/components/analytics/channel-performance-chart'
import { AgentPerformanceTable } from '@/components/analytics/agent-performance-table'
import { EmptyState } from '@/components/shared/empty-state'
import { analytics as analyticsApi } from '@/lib/api'
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

  const totalConversations = overview?.totalConversations || 0
  const totalMessages = overview?.totalMessages || 0
  const avgResponseTime = overview?.avgResponseTime || 0

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Track performance across your agents and channels"
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          value={overview ? String((overview as Record<string, unknown>).activeAgents ?? '—') : '—'}
          description="Across all channels"
          iconClassName="bg-violet-500/10 text-violet-500 dark:text-violet-400"
        />
      </div>

      <OverviewChart data={chartData} loading={isLoading} />

      {/* ── Response Time & Channel Performance ──────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ResponseTimeChart data={chartData} loading={isLoading} />
        <ChannelPerformanceChart data={overview?.channelBreakdown} loading={isLoading} />
      </div>

      {/* ── Agent Performance Table ──────────────────────────────────── */}
      <AgentPerformanceTable />
    </PageContainer>
  )
}
