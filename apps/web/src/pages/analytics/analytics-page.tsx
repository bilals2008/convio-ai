import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { MessagesChart } from '@/components/dashboard/messages-chart'
import { ChannelDistribution } from '@/components/dashboard/channel-distribution'
import { ResponseTimeChart } from '@/components/analytics/response-time-chart'
import { BotsPerformanceTable } from '@/components/analytics/bots-performance-table'
import { ResolutionMetrics } from '@/components/analytics/resolution-metrics'
import { MessageSquare, MessageCircle, Users, Clock, TrendingUp, Bot } from 'lucide-react'
import { analytics as analyticsApi } from '@/lib/api'

const dateRanges = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
] as const

const MOCK_ORG_ID = 'mock-org-id'

function generateDailyData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      conversations: Math.floor(Math.random() * 60) + 15,
      messages: Math.floor(Math.random() * 300) + 40,
      userMessages: Math.floor(Math.random() * 150) + 20,
      assistantMessages: Math.floor(Math.random() * 150) + 20,
      avgTime: +(Math.random() * 2 + 0.5).toFixed(1),
    }
  })
}

const mockChannelData = [
  { channel: 'web' as const, count: 567 },
  { channel: 'whatsapp' as const, count: 345 },
  { channel: 'slack' as const, count: 156 },
  { channel: 'discord' as const, count: 112 },
  { channel: 'telegram' as const, count: 45 },
  { channel: 'api' as const, count: 9 },
]

const mockBots = [
  { id: '1', name: 'Support Bot', conversations: 567, messages: 3200, avgResponseTime: 0.8, satisfactionScore: 4.8 },
  { id: '2', name: 'Sales Bot', conversations: 345, messages: 2100, avgResponseTime: 1.2, satisfactionScore: 4.6 },
  { id: '3', name: 'FAQ Bot', conversations: 234, messages: 890, avgResponseTime: 0.5, satisfactionScore: 4.5 },
  { id: '4', name: 'Lead Qualifier', conversations: 156, messages: 1200, avgResponseTime: 1.4 },
  { id: '5', name: 'Onboarding Bot', conversations: 89, messages: 450, avgResponseTime: 0.9, satisfactionScore: 4.2 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('30d')

  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
  const chartData = generateDailyData(days)

  const { isLoading } = useQuery({
    queryKey: ['analytics', MOCK_ORG_ID, dateRange],
    queryFn: async () => {
      try {
        await analyticsApi.overview(MOCK_ORG_ID)
      } catch {}
      return true
    },
  })

  const totalConversations = chartData.reduce((s, d) => s + d.conversations, 0)
  const totalMessages = chartData.reduce((s, d) => s + d.messages, 0)
  const avgResponseTime = chartData.length > 0
    ? +(chartData.reduce((s, d) => s + d.avgTime, 0) / chartData.length).toFixed(1)
    : 0

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Track performance across your chatbots and channels"
        action={
          <div className="flex items-center gap-3">
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
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatsCard
          icon={MessageSquare}
          label="Conversations"
          value={totalConversations.toLocaleString()}
          change={12.5}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          icon={MessageCircle}
          label="Messages"
          value={totalMessages.toLocaleString()}
          change={8.3}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          icon={Users}
          label="Unique Users"
          value="1,847"
          change={5.1}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
        <StatsCard
          icon={Clock}
          label="Avg Response"
          value={`${avgResponseTime}s`}
          change={-15.0}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          icon={TrendingUp}
          label="Resolution"
          value="78%"
          change={3.2}
          iconClassName="bg-cyan-500/10 text-cyan-600"
        />
        <StatsCard
          icon={Bot}
          label="Active Bots"
          value="5"
          change={0}
          iconClassName="bg-pink-500/10 text-pink-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ConversationsChart data={chartData} loading={isLoading} />
        </div>
        <div>
          <ResolutionMetrics
            resolutionRate={78}
            avgHandleTime={4.2}
            totalConversations={totalConversations}
            totalMessages={totalMessages}
            loading={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MessagesChart data={chartData} loading={isLoading} />
        </div>
        <div>
          <ChannelDistribution data={mockChannelData} loading={isLoading} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BotsPerformanceTable bots={mockBots} loading={isLoading} />
        </div>
        <div>
          <ResponseTimeChart
            data={chartData.map((d) => ({ date: d.date, avgTime: d.avgTime }))}
            loading={isLoading}
          />
        </div>
      </div>
    </PageContainer>
  )
}
