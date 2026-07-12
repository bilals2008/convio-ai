import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  date: string
  conversations: number
  messages: number
}

interface ActivityChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

export function ActivityChart({ data, loading }: ActivityChartProps) {
  const totalConv = data.reduce((s, d) => s + d.conversations, 0)
  const totalMsg = data.reduce((s, d) => s + d.messages, 0)

  return (
    <Card className="rounded-xl border border-border/60 bg-card">
      <CardContent className="p-5">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Overview
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {totalMsg.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">total messages</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-foreground">{totalConv}</p>
            <p className="text-xs text-muted-foreground">conversations</p>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(36 20% 45%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(36 20% 45%)' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(36 15% 6%)',
                  border: '1px solid hsl(36 15% 12%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(36 20% 95%)',
                }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                name="Messages"
                stroke="hsl(136 76% 45%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(136 76% 45%)', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="conversations"
                name="Conversations"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(217 91% 60%)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
