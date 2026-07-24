import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'

const typeConfig: Record<DocType, { label: string; className: string }> = {
  txt: { label: 'TXT', className: 'bg-muted text-muted-foreground border-border' },
  pdf: { label: 'PDF', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  csv: { label: 'CSV', className: 'bg-chart-2/10 text-chart-2 border-chart-2/30' },
  md: { label: 'MD', className: 'bg-info/10 text-info border-info/30' },
  json: { label: 'JSON', className: 'bg-warning/10 text-warning border-warning/30' },
  url: { label: 'URL', className: 'bg-chart-4/10 text-chart-4 border-chart-4/30' },
}

interface DocumentTypeBadgeProps {
  type: DocType
  className?: string
}

export function DocumentTypeBadge({ type, className }: DocumentTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.txt
  return <Badge className={cn('rounded h-4 px-1.5 py-0 text-[10px]', config.className, className)}>{config.label}</Badge>
}
