import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelColors: Record<Channel, string> = {
  web: 'bg-info',
  whatsapp: 'bg-success',
  slack: 'bg-chart-4',
  discord: 'bg-info',
  telegram: 'bg-chart-3',
  api: 'bg-warning',
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

interface ChannelBreakdownProps {
  data: ChannelData[]
  loading?: boolean
}

export function ChannelBreakdown({ data, loading }: ChannelBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="rounded-xl border border-border/60 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="size-4 text-muted-foreground" />
          Channels
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No data</p>
        ) : (
          <div className="space-y-3">
            {data
              .sort((a, b) => b.count - a.count)
              .map((d) => (
                <div key={d.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {channelNames[d.channel] || d.channel}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {d.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${channelColors[d.channel] || 'bg-muted-foreground'}`}
                      style={{ width: `${(d.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            <p className="pt-1 text-[11px] text-muted-foreground">
              {total.toLocaleString()} total conversations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
