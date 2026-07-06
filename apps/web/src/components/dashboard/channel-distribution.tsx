import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelColors: Record<Channel, string> = {
  web: 'hsl(217 91% 60%)',
  whatsapp: 'hsl(142 71% 45%)',
  slack: 'hsl(270 65% 60%)',
  discord: 'hsl(239 84% 67%)',
  telegram: 'hsl(189 94% 43%)',
  api: 'hsl(38 92% 50%)',
}

const channelNames: Record<Channel, string> = {
  web: 'Web Widget',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  discord: 'Discord',
  telegram: 'Telegram',
  api: 'API',
}

interface ChannelData {
  channel: Channel
  count: number
}

interface ChannelDistributionProps {
  data: ChannelData[]
  loading?: boolean
}

export function ChannelDistribution({ data, loading }: ChannelDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  const chartData = data.map((d) => ({
    ...d,
    name: channelNames[d.channel] || d.channel,
    color: channelColors[d.channel] || 'hsl(28 18% 8%)',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversations by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="hsl(24 20% 4%)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(24 20% 6%)',
                      border: '1px solid hsl(28 22% 14%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'hsl(28 30% 94%)',
                    }}
                    formatter={(value: number, name: string) => [`${value} conversations`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{total.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full">
              {chartData.map((d) => (
                <div key={d.channel} className="flex items-center gap-2 text-xs">
                  <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground truncate">{d.name}</span>
                  <span className="ml-auto font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
