import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Users, Timer, BarChart3, Coins, Hash } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent, ChartLegendContent } from '@/components/application/charts/charts-base'
import { Skeleton } from '@/components/ui/skeleton'
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
  totalInputTokens: number
  totalOutputTokens: number
  channelBreakdown: { channel: string; count: number }[]
  dailyBreakdown: {
    date: string
    totalConversations: number
    totalMessages: number
    uniqueUsers: number
    avgResponseTime: number
    inputTokens: number
    outputTokens: number
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

const activityConfig = {
  totalConversations: { label: 'Conversations', color: 'hsl(142, 71%, 45%)' },
  totalMessages: { label: 'Messages', color: 'hsl(199, 89%, 48%)' },
  uniqueUsers: { label: 'Users', color: 'hsl(263, 70%, 58%)' },
} satisfies ChartConfig

const tokenConfig = {
  inputTokens: { label: 'Input Tokens', color: 'hsl(217, 91%, 60%)' },
  outputTokens: { label: 'Output Tokens', color: 'hsl(38, 92%, 50%)' },
  totalMessages: { label: 'Messages', color: 'hsl(142, 71%, 45%)' },
} satisfies ChartConfig

const channelConfig = {
  count: { label: 'Conversations', color: 'hsl(142, 71%, 45%)' },
} satisfies ChartConfig

const responseTimeConfig = {
  avgResponseTime: { label: 'Avg Response (s)', color: 'hsl(263, 70%, 58%)' },
} satisfies ChartConfig

function trendOf(val: number): { trend: 'up' | 'down' | 'flat'; change: string } {
  if (val > 0) return { trend: 'up', change: `+${val}%` }
  if (val < 0) return { trend: 'down', change: `${val}%` }
  return { trend: 'flat', change: '0%' }
}

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AgentAnalytics({ agentId }: { agentId: string }) {
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
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[280px] w-full rounded-xl" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
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
    inputTokens: d.inputTokens || 0,
    outputTokens: d.outputTokens || 0,
    totalMessages: d.totalMessages,
    avgResponseTime: d.avgResponseTime,
  }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
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

      {/* Activity Overview */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Activity Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={activityConfig} className="h-[280px] w-full">
            <AreaChart data={daily} margin={{ top: 6, bottom: 4, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="act-conv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalConversations)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-totalConversations)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="act-msg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalMessages)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-totalMessages)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="act-user" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-uniqueUsers)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-uniqueUsers)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatDay(v)}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(v) => formatDay(v)} />}
              />
              <Area
                dataKey="totalConversations"
                type="monotone"
                stroke="var(--color-totalConversations)"
                strokeWidth={2}
                fill="url(#act-conv)"
              />
              <Area
                dataKey="totalMessages"
                type="monotone"
                stroke="var(--color-totalMessages)"
                strokeWidth={2}
                fill="url(#act-msg)"
              />
              <Area
                dataKey="uniqueUsers"
                type="monotone"
                stroke="var(--color-uniqueUsers)"
                strokeWidth={2}
                fill="url(#act-user)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Token Usage + Channel Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-4 text-muted-foreground" />
              Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={tokenConfig} className="h-[280px] w-full">
              <BarChart data={tokenData} margin={{ top: 8, bottom: 4, left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatDay(v)}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent labelFormatter={(v) => formatDay(v)} />}
                />
                <Bar dataKey="inputTokens" fill="var(--color-inputTokens)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="outputTokens" fill="var(--color-outputTokens)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {channelData.length > 0 && (
          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="size-4 text-muted-foreground" />
                Channel Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={channelConfig} className="h-[280px] w-full">
                <BarChart data={channelData} margin={{ top: 8, bottom: 4, left: 0, right: 0 }} layout="vertical">
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Response Time */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="size-4 text-muted-foreground" />
            Response Time
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={responseTimeConfig} className="h-[200px] w-full">
            <AreaChart data={daily} margin={{ top: 6, bottom: 4, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="rt-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-avgResponseTime)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-avgResponseTime)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatDay(v)}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(v) => formatDay(v)} />}
              />
              <Area
                dataKey="avgResponseTime"
                type="monotone"
                stroke="var(--color-avgResponseTime)"
                strokeWidth={2}
                fill="url(#rt-grad)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
