import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  date: string
  conversations: number
}

interface ConversationsChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

export function ConversationsChart({ data, loading }: ConversationsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="conversationsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(26 80% 56%)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(26 80% 56%)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(28 22% 12%)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(28 12% 55%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(28 12% 55%)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(24 20% 6%)',
                  border: '1px solid hsl(28 22% 14%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(28 30% 94%)',
                }}
              />
              <Area
                type="monotone"
                dataKey="conversations"
                stroke="hsl(26 80% 56%)"
                strokeWidth={2.5}
                fill="url(#conversationsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
