import { Upload, CheckCircle2, AlertTriangle, RefreshCw, SlidersHorizontal, Search, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelative } from './kb-format'
import type { ActivityEvent, DocumentItem } from './kb-types'

const iconMap: Record<ActivityEvent['type'], { Icon: LucideIcon; className: string }> = {
  'document.uploaded': { Icon: Upload, className: 'bg-info/10 text-info' },
  'index.completed': { Icon: CheckCircle2, className: 'bg-success/10 text-success' },
  error: { Icon: AlertTriangle, className: 'bg-destructive/10 text-destructive' },
  'reindex.started': { Icon: RefreshCw, className: 'bg-warning/10 text-warning' },
  'settings.changed': { Icon: SlidersHorizontal, className: 'bg-muted text-muted-foreground' },
  'search.executed': { Icon: Search, className: 'bg-primary/10 text-primary' },
}

function deriveEvents(documents: DocumentItem[], extra: ActivityEvent[] = []): ActivityEvent[] {
  const events: ActivityEvent[] = documents.map((d) => {
    if (d.status === 'error') {
      return {
        id: `err-${d.id}`,
        type: 'error',
        title: `Indexing failed: ${d.name}`,
        description: 'Document could not be parsed or embedded.',
        timestamp: d.createdAt,
      }
    }
    if (d.status === 'ready') {
      return {
        id: `idx-${d.id}`,
        type: 'index.completed',
        title: `Indexed: ${d.name}`,
        description: `${d.chunkCount ?? 0} chunks embedded and searchable.`,
        timestamp: d.createdAt,
      }
    }
    return {
      id: `up-${d.id}`,
      type: 'document.uploaded',
      title: `Uploaded: ${d.name}`,
      description: 'Document added to the knowledge base.',
      timestamp: d.createdAt,
    }
  })
  return [...extra, ...events].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
}

export function KbActivityTab({
  documents,
  events = [],
}: {
  documents: DocumentItem[]
  events?: ActivityEvent[]
}) {
  const all = deriveEvents(documents, events)

  if (all.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-14 text-center">
        <p className="text-sm font-medium">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload sources and run tests to populate this timeline.
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-2">
      <ol className="relative space-y-1">
        {all.map((ev, i) => {
          const meta = iconMap[ev.type]
          const Icon = meta.Icon
          return (
            <li key={ev.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < all.length - 1 && (
                <span className="absolute top-8 left-[15px] bottom-0 w-px bg-border/70" />
              )}
              <span
                className={cn(
                  'z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  meta.className,
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{ev.title}</p>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {formatRelative(ev.timestamp)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{ev.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
