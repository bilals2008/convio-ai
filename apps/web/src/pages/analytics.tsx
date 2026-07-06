import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, MessageSquare, Users, Clock } from 'lucide-react'

const stats = [
  { title: 'Total Conversations', value: '1,234', icon: MessageSquare, color: 'text-blue-500' },
  { title: 'Total Messages', value: '12,456', icon: BarChart3, color: 'text-green-500' },
  { title: 'Unique Users', value: '456', icon: Users, color: 'text-purple-500' },
  { title: 'Avg Response Time', value: '1.2s', icon: Clock, color: 'text-orange-500' },
]

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your chatbot performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversations by Channel</CardTitle>
            <CardDescription>Distribution across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { channel: 'Web Widget', count: 567, percent: 45 },
                { channel: 'WhatsApp', count: 345, percent: 28 },
                { channel: 'Telegram', count: 234, percent: 19 },
                { channel: 'Discord', count: 88, percent: 8 },
              ].map((ch) => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{ch.channel}</span>
                    <span className="text-muted-foreground">{ch.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${ch.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Bots</CardTitle>
            <CardDescription>Most active chatbots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Support Bot', conversations: 567, satisfaction: 4.8 },
                { name: 'Sales Bot', conversations: 345, satisfaction: 4.6 },
                { name: 'FAQ Bot', conversations: 234, satisfaction: 4.5 },
              ].map((bot) => (
                <div key={bot.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{bot.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {bot.conversations} conversations
                    </div>
                  </div>
                  <div className="text-sm text-yellow-500">★ {bot.satisfaction}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
