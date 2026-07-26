import { useRef, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import {
  Search,
  LayoutGrid,
  List,
  UploadCloud,
  Eye,
  RefreshCw,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { FileIcon } from '@/components/shared/file-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DocumentTypeBadge } from './document-type-badge'
import { DocumentStatusBadge } from './document-status-badge'
import { NoDocuments } from './kb-empty-states'
import { formatRelative } from './kb-format'
import { cn } from '@/lib/utils'
import type { DocumentItem } from './document-card'

type DocType = DocumentItem['type']

const columnHelper = createColumnHelper<DocumentItem>()

function DocIcon({ type, size = 16 }: { type: DocType; size?: number }) {
  return <FileIcon type={type === 'url' ? 'web' : type} size={size} />
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
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [sorting, setSorting] = useState<SortingState>([])

  const filtered = useMemo(() => documents.filter((d) => {
    const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'all' || d.status === status
    return matchesQuery && matchesStatus
  }), [documents, query, status])

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      size: 36,
      enableSorting: false,
      header: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={filtered.length > 0 && filtered.every((d) => selected.has(d.id))}
            onCheckedChange={() => {
              const allSelected = filtered.every((d) => selected.has(d.id))
              filtered.forEach((d) => {
                if (allSelected) {
                  if (selected.has(d.id)) toggleSelect(d.id)
                } else {
                  if (!selected.has(d.id)) toggleSelect(d.id)
                }
              })
              if (!selectionMode) setSelectionMode(true)
            }}
            className="size-4"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(row.original.id)}
            onCheckedChange={() => {
              toggleSelect(row.original.id)
              if (!selectionMode) setSelectionMode(true)
            }}
            className="size-4"
          />
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Document
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <DocIcon type={row.original.type} size={16} />
          </span>
          <p className="text-sm font-medium truncate text-foreground">{row.original.name}</p>
        </div>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => <DocumentTypeBadge type={row.original.type} />,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
    }),
    columnHelper.accessor('chunkCount', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Chunks
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">{row.original.chunkCount ?? 0}</span>
      ),
      sortingFn: 'basic',
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Added
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatRelative(row.original.createdAt)}</span>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      size: 96,
      cell: ({ row }) => {
        const doc = row.original
        const isBusy = doc.status === 'processing' || doc.status === 'pending' || reprocessingId === doc.id
        return (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPreview(doc.id) }}
              disabled={isBusy}
              title="Preview"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Eye className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReprocess(doc.id) }}
              disabled={isBusy}
              title="Re-index"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <RefreshCw className={cn('size-3.5', reprocessingId === doc.id && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
              title="Delete"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )
      },
    }),
  ], [selected, selectionMode, filtered, toggleSelect, setSelectionMode, onPreview, onReprocess, onDelete, reprocessingId])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

        <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onAddSource}>
          <UploadCloud className="size-3.5" />
          Add Source
        </Button>

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

        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
              view === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            aria-label="Table view"
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
              view === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
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
        view === 'grid' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl border border-border/60 bg-card" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Document</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Type</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Chunks</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Added</TableHead>
                  <TableHead className="h-11 w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-muted/20')}>
                    <TableCell className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell className="px-4 py-3"><div className="h-4 w-10 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell className="px-4 py-3"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell className="px-4 py-3"><div className="h-3 w-16 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell className="px-4 py-3"><div className="h-7 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : filtered.length === 0 ? (
        documents.length === 0 ? (
          <NoDocuments onAddSource={onAddSource} />
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm text-muted-foreground">No sources match your filters.</p>
          </div>
        )
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => {
            const isBusy = doc.status === 'processing' || doc.status === 'pending' || reprocessingId === doc.id
            return (
              <div
                key={doc.id}
                className={cn(
                  'group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border',
                  selected.has(doc.id) && 'border-primary/50 bg-primary/5',
                  doc.status === 'error' && 'border-destructive/30',
                )}
              >
                {selected.has(doc.id) && (
                  <div className="absolute right-3 top-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked
                      onCheckedChange={() => toggleSelect(doc.id)}
                      className="size-4"
                    />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <DocIcon type={doc.type} size={20} />
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
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{doc.chunkCount ?? 0} chunks</span>
                  <span className="text-border">·</span>
                  <span>Added {formatRelative(doc.createdAt)}</span>
                </div>
                <div className="mt-3 flex items-center gap-0.5 border-t border-border/60 pt-2.5">
                  <button
                    type="button"
                    onClick={() => onPreview(doc.id)}
                    disabled={isBusy}
                    title="Preview"
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReprocess(doc.id)}
                    disabled={isBusy}
                    title="Re-index"
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <RefreshCw className={cn('size-3.5', reprocessingId === doc.id && 'animate-spin')} />
                  </button>
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => onDelete(doc.id)}
                      title="Delete"
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {isBusy && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-xl bg-muted">
                    <div className="h-full w-1/2 animate-pulse bg-info" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-border"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-muted-foreground font-medium h-11 px-4 text-sm',
                        header.column.getCanSort() && 'cursor-pointer select-none',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  onClick={() => onPreview(row.original.id)}
                  className={cn(
                    'border-b border-border/60 last:border-0 cursor-pointer transition-colors',
                    index % 2 === 1 && 'bg-muted/20',
                    'hover:bg-muted/40',
                    selected.has(row.original.id) && 'bg-primary/5',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
