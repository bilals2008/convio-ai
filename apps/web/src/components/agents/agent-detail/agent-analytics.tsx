import { useQuery } from '@tanstack/react-query'
import {
  MessageSquare,
  Users,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  default: 'Other',
}

function formatDay(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span
      className={
        positive
          ? 'inline-flex items-center gap-0.5 text-[11px] font-medium text-success'
          : 'inline-flex items-center gap-0.5 text-[11px] font-medium text-destructive'
      }
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(value)}%
    </span>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  change,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  suffix?: string
  change?: number
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {change !== undefined && <ChangeBadge value={change} />}
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
            {suffix && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const chartAxis = { fontSize: 11, fill: 'var(--muted-foreground)' }
const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '11px',
  color: 'var(--popover-foreground)',
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-4">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

  const daily = (data.dailyBreakdown || []).map((d) => ({ ...d, label: formatDay(d.date) }))
  const hasData = data.totalConversations > 0 || daily.length > 0

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/60">
          <BarChart3 className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No analytics yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Data will appear here once this agent starts handling conversations.
        </p>
      </div>
    )
  }

  const maxChannel = Math.max(1, ...data.channelBreakdown.map((c) => c.count))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<MessageSquare className="size-4" />}
          label="Conversations"
          value={data.totalConversations.toLocaleString()}
          change={data.conversationsChange}
        />
        <StatCard
          icon={<MessageSquare className="size-4" />}
          label="Messages"
          value={data.totalMessages.toLocaleString()}
          change={data.messagesChange}
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Unique Users"
          value={data.uniqueUsers.toLocaleString()}
          change={data.usersChange}
        />
        <StatCard
          icon={<Timer className="size-4" />}
          label="Avg Response"
          value={data.avgResponseTime.toFixed(1)}
          suffix="s"
          change={data.responseTimeChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={chartAxis} axisLine={false} tickLine={false} />
                <YAxis tick={chartAxis} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="totalConversations" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={chartAxis} axisLine={false} tickLine={false} />
                <YAxis
                  tick={chartAxis}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
                <Line
                  type="monotone"
                  dataKey="avgResponseTime"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.channelBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.channelBreakdown.map((item) => (
                <div key={item.channel} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium">
                    {CHANNEL_LABELS[item.channel] ?? item.channel}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.count / maxChannel) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
