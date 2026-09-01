import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  Building2,
  MessageSquare,
  Bot,
  Zap,
  Star,
  Plus,
  BookOpen,
  MessageCircle,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  LifeBuoy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/shared/page-container'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { KPICard, ProgressCard } from '@/components/dashboard/stats-card'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { analytics as analyticsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useAuth } from '@/lib/auth-context'
import { usePlan, useUsage } from '@/lib/hooks/use-billing'
import { cn } from '@/lib/utils'
import { formatResponseTime } from '@/lib/analytics'

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
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
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
      break
    case '90d':
    default:
      from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10)
  }

  return { from, to }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function DashboardOverviewPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<string>('30d')
  const { from, to } = getDateRange(dateRange)

  const { data: overview, isFetching } = useQuery({
    queryKey: ['dashboard', orgId, dateRange],
    queryFn: async () => {
      const res = await analyticsApi.overview(orgId!, { from, to })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
    placeholderData: keepPreviousData,
  })

  const { data: plan, isLoading: planLoading, isError: planError } = usePlan()
  const { data: usage, isLoading: usageLoading, isError: usageError } = useUsage()

  if (orgLoading) return <OverviewSkeleton />

  if (!orgId) {
    return (
      <PageContainer>
        <EmptyState
          icon={Building2}
          title="No organization found"
          description="Create an organization to get started with Convio."
        />
      </PageContainer>
    )
  }

  if (!overview) return <OverviewSkeleton />

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  function trendOf(val: number) {
    if (val > 0) return { trend: 'up' as const, change: `+${val}%` }
    if (val < 0) return { trend: 'down' as const, change: `${val}%` }
    return { trend: 'flat' as const, change: '0%' }
  }

  const usagePercent = usage ? Math.min(usage.messagesPercent, 100) : 0
  const usageDescription = usage
    ? `${usage.messages.toLocaleString()} / ${usage.limit.toLocaleString()} messages used this month`
    : undefined

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your agents.
          </p>
        </div>
        <div className="flex gap-0.5 sm:gap-1 rounded-lg bg-muted p-0.5 sm:p-1 overflow-x-auto">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDateRange(range.value)}
              className={cn(
                'rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                dateRange === range.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={MessageSquare}
          label="Conversations"
          value={(overview.totalConversations || 0).toLocaleString()}
          iconClassName="bg-primary/10 text-primary"
          {...trendOf(overview.conversationsChange ?? 0)}
          period="vs last period"
        />
        <KPICard
          icon={Bot}
          label="AI Success"
          value={`${overview.successRate ?? 0}%`}
          iconClassName="bg-emerald-500/10 text-emerald-500"
          change={`${overview.successRate ? '+' : ''}${overview.successRate ?? 0}%`}
          trend="up"
          period="success rate"
        />
        <KPICard
          icon={Zap}
          label="Avg Response"
          value={formatResponseTime(overview.avgResponseTime ?? 0)}
          iconClassName="bg-info/10 text-info"
          {...trendOf(overview.responseTimeChange ?? 0)}
          period="vs last period"
        />
        <KPICard
          icon={Star}
          label="Resolution Rate"
          value={`${overview.resolutionRate ?? 0}%`}
          iconClassName="bg-warning/10 text-warning"
          change={`${overview.resolutionRate ? '+' : ''}${overview.resolutionRate ?? 0}%`}
          trend="up"
          period="resolved rate"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Quick Actions</h2>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/agents/create">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2.5 sm:py-3">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="size-3.5 sm:size-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs sm:text-sm font-medium truncate">New Agent</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Create AI agent</div>
              </div>
            </Button>
          </Link>
          <Link to="/knowledge">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2.5 sm:py-3">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <BookOpen className="size-3.5 sm:size-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs sm:text-sm font-medium truncate">Knowledge Base</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Manage docs</div>
              </div>
            </Button>
          </Link>
          <Link to="/conversations">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2.5 sm:py-3">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <MessageCircle className="size-3.5 sm:size-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs sm:text-sm font-medium truncate">Conversations</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">View chats</div>
              </div>
            </Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2.5 sm:py-3">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <BarChart3 className="size-3.5 sm:size-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs sm:text-sm font-medium truncate">Analytics</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">View stats</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
        {planLoading || usageLoading ? (
          <>
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
          </>
        ) : planError || usageError ? (
          <>
            <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Plan Usage</span>
              <p className="mt-2 text-xs text-muted-foreground">Unable to load plan data.</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Limits</span>
              <p className="mt-2 text-xs text-muted-foreground">Unable to load limits.</p>
            </div>
          </>
        ) : (
          <>
            <ProgressCard
              icon={CreditCard}
              label="Plan Usage"
              value={`${plan?.label || 'Free'} Plan`}
              progress={usagePercent}
              iconClassName="bg-violet-500/10 text-violet-500"
              barClassName="bg-violet-500"
              description={usageDescription}
            />
            {plan?.limits && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 transition-all duration-200 hover:border-border hover:shadow-sm">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    Limits
                  </span>
                  <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
                    {plan.limits.agents} agents
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {plan.limits.messagesPerMonth.toLocaleString()} messages/mo &middot; {plan.limits.knowledgeBases} KBs
                  </span>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info transition-transform duration-200 group-hover:scale-105">
                  <Zap className="size-5" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upgrade CTA */}
      {plan?.name === 'free' && (
        <Link
          to="/settings/billing"
          className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/10"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Upgrade your plan</span>
            <span className="text-xs text-muted-foreground">
              Unlock more agents, messages, and priority support.
            </span>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-primary" />
        </Link>
      )}

      {/* Activity Chart */}
      <ActivityChart
        data={(overview?.dailyBreakdown || []).map(
          (d: { date: string; totalConversations: number; totalMessages: number }) => ({
            date: d.date,
            conversations: d.totalConversations,
            messages: d.totalMessages,
          }),
        )}
        loading={isFetching}
      />

      {/* Help Tip */}
      <div className="flex justify-center py-4">
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <LifeBuoy className="size-3.5" />
          Need help? Check out our docs
        </a>
      </div>
    </PageContainer>
  )
}
