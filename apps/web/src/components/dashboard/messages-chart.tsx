import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartDataPoint {
  date: string
  userMessages: number
  assistantMessages: number
}

interface MessagesChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

export function MessagesChart({ data, loading }: MessagesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Messages Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="userMessages" name="User" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="assistantMessages" name="Assistant" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
