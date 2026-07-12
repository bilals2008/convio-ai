import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, CheckCircle2, Loader2, AlertCircle, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
  createdAt: string
  updatedAt: string
}

interface KnowledgeCardProps {
  kb: KnowledgeBase
  onDelete: (id: string) => void
}

export function KnowledgeCard({ kb, onDelete }: KnowledgeCardProps) {
  const navigate = useNavigate()
  const readyCount = kb.readyCount ?? 0
  const processingCount = kb.processingCount ?? 0
  const errorCount = kb.errorCount ?? 0
  const hasDocs = kb.documentCount > 0

  return (
    <button
      onClick={() => navigate(`/knowledge/${kb.id}`)}
      className="group w-full text-left rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {kb.name}
            </p>
            {kb.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {kb.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            >
              <MoreHorizontal className="size-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate(`/knowledge/${kb.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(kb.id)
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasDocs ? (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="size-3" />
            {kb.documentCount} doc{kb.documentCount !== 1 ? 's' : ''}
          </span>
          {readyCount > 0 && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="size-3" />
              {readyCount}
            </span>
          )}
          {processingCount > 0 && (
            <span className="flex items-center gap-1 text-info">
              <Loader2 className="size-3 animate-spin" />
              {processingCount}
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="size-3" />
              {errorCount}
            </span>
          )}
          <span className="ml-auto text-muted-foreground/70">
            {formatRelativeTime(kb.updatedAt)}
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/70">
          No documents · Created {formatRelativeTime(kb.createdAt)}
        </p>
      )}
    </button>
  )
}
