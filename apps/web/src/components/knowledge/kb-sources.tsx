import { useRef, useState } from 'react'
import {
  Search,
  LayoutGrid,
  Rows3,
  UploadCloud,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  FileText,
  FileType2,
  FileJson,
  Table2,
  Link2,
  FileCode2,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DocumentTypeBadge } from './document-type-badge'
import { DocumentStatusBadge } from './document-status-badge'
import { NoDocuments } from './kb-empty-states'
import { formatRelative } from './kb-format'
import { cn } from '@/lib/utils'
import type { DocumentItem } from './document-card'

type DocType = DocumentItem['type']

const fileIcon: Record<DocType, React.ComponentType<{ className?: string }>> = {
  txt: FileText,
  pdf: FileType2,
  csv: Table2,
  md: FileCode2,
  json: FileJson,
  url: Link2,
}

const statusFilterOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'ready', label: 'Ready' },
  { value: 'processing', label: 'Indexing' },
  { value: 'pending', label: 'Pending' },
  { value: 'error', label: 'Error' },
]

interface KbSourcesProps {
  documents: DocumentItem[]
  loading?: boolean
  selectionMode: boolean
  setSelectionMode: (v: boolean) => void
  selected: Set<string>
  toggleSelect: (id: string) => void
  onAddSource: () => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
  onReprocess: (id: string) => void
  reprocessingId: string | null
  onBulkDelete: () => void
  onBulkReprocess: () => void
  onUploadFiles: (files: File[]) => void
  uploading: boolean
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        danger && 'hover:bg-destructive/10 hover:text-destructive',
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

function SourceCardView({
  doc,
  view,
  selected,
  selectionMode,
  onToggleSelect,
  onPreview,
  onDelete,
  onReprocess,
  reprocessing,
}: {
  doc: DocumentItem
  view: 'grid' | 'list'
  selected: boolean
  selectionMode: boolean
  onToggleSelect: () => void
  onPreview: () => void
  onDelete: () => void
  onReprocess: () => void
  reprocessing: boolean
}) {
  const Icon = fileIcon[doc.type]
  const isBusy = doc.status === 'processing' || doc.status === 'pending' || reprocessing
  const embeddings = doc.status === 'ready' ? doc.chunkCount ?? 0 : 0

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span>{doc.chunkCount ?? 0} chunks</span>
      <span className="text-border">·</span>
      <span>{embeddings} embedded</span>
      <span className="text-border">·</span>
      <span>Added {formatRelative(doc.createdAt)}</span>
    </div>
  )

  if (view === 'list') {
    return (
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-colors hover:border-border',
          selected && 'border-primary/50 bg-primary/5',
          doc.status === 'error' && 'border-destructive/30',
        )}
      >
        {selectionMode && (
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select ${doc.name}`}
          />
        )}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="size-4 text-foreground/80" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{doc.name}</span>
            <DocumentTypeBadge type={doc.type} />
            <DocumentStatusBadge status={doc.status} />
          </div>
          <div className="mt-0.5">{meta}</div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionButton icon={Eye} label="Preview" onClick={onPreview} disabled={isBusy} />
          <ActionButton icon={RefreshCw} label="Re-index" onClick={onReprocess} disabled={isBusy} />
          <ActionButton icon={Download} label="Download" onClick={() => {}} />
          <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border',
        selected && 'border-primary/50 bg-primary/5',
        doc.status === 'error' && 'border-destructive/30',
      )}
    >
      {selectionMode && (
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          className="absolute right-3 top-3"
          aria-label={`Select ${doc.name}`}
        />
      )}
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="size-5 text-foreground/80" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{doc.name}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <DocumentTypeBadge type={doc.type} />
            <DocumentStatusBadge status={doc.status} />
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Chunks</span>
          <span className="font-medium text-foreground/90 tabular-nums">{doc.chunkCount ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Embedded</span>
          <span className="font-medium text-foreground/90 tabular-nums">{embeddings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Added</span>
          <span className="font-medium text-foreground/90 tabular-nums">
            {formatRelative(doc.createdAt)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-0.5 border-t border-border/60 pt-2.5">
        <ActionButton icon={Eye} label="Preview" onClick={onPreview} disabled={isBusy} />
        <ActionButton icon={RefreshCw} label="Re-index" onClick={onReprocess} disabled={isBusy} />
        <ActionButton icon={Download} label="Download" onClick={() => {}} />
        <div className="ml-auto">
          <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      </div>

      {isBusy && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-xl bg-muted">
          <div className="h-full w-1/2 animate-pulse bg-info" />
        </div>
      )}
    </div>
  )
}

function DropZone({ onFiles, uploading, onMoreSources }: { onFiles: (f: File[]) => void; uploading: boolean; onMoreSources?: () => void }) {
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onFiles(Array.from(e.dataTransfer.files))
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center transition-colors hover:border-border hover:bg-muted/40',
        over && 'border-primary/60 bg-primary/5',
      )}
    >
      {uploading ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : (
        <UploadCloud className={cn('size-6', over ? 'text-primary' : 'text-muted-foreground')} />
      )}
      <p className="mt-2 text-sm font-medium">
        {uploading ? 'Uploading…' : over ? 'Drop to upload' : 'Drag & drop files or click to browse'}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">PDF, TXT, MD, CSV, JSON · multiple allowed</p>
      {onMoreSources && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMoreSources()
          }}
          className="mt-1.5 text-xs text-primary/80 underline-offset-2 hover:underline"
        >
          More sources
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function KbSources({
  documents,
  loading,
  selectionMode,
  setSelectionMode,
  selected,
  toggleSelect,
  onAddSource,
  onPreview,
  onDelete,
  onReprocess,
  reprocessingId,
  onBulkDelete,
  onBulkReprocess,
  onUploadFiles,
  uploading,
}: KbSourcesProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = documents.filter((d) => {
    const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'all' || d.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <div className="space-y-4">
      <DropZone onFiles={onUploadFiles} uploading={uploading} onMoreSources={onAddSource} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sources…"
            className="h-9 pl-8"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg border border-border/60 p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className={cn(
              'flex size-8 items-center justify-center rounded-md transition-colors',
              view === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="List view"
            className={cn(
              'flex size-8 items-center justify-center rounded-md transition-colors',
              view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Rows3 className="size-4" />
          </button>
        </div>

        {selectionMode ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setSelectionMode(false)
              selected.clear()
            }}
          >
            <X className="size-3.5" />
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setSelectionMode(true)}
            disabled={documents.length === 0}
          >
            <Check className="size-3.5" />
            Select
          </Button>
        )}
      </div>

      {selectionMode && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onBulkReprocess} disabled={selected.size === 0}>
              <RefreshCw className="size-3.5" />
              Re-index
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10" onClick={onBulkDelete} disabled={selected.size === 0}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={cn('grid gap-3', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-border/60 bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        documents.length === 0 ? (
          <NoDocuments onAddSource={onAddSource} />
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm text-muted-foreground">No sources match your filters.</p>
          </div>
        )
      ) : (
        <div className={cn('grid gap-3', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {filtered.map((doc) => (
            <SourceCardView
              key={doc.id}
              doc={doc}
              view={view}
              selected={selected.has(doc.id)}
              selectionMode={selectionMode}
              onToggleSelect={() => toggleSelect(doc.id)}
              onPreview={() => onPreview(doc.id)}
              onDelete={() => onDelete(doc.id)}
              onReprocess={() => onReprocess(doc.id)}
              reprocessing={reprocessingId === doc.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
