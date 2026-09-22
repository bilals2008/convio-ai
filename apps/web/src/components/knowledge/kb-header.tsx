import { ArrowLeft, BookOpen, Save, EllipsisVertical, Trash2, Copy, ScrollText, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { KnowledgeBaseDetail } from './kb-types'

interface KbHeaderProps {
  kb: KnowledgeBaseDetail
  saving: boolean
  dirty: boolean
  onBack: () => void
  onSave: () => void
  onDelete: () => void
  onDuplicate: () => void
  onViewLogs: () => void
}

export function KbHeader({
  kb,
  saving,
  dirty,
  onBack,
  onSave,
  onDelete,
  onDuplicate,
  onViewLogs,
}: KbHeaderProps) {
  return (
    <header className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to knowledge bases
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <BookOpen className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-foreground">
                {kb.name || 'Untitled'}
              </h1>
              {dirty && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/15 bg-warning/5 px-2 py-0.5 text-[10px] font-medium text-warning">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Unsaved
                </span>
              )}
            </div>

            {kb.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {kb.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:pt-1">
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onSave}
            disabled={saving || !dirty}
          >
            <Save className="size-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 text-muted-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="More actions"
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewLogs}>
                <ScrollText />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink />
                Open in API
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 />
                Delete Knowledge Base
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
