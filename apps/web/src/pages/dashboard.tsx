import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Bot, Users, TrendingUp } from 'lucide-react'

const stats = [
  { title: 'Total Conversations', value: '1,234', change: '+12%', icon: MessageSquare, color: 'text-blue-500' },
  { title: 'Active Bots', value: '5', change: '+1', icon: Bot, color: 'text-green-500' },
  { title: 'Total Users', value: '456', change: '+8%', icon: Users, color: 'text-purple-500' },
  { title: 'Messages Today', value: '3,891', change: '+15%', icon: TrendingUp, color: 'text-orange-500' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your chatbots.</p>
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
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Your latest chat interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['User A - Support Bot', 'User B - Sales Bot', 'User C - FAQ Bot'].map((conv) => (
                <div key={conv} className="flex items-center justify-between">
                  <span className="text-sm">{conv}</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Bots</CardTitle>
            <CardDescription>Your deployed chatbots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Support Bot', 'Sales Bot', 'FAQ Bot'].map((bot) => (
                <div key={bot} className="flex items-center justify-between">
                  <span className="text-sm">{bot}</span>
                  <Badge variant="default">Live</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
