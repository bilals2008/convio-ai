import { MessageSquare, MessageCircle, Users, Clock } from 'lucide-react'
import { StatsCard } from './stats-card'

interface StatsData {
  totalConversations: number
  totalMessages: number
  activeUsers: number
  avgResponseTime: number
  conversationsChange: number
  messagesChange: number
  usersChange: number
  responseTimeChange: number
}

interface StatsGridProps {
  data: StatsData
  loading?: boolean
}

export function StatsGrid({ data, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[120px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        icon={MessageSquare}
        label="Total Conversations"
        value={data.totalConversations.toLocaleString()}
        change={data.conversationsChange}
        iconClassName="bg-info/10 text-info"
      />
      <StatsCard
        icon={MessageCircle}
        label="Total Messages"
        value={data.totalMessages.toLocaleString()}
        change={data.messagesChange}
        iconClassName="bg-success/10 text-success"
      />
      <StatsCard
        icon={Users}
        label="Active Users"
        value={data.activeUsers.toLocaleString()}
        change={data.usersChange}
        iconClassName="bg-primary/10 text-primary"
      />
      <StatsCard
        icon={Clock}
        label="Avg Response Time"
        value={`${data.avgResponseTime}s`}
        change={data.responseTimeChange}
        iconClassName="bg-warning/10 text-warning"
      />
    </div>
  )
}
