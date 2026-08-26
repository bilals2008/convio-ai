import { Badge } from '@/components/ui/badge'

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'urgent') return <Badge variant="destructive">Urgent</Badge>
  if (priority === 'high') return <Badge variant="pending">High</Badge>
  if (priority === 'low') return <Badge variant="outline">Low</Badge>
  return <Badge variant="secondary">Normal</Badge>
}
