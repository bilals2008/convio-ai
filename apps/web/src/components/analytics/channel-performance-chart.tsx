import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Globe } from 'lucide-react'

const channelLabels: Record<string, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  discord: 'Discord',
  slack: 'Slack',
  telegram: 'Telegram',
  api: 'API',
}

interface ChannelBreakdown {
  channel: string
  count: number
}

interface ChannelPerformanceChartProps {
  data?: ChannelBreakdown[]
  loading?: boolean
}

export function ChannelPerformanceChart({ data, loading }: ChannelPerformanceChartProps) {
  const hasData = (data || []).length > 0 && data!.some((d) => d.count > 0)
  const chartData = hasData
    ? data!.map((d) => ({
        channel: channelLabels[d.channel] || d.channel.charAt(0).toUpperCase() + d.channel.slice(1),
        conversations: d.count,
      }))
    : []

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Channel Performance</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Conversations by channel</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 mb-3">
              <Globe className="size-5 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No channel data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Channel performance will appear once conversations come in.</p>
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  dataKey="channel"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="conversations" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
