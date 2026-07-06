import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Status = 'active' | 'inactive' | 'draft' | 'pending' | 'processing' | 'ready' | 'failed' | 'error'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'default' },
  ready: { label: 'Ready', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
  error: { label: 'Error', variant: 'destructive' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft
  
  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  )
}
