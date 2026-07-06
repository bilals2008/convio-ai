import { useNavigate } from 'react-router-dom'
import { MessageSquare, Clock, Bot } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConversationStatusBadge } from './conversation-status-badge'
import type { ConvStatus } from './conversation-status-badge'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelNames: Record<Channel, string> = {
  web: 'Web Widget',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  discord: 'Discord',
  telegram: 'Telegram',
  api: 'API',
}

interface ConversationItem {
  id: string
  userId?: string
  userName?: string
  botName: string
  botId: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  lastMessage?: string
  updatedAt: string
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return then.toLocaleDateString()
}

interface ConversationCardProps {
  conversation: ConversationItem
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const navigate = useNavigate()
  const channelName = channelNames[conversation.channel] || conversation.channel

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => navigate(`/conversations/${conversation.id}`)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <MessageSquare className="size-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">
              {conversation.userName || 'Anonymous'}
            </span>
            <Badge variant="secondary" className="text-xs shrink-0">
              <Bot className="size-3" />
              {conversation.botName}
            </Badge>
            <Badge variant="outline" className="text-xs shrink-0">
              {channelName}
            </Badge>
          </div>
          {conversation.lastMessage && (
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <ConversationStatusBadge status={conversation.status} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" />
              {conversation.messageCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeTime(conversation.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
