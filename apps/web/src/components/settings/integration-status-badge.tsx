import { Badge } from '@/components/ui/badge'

type IntegrationStatus = 'active' | 'inactive' | 'pending' | 'error'

const statusConfig: Record<IntegrationStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  error: { label: 'Error', className: 'bg-destructive/10 text-destructive border-destructive/30' },
}

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus
}

export function IntegrationStatusBadge({ status }: IntegrationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  return <Badge className={config.className}>{config.label}</Badge>
}
