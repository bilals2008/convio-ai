import { ArrowLeft, Save, EllipsisVertical, Trash2, Copy, ScrollText, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatRelative } from './kb-format'
import type { KnowledgeBaseDetail } from './kb-types'

interface KbHeaderProps {
  kb: KnowledgeBaseDetail
  saving: boolean
  onBack: () => void
  onSave: () => void
  onDelete: () => void
  onDuplicate: () => void
  onViewLogs: () => void
}

export function KbHeader({
  kb,
  saving,
  onBack,
  onSave,
  onDelete,
  onDuplicate,
  onViewLogs,
}: KbHeaderProps) {
  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to knowledge bases"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-lg font-semibold tracking-tight">{kb.name || 'Untitled'}</h1>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {kb.description || 'No description'}
            <span className="mx-1.5 text-border">·</span>
            Updated {formatRelative(kb.updatedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={onSave} disabled={saving}>
            {saving ? <Save className="size-3.5 animate-pulse" /> : <Save className="size-3.5" />}
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save Changes'}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              }
            />
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
