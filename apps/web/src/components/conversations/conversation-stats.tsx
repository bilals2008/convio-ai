import { User, BotIcon, Clock, MessageSquare, CheckCircle, RotateCcw, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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

interface ConversationStatsProps {
  userName?: string
  agentName: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  createdAt: string
  updatedAt: string
  onStatusChange: (status: ConvStatus) => void
  loading?: boolean
}

export function ConversationStats({
  userName,
  agentName,
  channel,
  status,
  messageCount,
  createdAt,
  updatedAt,
  onStatusChange,
  loading,
}: ConversationStatsProps) {
  const channelName = channelNames[channel] || channel

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversation Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <User className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{userName || 'Anonymous'}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Agent</span>
            <span className="font-medium flex items-center gap-1">
              <BotIcon className="size-3" />
              {agentName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Channel</span>
            <span className="font-medium">{channelName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <ConversationStatusBadge status={status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Messages</span>
            <span className="font-medium flex items-center gap-1">
              <MessageSquare className="size-3" />
              {messageCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Active</span>
            <span className="font-medium">{new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</p>
          <div className="flex flex-wrap gap-2">
            {(status === 'active' || status === 'waiting') && (
              <Button
                variant="outline"
                size="default"
                onClick={() => onStatusChange('resolved')}
                disabled={loading}
                className="gap-1"
              >
                <CheckCircle className="size-3" />
                Resolve
              </Button>
            )}
            {(status === 'active' || status === 'waiting' || status === 'resolved') && (
              <Button
                variant="outline"
                size="default"
                onClick={() => onStatusChange('closed')}
                disabled={loading}
                className="gap-1"
              >
                <XCircle className="size-3" />
                Close
              </Button>
            )}
            {(status === 'closed' || status === 'resolved') && (
              <Button
                variant="outline"
                size="default"
                onClick={() => onStatusChange('active')}
                disabled={loading}
                className="gap-1"
              >
                <RotateCcw className="size-3" />
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
