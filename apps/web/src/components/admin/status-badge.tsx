import { Badge } from '@/components/ui/badge'

const statusToVariant: Record<string, 'active' | 'inactive' | 'draft' | 'pending' | 'failed' | 'closed' | 'archived' | 'resolved' | 'waiting'> = {
  active: 'active',
  inactive: 'inactive',
  draft: 'draft',
  pending: 'pending',
  processing: 'pending',
  ready: 'active',
  failed: 'failed',
  error: 'failed',
  closed: 'closed',
  archived: 'archived',
  resolved: 'resolved',
  waiting: 'waiting',
  trialing: 'waiting',
  cancelled: 'closed',
  past_due: 'waiting',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusToVariant[status.toLowerCase()] || 'default'
  return <Badge variant={variant}>{status}</Badge>
}
