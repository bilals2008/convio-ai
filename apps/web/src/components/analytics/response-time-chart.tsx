import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ResponseTimePoint {
  date: string
  avgTime: number
}

interface ResponseTimeChartProps {
  data: ResponseTimePoint[]
  loading?: boolean
}

export function ResponseTimeChart({ data, loading }: ResponseTimeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Response Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                unit="s"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(24 20% 6%)',
                  border: '1px solid hsl(28 22% 14%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(28 30% 94%)',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}s`, 'Avg Response']}
              />
              <Line
                type="monotone"
                dataKey="avgTime"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'hsl(38 92% 50%)', stroke: 'hsl(38 92% 50%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
