import { Badge } from '@/components/ui/badge'
import { STATUS_META } from './ticket-meta'

export function TicketStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={meta.variant as 'outline'}>{meta.label}</Badge>
}