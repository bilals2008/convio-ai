import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, AlertTriangle, FileEdit, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KbStatus } from './kb-types'

const statusConfig: Record<
  KbStatus,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  ready: {
    label: 'Ready',
    className: 'bg-success/10 text-success border-success/30',
    Icon: CheckCircle2,
  },
  indexing: {
    label: 'Indexing',
    className: 'bg-info/10 text-info border-info/30',
    Icon: Loader2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    Icon: AlertTriangle,
  },
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
    Icon: FileEdit,
  },
}

export function KbStatusBadge({ status, className }: { status: KbStatus; className?: string }) {
  const config = statusConfig[status]
  const Icon = config.Icon
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 px-2 py-0.5 text-xs font-medium', config.className, className)}
    >
      <Icon className={cn('size-3', status === 'indexing' && 'animate-spin')} />
      {config.label}
    </Badge>
  )
}

export function StatusDot({ status, className }: { status: KbStatus; className?: string }) {
  const map: Record<KbStatus, string> = {
    ready: 'bg-success',
    indexing: 'bg-info',
    failed: 'bg-destructive',
    draft: 'bg-muted-foreground',
  }
  return <span className={cn('size-2 rounded-full', map[status], className)} />
}

export function PendingDot({ className }: { className?: string }) {
  return <Circle className={cn('size-3 text-muted-foreground', className)} />
}
