import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { MessagesChart } from '@/components/dashboard/messages-chart'
import { ChannelDistribution } from '@/components/dashboard/channel-distribution'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TopBots } from '@/components/dashboard/top-bots'
import { OverviewSkeleton } from '@/components/dashboard/overview-skeleton'
import { Button } from '@/components/ui/button'
import { analytics as analyticsApi } from '@/lib/api'

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
] as const

const MOCK_ORG_ID = 'mock-org-id'

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
    default:
      from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
      break
  }

  return { from, to }
}

const mockStats = {
  totalConversations: 1234,
  totalMessages: 12456,
  activeUsers: 456,
  avgResponseTime: 1.2,
  conversationsChange: 12.5,
  messagesChange: 8.3,
  usersChange: -2.1,
  responseTimeChange: -15.0,
}

const mockChartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversations: Math.floor(Math.random() * 50) + 20,
    messages: Math.floor(Math.random() * 200) + 50,
    userMessages: Math.floor(Math.random() * 100) + 25,
    assistantMessages: Math.floor(Math.random() * 100) + 25,
  }
})

const mockChannelData = [
  { channel: 'web' as const, count: 567 },
  { channel: 'whatsapp' as const, count: 345 },
  { channel: 'slack' as const, count: 156 },
  { channel: 'discord' as const, count: 112 },
  { channel: 'telegram' as const, count: 45 },
  { channel: 'api' as const, count: 9 },
]

const mockActivities = [
  { id: '1', userName: 'Alice', botName: 'Support Bot', channel: 'web' as const, action: 'started conversation with', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: '2', userName: 'Bob', botName: 'Sales Bot', channel: 'whatsapp' as const, action: 'sent message via', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '3', userName: 'Charlie', botName: 'FAQ Bot', channel: 'slack' as const, action: 'started conversation with', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: '4', userName: 'Diana', botName: 'Support Bot', channel: 'web' as const, action: 'sent message via', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '5', botName: 'Support Bot', channel: 'telegram' as const, action: 'conversation resolved on', timestamp: new Date(Date.now() - 3600000).toISOString() },
]

const mockTopBots = [
  { id: '1', name: 'Support Bot', conversationCount: 567 },
  { id: '2', name: 'Sales Bot', conversationCount: 345 },
  { id: '3', name: 'FAQ Bot', conversationCount: 234 },
  { id: '4', name: 'Lead Bot', conversationCount: 156 },
  { id: '5', name: 'Onboarding Bot', conversationCount: 89 },
]

export default function DashboardOverviewPage() {
  const [dateRange, setDateRange] = useState<string>('30d')

  const { isLoading } = useQuery({
    queryKey: ['dashboard', MOCK_ORG_ID, dateRange],
    queryFn: async () => {
      const { from, to } = getDateRange(dateRange)
      try {
        await analyticsApi.overview(MOCK_ORG_ID)
      } catch {}
      return { from, to }
    },
  })

  if (isLoading) {
    return <OverviewSkeleton />
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your AI chatbot platform"
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

      <StatsGrid data={mockStats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ConversationsChart data={mockChartData} />
          <MessagesChart data={mockChartData} />
        </div>
        <div className="space-y-6">
          <ChannelDistribution data={mockChannelData} />
          <TopBots bots={mockTopBots} />
        </div>
      </div>

      <RecentActivity activities={mockActivities} />
    </PageContainer>
  )
}
