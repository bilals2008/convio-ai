import { Badge } from '@/components/ui/badge'

type DocStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived'

const statusConfig: Record<DocStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30 animate-pulse' },
  ready: { label: 'Ready', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  error: { label: 'Error', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
}

interface DocumentStatusBadgeProps {
  status: DocStatus
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  return <Badge className={config.className}>{config.label}</Badge>
}
