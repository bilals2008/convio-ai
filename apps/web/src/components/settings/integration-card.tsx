import { Globe, MessageSquare, Send, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IntegrationStatusBadge } from './integration-status-badge'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'
type IntegrationStatus = 'active' | 'inactive' | 'pending' | 'error'

const channelIcons: Record<Channel, typeof Globe> = {
  web: Globe,
  whatsapp: MessageSquare,
  slack: MessageSquare,
  discord: MessageSquare,
  telegram: Send,
  api: ExternalLink,
}

const channelNames: Record<Channel, string> = {
  web: 'Web Widget',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  discord: 'Discord',
  telegram: 'Telegram',
  api: 'API',
}

interface IntegrationItem {
  id: string
  channel: Channel
  botName: string
  status: IntegrationStatus
  updatedAt: string
}

interface IntegrationCardProps {
  integration: IntegrationItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
}

export function IntegrationCard({ integration, onEdit, onDelete, onTest }: IntegrationCardProps) {
  const Icon = channelIcons[integration.channel] || Globe
  const channelName = channelNames[integration.channel] || integration.channel

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Icon className="size-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{channelName}</h3>
            <IntegrationStatusBadge status={integration.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Connected to {integration.botName}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onTest(integration.id)}>
            Test
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(integration.id)}>
            Configure
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(integration.id)}>
            <span className="sr-only">Delete</span>
            <span className="text-destructive">×</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
