import { CheckCircle2, Loader2, Wrench, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToolCallStatus = 'running' | 'done' | 'error'

export interface ToolCallChipItem {
  name: string
  status: ToolCallStatus
}

export function ToolCallChip({ item }: { item: ToolCallChipItem }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        item.status === 'running' && 'border-primary/20 bg-primary/5 text-primary',
        item.status === 'done' && 'border-border bg-muted/50 text-muted-foreground',
        item.status === 'error' && 'border-destructive/20 bg-destructive/5 text-destructive',
      )}
    >
      {item.status === 'running' && <Loader2 className="size-3 animate-spin" />}
      {item.status === 'done' && <CheckCircle2 className="size-3" />}
      {item.status === 'error' && <XCircle className="size-3" />}
      {item.status !== 'running' && <Wrench className="hidden size-3 sm:inline" />}
      <span className="font-mono">{item.name}</span>
    </span>
  )
}