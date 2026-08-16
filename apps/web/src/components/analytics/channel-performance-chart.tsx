import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Globe } from 'lucide-react'

const channelLabels: Record<string, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  discord: 'Discord',
  slack: 'Slack',
  telegram: 'Telegram',
  api: 'API',
}

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(271, 81%, 56%)', 'hsl(25, 95%, 53%)', 'hsl(340, 82%, 52%)', 'hsl(200, 98%, 39%)']

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

  const total = chartData.reduce((s, d) => s + d.conversations, 0)

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Channel Performance</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground hidden sm:block">Conversations by channel</div>
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
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="conversations" nameKey="channel" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [`${value} (${(value / total * 100).toFixed(1)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {chartData.map((d, i) => (
                <div key={d.channel} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="w-20 text-muted-foreground">{d.channel}</span>
                  <span className="w-12 text-right font-medium tabular-nums">{d.conversations}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground">{(d.conversations / total * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
