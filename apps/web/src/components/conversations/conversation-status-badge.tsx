import { Badge } from '@/components/ui/badge'

type ConvStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'

const statusConfig: Record<ConvStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  waiting: { label: 'Waiting', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  resolved: { label: 'Resolved', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
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
