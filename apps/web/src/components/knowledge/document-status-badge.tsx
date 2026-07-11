import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type DocStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived'

const statusConfig: Record<DocStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  processing: {
    label: 'Indexing',
    className: 'bg-info/10 text-info border-info/30 animate-pulse',
  },
  ready: {
    label: 'Ready',
    className: 'bg-success/10 text-success border-success/30',
  },
  error: {
    label: 'Error',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

interface DocumentStatusBadgeProps {
  status: DocStatus
  className?: string
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  return <Badge className={cn(config.className, className)}>{config.label}</Badge>
}
