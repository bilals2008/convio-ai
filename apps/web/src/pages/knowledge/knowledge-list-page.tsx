import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import {
  Plus,
  BookOpen,
  Trash2,
  MoreVertical,
  Upload,
  Type,
  HelpCircle,
  Loader2,
  Table2,
  FileJson,
  FileCode,
  Zap,
  Link2,
  FileText,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { cn, formatRelativeTime } from '@/lib/utils'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'
import { KnowledgeCard, KnowledgeCardSkeleton } from '@/components/knowledge/knowledge-card'
import { SourcePickerModal, type SourceType } from '@/components/knowledge/source-picker-modal'
import { toast } from 'sonner'

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

const quickSources = [
  { id: 'file-upload' as SourceType, label: 'File', icon: Upload, color: 'bg-primary/10 text-primary' },
  { id: 'website' as SourceType, label: 'Website', icon: null, color: 'bg-blue-500/10 text-blue-500', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google-chrome/default.svg' },
  { id: 'custom-text' as SourceType, label: 'Text', icon: Type, color: 'bg-teal-500/10 text-teal-500' },
  { id: 'faq' as SourceType, label: 'FAQ', icon: HelpCircle, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'csv' as SourceType, label: 'CSV', icon: Table2, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'json' as SourceType, label: 'JSON', icon: FileJson, color: 'bg-amber-500/10 text-amber-500' },
  { id: 'markdown' as SourceType, label: 'Markdown', icon: FileCode, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'api' as SourceType, label: 'API', icon: Zap, color: 'bg-purple-500/10 text-purple-500' },
  { id: 'sitemap' as SourceType, label: 'Sitemap', icon: Link2, color: 'bg-cyan-500/10 text-cyan-500' },
]

function kbStatus(kb: KnowledgeBase): { label: string; variant: 'active' | 'pending' | 'canceled' } {
  if ((kb.errorCount ?? 0) > 0) return { label: 'Error', variant: 'canceled' }
  if ((kb.processingCount ?? 0) > 0) return { label: 'Processing', variant: 'pending' }
  if (kb.documentCount === 0) return { label: 'Empty', variant: 'pending' }
  return { label: 'Ready', variant: 'active' }
}

const columnHelper = createColumnHelper<KnowledgeBase>()

export default function KnowledgeListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sourceModalOpen, setSourceModalOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [sorting, setSorting] = useState<SortingState>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as KnowledgeBase[]
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      setDeleteId(null)
      toast.success('Knowledge base deleted')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => knowledgeApi.delete(id)))
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} knowledge base${ids.length !== 1 ? 's' : ''} deleted`)
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      bulk.exitSelectionMode()
      setBulkDeleteOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete some knowledge bases')
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      knowledgeApi.create({ name: createName.trim() || 'Untitled', description: createDesc.trim(), organizationId: orgId! }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      const createdId = res.data?.data?.id as string | undefined
      setCreateOpen(false)
      setCreateName('')
      setCreateDesc('')
      toast.success('Knowledge base created')
      if (createdId) navigate(`/knowledge/${createdId}`)
    },
    onError: (err: unknown) => toast.error(`Failed to create: ${err instanceof Error ? err.message : String(err)}`),
  })

  const filtered = useMemo(() =>
    knowledgeBases.filter((kb) =>
      !search || kb.name.toLowerCase().includes(search.toLowerCase()) || kb.description?.toLowerCase().includes(search.toLowerCase())
    ), [knowledgeBases, search]
  )

  const bulk = useBulkSelection(filtered)

  const PAGE_SIZE = 15
  const showPagination = filtered.length > PAGE_SIZE

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      size: 36,
      enableSorting: false,
      header: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={bulk.isAllSelected}
            onCheckedChange={() => bulk.toggleSelectAll()}
            className="size-4"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={bulk.isSelected(row.original.id)}
            onCheckedChange={() => bulk.toggleSelect(row.original.id)}
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
          Knowledge Base
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
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
              {row.original.description || 'No description'}
            </p>
          </div>
        </div>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('documentCount', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Documents
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => {
        const kb = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="size-3.5" />
              {kb.documentCount}
            </span>
            {(kb.readyCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-success">
                <CheckCircle2 className="size-3" />
                {kb.readyCount}
              </span>
            )}
            {(kb.processingCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-info">
                <Loader2 className="size-3 animate-spin" />
                {kb.processingCount}
              </span>
            )}
            {(kb.errorCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-destructive">
                <AlertCircle className="size-3" />
                {kb.errorCount}
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
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
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(row.original.updatedAt)}
        </span>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      size: 48,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate(`/knowledge/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ], [bulk.isAllSelected, bulk.isSelected, bulk.toggleSelect, bulk.toggleSelectAll, navigate])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(showPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  const loading = orgLoading || isLoading

  const handleSourceSelect = (sourceId: SourceType) => {
    setCreateOpen(true)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Knowledge Bases</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage context for your AI agents.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bulk.selectedCount > 0 ? (
            <BulkActionBar
              onExitSelectionMode={bulk.exitSelectionMode}
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete ({bulk.selectedCount})
                </Button>
              }
            />
          ) : (
            <Button onClick={() => setCreateOpen(true)} className="shrink-0">
              <Plus className="size-4" />
              Create Knowledge Base
            </Button>
          )}
        </div>
      </div>

      {/* Quick sources */}
      <div className="flex flex-wrap items-center gap-2">
        {quickSources.map((source) => (
          <button
            key={source.id}
            onClick={() => handleSourceSelect(source.id)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            {source.logo ? (
              <div className="flex size-4 shrink-0 items-center justify-center rounded bg-background border border-border/40">
                <img src={source.logo} alt="" className="size-2.5" loading="lazy" />
              </div>
            ) : source.icon ? (
              <div className={cn('flex size-4 shrink-0 items-center justify-center rounded', source.color)}>
                <source.icon className="size-2.5" />
              </div>
            ) : null}
            {source.label}
          </button>
        ))}
        <button
          onClick={() => setSourceModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-3" />
          More
        </button>
      </div>

      {/* Toolbar */}
      {knowledgeBases.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search knowledge bases..."
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="Table view"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <KnowledgeCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Knowledge Base</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Documents</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Updated</TableHead>
                  <TableHead className="h-11 w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-muted/20')}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <KnowledgeCardSkeleton />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      {/* Empty: no knowledge bases */}
      {!loading && knowledgeBases.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases yet"
          description="Create a knowledge base to give your AI agents context about your business."
          action={{ label: 'Create Knowledge Base', onClick: () => setCreateOpen(true) }}
        />
      )}

      {/* Empty: no matches */}
      {!loading && knowledgeBases.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases match your search"
          description="Try a different search term."
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} knowledge base{filtered.length !== 1 ? 's' : ''}
              {search ? ' found' : ''}
            </p>
            {bulk.selectedCount > 0 ? (
              <button
                type="button"
                onClick={bulk.toggleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={bulk.isAllSelected}
                    className="size-4"
                  />
                </div>
                {bulk.isAllSelected ? 'Deselect all' : 'Select all'}
              </button>
            ) : null}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((kb) => (
                <KnowledgeCard
                  key={kb.id}
                  kb={kb}
                  onDelete={setDeleteId}
                  isSelected={bulk.isSelected(kb.id)}
                  onToggleSelect={() => bulk.toggleSelect(kb.id)}
                  showCheckbox={bulk.selectedCount > 0}
                />
              ))}
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
                            header.column.getCanSort() && 'cursor-pointer select-none'
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
                      onClick={() => navigate(`/knowledge/${row.original.id}`)}
                      className={cn(
                        'border-b border-border/60 last:border-0 cursor-pointer transition-colors',
                        index % 2 === 1 && 'bg-muted/20',
                        'hover:bg-muted/40'
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

              {showPagination && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {table.getState().pagination.pageIndex * PAGE_SIZE + 1} to{' '}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * PAGE_SIZE,
                      filtered.length,
                    )}{' '}
                    of {filtered.length} knowledge bases
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    {table.getPageOptions().map((page) => (
                      <Button
                        key={page}
                        variant={table.getState().pagination.pageIndex === page ? 'default' : 'outline'}
                        size="icon-sm"
                        onClick={() => table.setPageIndex(page)}
                      >
                        {page + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulk.selectedCount} knowledge base{bulk.selectedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {bulk.selectedCount} knowledge base{bulk.selectedCount !== 1 ? 's' : ''} and all their documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(bulk.selectedIds))}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${bulk.selectedCount} knowledge base${bulk.selectedCount !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Base</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge base and all its documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SourcePickerModal
        open={sourceModalOpen}
        onOpenChange={setSourceModalOpen}
        onSelect={handleSourceSelect}
      />

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open)
        if (!open) { setCreateName(''); setCreateDesc('') }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>Add a name and optional description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Product Docs"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="What is this knowledge base for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); setCreateName(''); setCreateDesc('') }}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!createName.trim() || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
