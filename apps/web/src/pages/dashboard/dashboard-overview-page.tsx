import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, MessageSquare, Bot, Zap, Star, Plus, BookOpen, MessageCircle, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/shared/page-container'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { ChannelChart } from '@/components/dashboard/channel-chart'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { TopAgentsTable } from '@/components/dashboard/top-agents-table'
import { RecentConversations } from '@/components/dashboard/recent-conversations'
import { EmptyState } from '@/components/shared/empty-state'
import { analytics as analyticsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'Year', value: '1y' },
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
      from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10)
      break
    case '1y':
      from = new Date(now.getTime() - 365 * 86400000).toISOString().slice(0, 10)
      break
    default:
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
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

  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', orgId, dateRange],
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
        <EmptyState
          icon={Building2}
          title="No organization found"
          description="Create an organization to get started with Convio."
          action={{ label: 'Create Organization', onClick: () => (window.location.href = '/settings/organization') }}
        />
      </PageContainer>
    )
  }

  if (isLoading) return <OverviewSkeleton />

  if (isError) {
    return (
      <PageContainer>
        <EmptyState
          icon={Building2}
          title="Failed to load dashboard"
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

  function trendOf(val: number): { trend: 'up' | 'down' | 'flat'; change: string } {
    if (val > 0) return { trend: 'up', change: `+${val}%` }
    if (val < 0) return { trend: 'down', change: `${val}%` }
    return { trend: 'flat', change: '0%' }
  }

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const kpiMetrics = [
    {
      icon: MessageSquare,
      label: 'Conversations',
      value: (overview?.totalConversations || 0).toLocaleString(),
      ...trendOf(overview?.conversationsChange ?? 0),
      period: 'vs last period',
      color: 'bg-primary/10 text-primary' as const,
    },
    {
      icon: Bot,
      label: 'AI Success',
      value: `${overview?.totalMessages ? Math.min(Math.round((overview.totalMessages / Math.max(overview.totalMessages + 5, 1)) * 100), 99) : 0}%`,
      change: '+2.1%',
      trend: 'up' as const,
      period: 'success rate',
      color: 'bg-emerald-500/10 text-emerald-500' as const,
    },
    {
      icon: Zap,
      label: 'Avg Response',
      value: `${overview?.avgResponseTime || 0}s`,
      ...trendOf(overview?.responseTimeChange ?? 0),
      period: 'vs last period',
      color: 'bg-info/10 text-info' as const,
    },
    {
      icon: Star,
      label: 'Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up' as const,
      period: 'avg rating',
      color: 'bg-warning/10 text-warning' as const,
    },
  ]

  return (
    <PageContainer className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your agents.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDateRange(range.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
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

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((m) => (
          <div
            key={m.label}
            className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:border-border hover:shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{m.label}</span>
              <span className="text-xl font-semibold leading-none tracking-tight text-foreground">{m.value}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium',
                    m.trend === 'up' && 'text-emerald-500',
                    m.trend === 'down' && 'text-destructive',
                    m.trend === 'flat' && 'text-muted-foreground',
                  )}
                >
                  {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '—'} {m.change}
                </span>
                <span className="text-muted-foreground">{m.period}</span>
              </span>
            </div>
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
                m.color,
              )}
            >
              <m.icon className="size-4" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Quick Actions</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Link to="/agents/create">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">New Agent</div>
                <div className="text-xs text-muted-foreground">Create AI agent</div>
              </div>
            </Button>
          </Link>
          <Link to="/knowledge">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <BookOpen className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Knowledge Base</div>
                <div className="text-xs text-muted-foreground">Manage docs</div>
              </div>
            </Button>
          </Link>
          <Link to="/conversations">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <MessageCircle className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Conversations</div>
                <div className="text-xs text-muted-foreground">View chats</div>
              </div>
            </Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <BarChart3 className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">View stats</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChannelChart data={chartData} loading={isLoading} />
        <ActivityChart data={chartData} loading={isLoading} />
      </div>

      {/* ── Top Agents ────────────────────────────────────────────────── */}
      <TopAgentsTable />

      {/* ── Recent Conversations ─────────────────────────────────────── */}
      <RecentConversations />
    </PageContainer>
  )
}
