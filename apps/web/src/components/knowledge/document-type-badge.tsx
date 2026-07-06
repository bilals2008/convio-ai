import { Badge } from '@/components/ui/badge'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'

const typeConfig: Record<DocType, { label: string; className: string }> = {
  txt: { label: 'TXT', className: 'bg-muted text-muted-foreground border-border' },
  pdf: { label: 'PDF', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  csv: { label: 'CSV', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  md: { label: 'MD', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  json: { label: 'JSON', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  url: { label: 'URL', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

interface DocumentTypeBadgeProps {
  type: DocType
}

export function DocumentTypeBadge({ type }: DocumentTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.txt
  return <Badge className={config.className}>{config.label}</Badge>
}
