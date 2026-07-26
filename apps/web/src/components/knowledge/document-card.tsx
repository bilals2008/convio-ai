import { Eye, Trash2, RefreshCw, ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DocumentTypeBadge } from './document-type-badge'
import { DocumentStatusBadge } from './document-status-badge'
import { cn } from '@/lib/utils'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'
type DocStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived'

export interface DocumentItem {
  id: string
  name: string
  type: DocType
  status: DocStatus
  content?: string | null
  url?: string | null
  chunkCount?: number
  createdAt: string
}

interface DocumentCardProps {
  doc: DocumentItem
  onView: (id: string) => void
  onDelete: (id: string) => void
  onReprocess?: (id: string) => void
  reprocessing?: boolean
}

export function DocumentCard({
  doc,
  onView,
  onDelete,
  onReprocess,
  reprocessing,
}: DocumentCardProps) {
  const isBusy = doc.status === 'processing' || reprocessing
  const isActive = isBusy

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border/60 bg-card px-4 py-3 transition-all hover:border-border hover:shadow-sm',
        isActive && 'border-info/30',
        doc.status === 'error' && 'border-destructive/30',
      )}
    >
      <div className="flex items-center gap-3">
        <DocumentTypeBadge type={doc.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{doc.name}</h4>
            <DocumentStatusBadge status={doc.status} />
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {typeof doc.chunkCount === 'number' && (
              <span>{doc.chunkCount} chunk{doc.chunkCount !== 1 ? 's' : ''}</span>
            )}
            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3" />
                Source
              </a>
            )}
            {doc.status === 'error' && (
              <span className="text-destructive">Indexing failed</span>
            )}
          </div>
        </div>

        <TooltipProvider>
          <div className="flex shrink-0 items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger
                onClick={() => onView(doc.id)}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-7")}
              >
                <Eye className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>View content</TooltipContent>
            </Tooltip>

            {onReprocess && (
              <Tooltip>
              <TooltipTrigger
                disabled={isBusy}
                onClick={() => onReprocess(doc.id)}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-7")}
              >
                <RefreshCw className={cn('size-3.5', isBusy && 'animate-spin')} />
              </TooltipTrigger>
                <TooltipContent>Re-index</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                disabled={isBusy}
                onClick={() => onDelete(doc.id)}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-7")}
              >
                <Trash2 className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {(doc.status === 'processing' || doc.status === 'pending') && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-muted">
          <div className="h-full bg-info animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
    </div>
  )
}
