import { TrendingUp, Clock, MessageSquare } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

const mockConversationsOverTime = [
  { date: 'Mon', conversations: 12 },
  { date: 'Tue', conversations: 19 },
  { date: 'Wed', conversations: 8 },
  { date: 'Thu', conversations: 24 },
  { date: 'Fri', conversations: 31 },
  { date: 'Sat', conversations: 15 },
  { date: 'Sun', conversations: 22 },
]

const mockResponseTime = [
  { date: 'Mon', time: 1.4 },
  { date: 'Tue', time: 1.2 },
  { date: 'Wed', time: 1.8 },
  { date: 'Thu', time: 1.1 },
  { date: 'Fri', time: 0.9 },
  { date: 'Sat', time: 1.3 },
  { date: 'Sun', time: 1.0 },
]

const mockTopQueries = [
  { query: 'Pricing information', count: 45 },
  { query: 'API integration help', count: 32 },
  { query: 'Account setup', count: 28 },
  { query: 'Feature comparison', count: 22 },
  { query: 'Troubleshooting', count: 18 },
]

export function AgentAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                Conversations Over Time
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">7 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockConversationsOverTime} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(28 22% 12%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(28 12% 55%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(28 12% 55%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(24 20% 6%)',
                    border: '1px solid hsl(28 22% 14%)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'hsl(28 30% 94%)',
                  }}
                />
                <Bar
                  dataKey="conversations"
                  fill="hsl(26 80% 56%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Response Time Trend
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">Avg 1.2s</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockResponseTime} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(28 22% 12%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(28 12% 55%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(28 12% 55%)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(24 20% 6%)',
                    border: '1px solid hsl(28 22% 14%)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'hsl(28 30% 94%)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="hsl(38 92% 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(38 92% 50%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              Top Customer Queries
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {mockTopQueries.reduce((sum, q) => sum + q.count, 0)} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTopQueries.map((item, i) => (
              <div key={item.query} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">{item.query}</p>
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.count / mockTopQueries[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
