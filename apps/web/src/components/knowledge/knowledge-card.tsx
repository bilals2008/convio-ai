import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, CheckCircle2, Loader2, AlertCircle, MoreVertical, Trash2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeTime } from '@/lib/utils'

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
  isSelected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

function kbStatus(kb: KnowledgeBase): { label: string; variant: 'active' | 'pending' | 'canceled' } {
  if ((kb.errorCount ?? 0) > 0) return { label: 'Error', variant: 'canceled' }
  if ((kb.processingCount ?? 0) > 0) return { label: 'Processing', variant: 'pending' }
  if (kb.documentCount === 0) return { label: 'Empty', variant: 'pending' }
  return { label: 'Ready', variant: 'active' }
}

export function KnowledgeCard({ kb, onDelete, isSelected, onToggleSelect, showCheckbox }: KnowledgeCardProps) {
  const navigate = useNavigate()
  const readyCount = kb.readyCount ?? 0
  const processingCount = kb.processingCount ?? 0
  const errorCount = kb.errorCount ?? 0
  const status = kbStatus(kb)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/knowledge/${kb.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/knowledge/${kb.id}`)
        }
      }}
      className={cn(
        "group relative cursor-pointer p-0 outline-none transition-all duration-200",
        isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
        !isSelected && "hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {showCheckbox && (
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={!!isSelected}
                onCheckedChange={onToggleSelect}
                className="size-4"
              />
            </div>
          )}
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{kb.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {kb.description || 'No description'}
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border shrink-0',
            status.variant === 'active' && 'bg-success/10 text-success border-success/30',
            status.variant === 'pending' && 'bg-warning/10 text-warning border-warning/30',
            status.variant === 'canceled' && 'bg-destructive/10 text-destructive border-destructive/30',
          )}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <FileText className="size-3.5" />
            {kb.documentCount} doc{kb.documentCount !== 1 ? 's' : ''}
          </span>
          {readyCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-success">
              <CheckCircle2 className="size-3" />
              {readyCount}
            </span>
          )}
          {processingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-info">
              <Loader2 className="size-3 animate-spin" />
              {processingCount}
            </span>
          )}
          {errorCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <AlertCircle className="size-3" />
              {errorCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {formatRelativeTime(kb.updatedAt)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate(`/knowledge/${kb.id}`)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(kb.id) }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export function KnowledgeCardSkeleton() {
  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}
