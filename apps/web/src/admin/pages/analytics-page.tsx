import { useState } from 'react'
import { MessageSquare, CheckCircle, Users, BarChart3, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { useAdminAnalytics } from '@/admin/hooks/use-admin'

const ranges = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, isError } = useAdminAnalytics(days)

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Platform Analytics" description="Aggregated metrics across all organizations." />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl border border-border/60 bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-[300px] rounded-xl border border-border/60 bg-card animate-pulse" />
      </PageContainer>
    )
  }

  if (isError) {
    return (
      <PageContainer>
        <PageHeader title="Platform Analytics" description="Aggregated metrics across all organizations." />
        <EmptyState icon={AlertCircle} title="Failed to load analytics" description="Something went wrong. Please try again." />
      </PageContainer>
    )
  }

  const chartData = (data?.dailyBreakdown || []).map((d) => ({
    date: d.date,
    conversations: d.totalConversations,
    messages: d.totalMessages,
  }))

  return (
    <PageContainer>
      <PageHeader
        title="Platform Analytics"
        description="Aggregated metrics across all organizations."
        action={
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  days === r.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          icon={MessageSquare}
          label="Total Conversations"
          value={data?.totalConversations.toLocaleString() || '0'}
          description={`${data?.conversationsChange ?? 0}% from prev`}
          iconClassName="bg-violet-500/10 text-violet-500"
        />
        <StatsCard
          icon={BarChart3}
          label="Total Messages"
          value={data?.totalMessages.toLocaleString() || '0'}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${data?.successRate ?? 0}%`}
          description={data && data.successRate >= 80 ? 'Excellent' : data?.successRate >= 60 ? 'Good' : 'Needs improvement'}
          descriptionClassName={data?.successRate >= 80 ? 'text-emerald-500' : data?.successRate >= 60 ? 'text-amber-500' : 'text-red-500'}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
        <StatsCard
          icon={Users}
          label="Active Users"
          value={data?.uniqueUsers.toLocaleString() || '0'}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
      </div>

      <OverviewChart data={chartData} loading={isLoading} />
    </PageContainer>
  )
}
