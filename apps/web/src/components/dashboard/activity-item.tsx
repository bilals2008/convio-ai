import { User, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelNames: Record<Channel, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  discord: 'Discord',
  telegram: 'Telegram',
  api: 'API',
}

interface ActivityItemProps {
  userName?: string
  botName: string
  channel: Channel
  action: string
  timestamp: string
}

export function ActivityItem({ userName, botName, channel, action, timestamp }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="flex size-8 items-center justify-center rounded-full bg-muted shrink-0">
        <User className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{userName || 'Anonymous'}</span>
          <span className="text-muted-foreground"> {action} </span>
          <span className="font-medium">{botName}</span>
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {channelNames[channel] || channel}
          </Badge>
        </div>
      </div>
    </div>
  )
}
