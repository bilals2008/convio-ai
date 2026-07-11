import { Eye, Trash2, RefreshCw, Layers, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DocumentTypeBadge } from './document-type-badge'
import { DocumentStatusBadge } from './document-status-badge'

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
  const isBusy = doc.status === 'processing' || doc.status === 'pending' || reprocessing

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <DocumentTypeBadge type={doc.type} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-medium">{doc.name}</h4>
              <DocumentStatusBadge status={doc.status} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              {typeof doc.chunkCount === 'number' && (
                <span className="inline-flex items-center gap-1">
                  <Layers className="size-3" />
                  {doc.chunkCount} chunk{doc.chunkCount !== 1 ? 's' : ''}
                </span>
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
                <span className="text-destructive">Indexing failed — try reprocess</span>
              )}
            </div>
          </div>
        </div>

        <TooltipProvider>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                className="inline-flex"
                onClick={() => onView(doc.id)}
              >
                <Button variant="ghost" size="icon" type="button" tabIndex={-1}>
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>

            {onReprocess && (
              <Tooltip>
                <TooltipTrigger
                  className="inline-flex"
                  disabled={isBusy}
                  onClick={() => onReprocess(doc.id)}
                >
                  <Button variant="ghost" size="icon" type="button" tabIndex={-1} disabled={isBusy}>
                    <RefreshCw className={`size-4 ${isBusy ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Re-index for RAG</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                className="inline-flex"
                disabled={isBusy}
                onClick={() => onDelete(doc.id)}
              >
                <Button variant="ghost" size="icon" type="button" tabIndex={-1} disabled={isBusy}>
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
