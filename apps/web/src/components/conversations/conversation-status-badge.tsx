import { Badge } from '@/components/ui/badge'

type ConvStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'

const statusConfig: Record<ConvStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success border-success/30' },
  waiting: { label: 'Waiting', className: 'bg-warning/10 text-warning border-warning/30' },
  resolved: { label: 'Resolved', className: 'bg-info/10 text-info border-info/30' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
  archived: { label: 'Archived', className: 'bg-muted/50 text-muted-foreground/60 border-border' },
}

interface ConversationStatusBadgeProps {
  status: ConvStatus
}

export function ConversationStatusBadge({ status }: ConversationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.closed
  return <Badge className={config.className}>{config.label}</Badge>
}

export type { ConvStatus }
