import { useState } from 'react'
import { DollarSign, CheckCircle, Cpu, Users } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PageHeader } from '@/components/shared/page-header'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { ResponseTimeChart } from '@/components/analytics/response-time-chart'
import { ChannelPerformanceChart } from '@/components/analytics/channel-performance-chart'
import { TokenCostTrend } from '@/components/analytics/token-cost-trend'
import { AgentPerformanceTable } from '@/components/analytics/agent-performance-table'
import { TopDocumentsTable } from '@/components/analytics/top-documents-table'
import { EmptyState } from '@/components/shared/empty-state'
import { useOrgAnalytics } from '@/hooks/use-analytics'
import { useOrg } from '@/lib/org-context'

const dateRanges = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
] as const

function getDateRange(range: string) {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)

  switch (range) {
    case '7d':
      return { from: new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10), to }
    case '90d':
      return { from: new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10), to }
    case '30d':
    default:
      return { from: new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10), to }
  }
}

export default function AnalyticsPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const [dateRange, setDateRange] = useState<string>('30d')
  const { from, to } = getDateRange(dateRange)

  const { data: overview, isLoading, isError, error } = useOrgAnalytics(orgId, from, to)

  if (orgLoading) return <OverviewSkeleton />
  if (!orgId) {
    return (
      <PageContainer>
        <PageHeader title="Analytics" description="Track performance across your agents and channels" />
        <EmptyState
          icon={Users}
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
          icon={Users}
          title="Failed to load analytics"
          description={(error as Error)?.message || 'Something went wrong. Please try again.'}
        />
      </PageContainer>
    )
  }

  const chartData = (overview?.dailyBreakdown || []).map((d) => ({
    date: d.date,
    conversations: d.totalConversations,
    messages: d.totalMessages,
  }))

  const responseTimeData = (overview?.dailyBreakdown || []).map((d) => ({
    date: d.date,
    avgResponseTime: d.avgResponseTime ?? 0,
  }))

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
          icon={DollarSign}
          label="Total Cost"
          value={`$${overview.totalCost.toFixed(2)}`}
          description={`${overview.conversationsChange >= 0 ? '+' : ''}${overview.conversationsChange}% from prev`}
          iconClassName="bg-violet-500/10 text-violet-500 dark:text-violet-400"
        />
        <StatsCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${overview.successRate}%`}
          description={`${overview.successRate >= 80 ? 'Excellent' : overview.successRate >= 60 ? 'Good' : 'Needs improvement'}`}
          descriptionClassName={overview.successRate >= 80 ? 'text-emerald-500' : overview.successRate >= 60 ? 'text-amber-500' : 'text-red-500'}
          iconClassName="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
        />
        <StatsCard
          icon={Cpu}
          label="Tokens Used"
          value={(overview.totalInputTokens + overview.totalOutputTokens).toLocaleString()}
          description={`${overview.totalInputTokens.toLocaleString()} in · ${overview.totalOutputTokens.toLocaleString()} out`}
          iconClassName="bg-blue-500/10 text-blue-500 dark:text-blue-400"
        />
        <StatsCard
          icon={Users}
          label="Active Users"
          value={overview.uniqueUsers.toLocaleString()}
          description={`${overview.usersChange >= 0 ? '+' : ''}${overview.usersChange}% from prev`}
          iconClassName="bg-amber-500/10 text-amber-500 dark:text-amber-400"
        />
      </div>

      <OverviewChart data={chartData} loading={isLoading} />

      <div className="grid gap-3 lg:grid-cols-2">
        <ResponseTimeChart data={responseTimeData} loading={isLoading} />
        <ChannelPerformanceChart data={overview.channelBreakdown} loading={isLoading} />
      </div>

      <TokenCostTrend data={overview.dailyBreakdown} totalCost={overview.totalCost} loading={isLoading} />

      <AgentPerformanceTable />
      <TopDocumentsTable orgId={orgId} />
    </PageContainer>
  )
}
