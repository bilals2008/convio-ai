import { useNavigate } from 'react-router-dom'
import { MessageSquare, Clock, Globe, Phone, Hash, Send, Code, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConversationStatusBadge } from './conversation-status-badge'
import type { ConvStatus } from './conversation-status-badge'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelConfig: Record<Channel, { label: string; icon: typeof MessageSquare; color: string }> = {
  web: { label: 'Web Widget', icon: Globe, color: 'text-blue-500' },
  whatsapp: { label: 'WhatsApp', icon: Phone, color: 'text-emerald-500' },
  slack: { label: 'Slack', icon: Hash, color: 'text-purple-500' },
  discord: { label: 'Discord', icon: MessageCircle, color: 'text-indigo-500' },
  telegram: { label: 'Telegram', icon: Send, color: 'text-sky-500' },
  api: { label: 'API', icon: Code, color: 'text-primary' },
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return then.toLocaleDateString()
}

function getInitials(name: string | undefined): string {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

interface ConversationItem {
  id: string
  userId?: string
  userName?: string
  agentName: string
  agentId: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  lastMessage?: string
  updatedAt: string
}

interface ConversationCardProps {
  conversation: ConversationItem
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const navigate = useNavigate()
  const channel = channelConfig[conversation.channel] || channelConfig.web
  const ChannelIcon = channel.icon

  return (
    <Card
      className="cursor-pointer group transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 hover:bg-accent/30"
      onClick={() => navigate(`/conversations/${conversation.id}`)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative shrink-0">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/5">
            <span className="text-sm font-semibold text-primary">{getInitials(conversation.userName)}</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-card border-2 border-card flex items-center justify-center">
            <ChannelIcon className={`size-2.5 ${channel.color}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {conversation.userName || 'Anonymous'}
            </span>
            <Badge variant="secondary" className="text-xs shrink-0 gap-1">
              <MessageSquare className="size-3" />
              {conversation.agentName}
            </Badge>
          </div>
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground truncate leading-relaxed">
              {conversation.lastMessage}
            </p>
          )}
          {!conversation.lastMessage && (
            <p className="text-xs text-muted-foreground/50 italic">No messages yet</p>
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
