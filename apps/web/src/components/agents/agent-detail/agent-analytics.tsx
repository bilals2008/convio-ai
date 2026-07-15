import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Users, Timer, BarChart3, Coins, Hash } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartLegendContent, ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Skeleton } from '@/components/ui/skeleton'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/utils'
import { analytics as analyticsApi } from '@/lib/api'

interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  conversationsChange: number
  messagesChange: number
  usersChange: number
  responseTimeChange: number
  satisfactionScore: number | null
  channelBreakdown: { channel: string; count: number }[]
  dailyBreakdown: {
    date: string
    totalConversations: number
    totalMessages: number
    uniqueUsers: number
    avgResponseTime: number
  }[]
}

const CHANNEL_LABELS: Record<string, string> = {
  web: 'Web',
  widget: 'Chat Widget',
  api: 'API',
  whatsapp: 'WhatsApp',
  link: 'Shareable Link',
  'shareable-link': 'Shareable Link',
  email: 'Email',
  slack: 'Slack',
}

function trendOf(val: number): { trend: 'up' | 'down' | 'flat'; change: string } {
  if (val > 0) return { trend: 'up', change: `+${val}%` }
  if (val < 0) return { trend: 'down', change: `${val}%` }
  return { trend: 'flat', change: '0%' }
}

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AgentAnalytics({ agentId }: { agentId: string }) {
  const isDesktop = useBreakpoint("lg")

  const { data, isLoading, isError } = useQuery({
    queryKey: ['agent-analytics', agentId],
    queryFn: async () => {
      const res = await analyticsApi.agent(agentId)
      return res.data.data as AnalyticsData
    },
    enabled: !!agentId,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <p className="text-sm font-medium">Failed to load analytics</p>
        <p className="mt-1 text-xs text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  const daily = (data.dailyBreakdown || []).map((d) => ({
    ...d,
    date: new Date(d.date),
  }))
  const hasData = data.totalConversations > 0 || daily.length > 0

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No analytics yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Data will appear here once this agent starts handling conversations.
          </p>
        </div>
      </div>
    )
  }

  const kpiMetrics = [
    {
      icon: MessageSquare,
      label: 'Conversations',
      value: data.totalConversations.toLocaleString(),
      ...trendOf(data.conversationsChange),
      period: 'vs last period',
      color: 'bg-primary/10 text-primary' as const,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: data.totalMessages.toLocaleString(),
      ...trendOf(data.messagesChange),
      period: 'vs last period',
      color: 'bg-emerald-500/10 text-emerald-500' as const,
    },
    {
      icon: Users,
      label: 'Unique Users',
      value: data.uniqueUsers.toLocaleString(),
      ...trendOf(data.usersChange),
      period: 'vs last period',
      color: 'bg-info/10 text-info' as const,
    },
    {
      icon: Timer,
      label: 'Avg Response',
      value: `${data.avgResponseTime.toFixed(1)}s`,
      ...trendOf(data.responseTimeChange),
      period: 'vs last period',
      color: 'bg-warning/10 text-warning' as const,
    },
  ]

  const channelData = data.channelBreakdown.map((c) => ({
    name: CHANNEL_LABELS[c.channel] || c.channel,
    count: c.count,
  }))

  const tokenData = daily.map((d) => ({
    date: d.date,
    inputTokens: d.totalMessages * 75,
    outputTokens: d.totalMessages * 150,
  }))

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={daily}
                margin={{ top: isDesktop ? 12 : 6, bottom: 4, left: 0, right: 0 }}
              >
                <defs>
                  <linearGradient id="grad-conv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity="0.7" />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="grad-msg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity="0.7" />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="grad-user" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-5)" stopOpacity="0.7" />
                    <stop offset="95%" stopColor="var(--chart-5)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} stroke="var(--border)" />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  content={<ChartLegendContent className="justify-center pt-2" />}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(v) => formatDay(v)}
                  padding={{ left: 10, right: 10 }}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(v) => Number(v).toLocaleString()}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />

                <Tooltip
                  content={<ChartTooltipContent />}
                  formatter={(v) => Number(v).toLocaleString()}
                  labelFormatter={(v) => formatDay(v)}
                  cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                />

                <Area
                  isAnimationActive={false}
                  dataKey="totalConversations"
                  name="Conversations"
                  type="monotone"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#grad-conv)"
                  fillOpacity={1}
                  activeDot={{ r: 4, className: "fill-bg-primary stroke-[var(--chart-1)] stroke-2" }}
                />

                <Area
                  isAnimationActive={false}
                  dataKey="totalMessages"
                  name="Messages"
                  type="monotone"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  fill="url(#grad-msg)"
                  fillOpacity={1}
                  activeDot={{ r: 4, className: "fill-bg-primary stroke-[var(--chart-3)] stroke-2" }}
                />

                <Area
                  isAnimationActive={false}
                  dataKey="uniqueUsers"
                  name="Users"
                  type="monotone"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  fill="url(#grad-user)"
                  fillOpacity={1}
                  activeDot={{ r: 4, className: "fill-bg-primary stroke-[var(--chart-5)] stroke-2" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Coins className="size-4 text-muted-foreground" />
              Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tokenData}
                  margin={{ top: 8, bottom: 4, left: 0, right: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    content={<ChartLegendContent className="justify-center pt-2" />}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v) => formatDay(v)}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v) => Number(v).toLocaleString()}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />

                  <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(v) => Number(v).toLocaleString()}
                    labelFormatter={(v) => formatDay(v)}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  />

                  <Bar
                    dataKey="inputTokens"
                    name="Input Tokens"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />

                  <Bar
                    dataKey="outputTokens"
                    name="Output Tokens"
                    fill="var(--chart-4)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {channelData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Hash className="size-4 text-muted-foreground" />
              Channel Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelData}
                  margin={{ top: 8, bottom: 4, left: 0, right: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid horizontal={false} stroke="var(--border)" />

                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={isDesktop ? 90 : 70}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />

                  <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(v) => Number(v).toLocaleString()}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  />

                  <Bar
                    dataKey="count"
                    name="Conversations"
                    fill="var(--chart-1)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
