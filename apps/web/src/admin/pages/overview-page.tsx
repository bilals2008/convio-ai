import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  Bot,
  MessageSquare,
  Activity,
  AlertTriangle,
  Rocket,
  ArrowUpRight,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { PageContainer } from '@/components/shared/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import {
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminStats, useAdminAnalytics, useSystemHealth, useAuditLogs } from '@/admin/hooks/use-admin'

const axisDate = (v: string | number) =>
  new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const GREEN = 'hsl(142, 71%, 45%)'
const BLUE = 'hsl(217, 91%, 60%)'
const CYAN = 'hsl(199, 98%, 55%)'

const activityConfig = {
  messages: { label: 'Messages', color: GREEN },
  conversations: { label: 'Conversations', color: BLUE },
  users: { label: 'Active Users', color: CYAN },
} satisfies ChartConfig

const growthConfig = {
  users: { label: 'Users', color: GREEN },
  orgs: { label: 'Organizations', color: BLUE },
} satisfies ChartConfig

const channelConfig = {
  count: { label: 'Conversations', color: GREEN },
} satisfies ChartConfig

function ChartLegendItems({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatAction(action: string) {
  return action.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function HealthRow({
  icon: Icon,
  iconClassName,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="size-3.5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-5 w-10" />
      ) : (
        <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      )}
    </div>
  )
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(30)
  const { data: health, isLoading: healthLoading } = useSystemHealth()
  const { data: logs, isLoading: logsLoading } = useAuditLogs({ limit: 6 })

  const chartData = (analytics?.dailyBreakdown || []).map((d) => ({
    date: d.date,
    conversations: d.totalConversations,
    messages: d.totalMessages,
    users: d.uniqueUsers,
  }))

  // cumulative signups → growth lines (users vs orgs)
  let u = 0
  let o = 0
  const growthData = (analytics?.dailyBreakdown || []).map((d, i) => {
    u += analytics?.userSignups?.[i]?.count ?? 0
    o += analytics?.orgSignups?.[i]?.count ?? 0
    return { date: d.date, users: u, orgs: o }
  })

  const channelData = (analytics?.channelBreakdown ?? []).map((c) => ({
    channel: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    count: c.count,
  }))

  const recentLogs = logs?.data ?? []
  const topOrgs = (analytics?.topOrgs ?? []).slice(0, 5)
  const maxOrgConversations = Math.max(...topOrgs.map((o) => o.conversationCount), 1)

  return (
    <PageContainer>
      <PageHeader title="Overview" description="Platform-wide metrics and key performance indicators." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Total Users"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          change={stats ? `+${stats.newUsers30d} in 30d` : undefined}
          trend={stats && stats.newUsers30d > 0 ? 'up' : 'flat'}
          loading={statsLoading}
        />
        <KpiCard
          icon={Building2}
          label="Organizations"
          value={(stats?.totalOrgs ?? 0).toLocaleString()}
          change={stats ? `${stats.payingUsers} paying users` : undefined}
          trend="flat"
          loading={statsLoading}
        />
        <KpiCard
          icon={Bot}
          label="Agents"
          value={(stats?.totalAgents ?? 0).toLocaleString()}
          change={stats ? `${stats.activeUsers} active users` : undefined}
          trend="flat"
          loading={statsLoading}
        />
        <KpiCard
          icon={MessageSquare}
          label="Messages (24h)"
          value={(stats?.messagesLast24h ?? 0).toLocaleString()}
          change={stats ? `${stats.conversationsLast24h} conversations` : undefined}
          trend={stats && stats.messagesLast24h > 0 ? 'up' : 'flat'}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-3 border-b py-4">
            <CardTitle className="text-base">Platform Activity</CardTitle>
            <ChartLegendItems
              items={[
                { label: 'Messages', color: GREEN },
                { label: 'Conversations', color: BLUE },
                { label: 'Active Users', color: CYAN },
              ]}
            />
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {analyticsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No activity data yet.</p>
            ) : (
              <ChartContainer config={activityConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={40}
                    tickFormatter={axisDate}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={axisDate}
                        indicator="dot"
                        className="fill-card"
                      />
                    }
                  />
                  <Line dataKey="messages" type="monotone" stroke="var(--color-messages)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line dataKey="conversations" type="monotone" stroke="var(--color-conversations)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2 border-b py-4">
            <Activity className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 px-5 py-2">
            <HealthRow
              icon={AlertTriangle}
              iconClassName="bg-destructive/10 text-destructive"
              label="Errors (24h)"
              value={health?.errorsLast24h ?? 0}
              loading={healthLoading}
            />
            <HealthRow
              icon={Rocket}
              iconClassName="bg-primary/10 text-primary"
              label="Active Deployments"
              value={health?.activeDeployments ?? 0}
              loading={healthLoading}
            />
            <HealthRow
              icon={Users}
              iconClassName="bg-primary/10 text-primary"
              label="Active Users"
              value={stats?.activeUsers ?? 0}
              loading={statsLoading}
            />
            <HealthRow
              icon={Bot}
              iconClassName="bg-primary/10 text-primary"
              label="Suspended Users"
              value={stats?.suspendedUsers ?? 0}
              loading={statsLoading}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-3 border-b py-4">
            <CardTitle className="text-base">Growth</CardTitle>
            <ChartLegendItems
              items={[
                { label: 'Users', color: GREEN },
                { label: 'Organizations', color: BLUE },
              ]}
            />
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {analyticsLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : growthData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No signup data yet.</p>
            ) : (
              <ChartContainer config={growthConfig} className="h-[260px] w-full">
                <LineChart data={growthData} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={40}
                    tickFormatter={axisDate}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent labelFormatter={axisDate} indicator="dot" className="fill-card" />}
                  />
                  <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line dataKey="orgs" type="monotone" stroke="var(--color-orgs)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {analyticsLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : channelData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No channel data yet.</p>
            ) : (
              <ChartContainer config={channelConfig} className="mx-auto h-[260px] w-full max-w-[300px]">
                <RadarChart data={channelData} outerRadius="70%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="channel" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" className="fill-card" />} />
                  <Radar dataKey="count" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between border-b py-4">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link
              to="/admin/audit-logs"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 py-2">
            {logsLoading ? (
              <div className="space-y-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-7 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                      {(log.actor?.name ?? log.actor?.email ?? '?').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        <span className="font-medium">{log.actor?.name ?? log.actor?.email ?? 'System'}</span>
                        {' '}
                        <span className="text-muted-foreground">{formatAction(log.action).toLowerCase()}</span>
                        {' '}
                        <span className="text-muted-foreground">{log.entityType.toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between border-b py-4">
            <CardTitle className="text-base">Top Organizations</CardTitle>
            <Link
              to="/admin/organizations"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 py-3">
            {analyticsLoading ? (
              <div className="space-y-4 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : topOrgs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No organization activity yet.</p>
            ) : (
              <div className="space-y-1">
                {topOrgs.map((org) => (
                  <Link
                    key={org.id}
                    to={`/admin/organizations/${org.id}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-semibold uppercase text-primary">
                      {org.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {org.conversationCount.toLocaleString()} convos
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${Math.max((org.conversationCount / maxOrgConversations) * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </PageContainer>
  )
}
