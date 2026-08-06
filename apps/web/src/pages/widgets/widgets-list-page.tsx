import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@/lib/table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  LayoutDashboard,
  Plus,
  Rocket,
  Globe2,
  AlertCircle,
  Trash2,
  MoreVertical,
  Copy,
  Eye,
  Check,
  Bot,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
} from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { agents as agentsApi, widgets as widgetsApi } from '@/lib/api'
import { useWidgets, type WidgetSummary } from '@/lib/hooks/use-widgets'
import { WidgetCard } from '@/components/widgets/widget-card'
import { useOrg } from '@/lib/org-context'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'
import { cn } from '@/lib/utils'

const createWidgetSchema = z.object({
  name: z.string().trim().min(1, 'Widget name is required').max(100),
  agentId: z.string().uuid('Select an agent'),
})
type CreateWidgetValues = z.infer<typeof createWidgetSchema>

type FilterStatus = 'all' | 'active' | 'paused'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const column = createColumnHelper<WidgetSummary>()

export default function WidgetsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const { widgets = [], isLoading, isError, refetch } = useWidgets(orgId)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [deleteTarget, setDeleteTarget] = useState<WidgetSummary | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [sorting, setSorting] = useState<SortingState>([])

  const form = useForm<CreateWidgetValues>({
    resolver: zodResolver(createWidgetSchema),
    defaultValues: { name: '', agentId: '' },
  })

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-for-widgets', orgId],
    queryFn: async () => (await agentsApi.list(orgId!)).data.data as Array<{ id: string; name: string }>,
    enabled: Boolean(orgId),
    staleTime: 5 * 60 * 1000,
  })

  const createWidget = useMutation({
    mutationFn: (values: CreateWidgetValues) => widgetsApi.create(orgId!, values),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      setCreateOpen(false)
      form.reset()
      navigate(`/widgets/${response.data.data.id}`)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create widget'),
  })

  const deleteWidget = useMutation({
    mutationFn: (id: string) => widgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget deleted')
      setDeleteTarget(null)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not delete widget'),
  })

  const copyEmbed = async (widget: WidgetSummary) => {
    const response = await widgetsApi.getEmbed(widget.id)
    await navigator.clipboard.writeText(response.data.data.snippet)
    setCopiedId(widget.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Embed code copied')
  }

  const filtered = useMemo(() => {
    let result = widgets

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.agent.name.toLowerCase().includes(q),
      )
    }

    if (filter !== 'all') {
      result = result.filter((w) => w.status === filter)
    }

    return result
  }, [widgets, search, filter])

  const bulk = useBulkSelection(filtered)

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => widgetsApi.delete(id)))
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} widget${ids.length !== 1 ? 's' : ''} deleted`)
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      bulk.exitSelectionMode()
      setBulkDeleteOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete some widgets')
    },
  })

  const columns = useMemo(
    () => [
      column.display({
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
      column.accessor('name', {
        header: 'Widget',
        cell: ({ row }) => {
          const w = row.original
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 shrink-0 rounded-lg">
                {w.agent.avatar ? (
                  <AvatarImage src={w.agent.avatar} alt={w.agent.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="size-4" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground truncate min-w-0">{w.name}</p>
            </div>
          )
        },
      }),
      column.accessor('agent.name', {
        header: 'Agent',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-7 shrink-0 rounded-full">
              {row.original.agent.avatar ? (
                <AvatarImage src={row.original.agent.avatar} alt={row.original.agent.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="rounded-full bg-muted text-[10px] font-medium">
                <Bot className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground truncate">{row.original.agent.name}</span>
          </div>
        ),
      }),
      column.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue()
          return (
            <span className={cn(
              'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border',
              status === 'active' && 'bg-success/10 text-success border-success/30',
              status === 'paused' && 'bg-warning/10 text-warning border-warning/30',
              status === 'draft' && 'bg-muted text-muted-foreground border-border',
            )}>
              {status === 'active' ? 'Live' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )
        },
      }),
      column.accessor('allowedDomains', {
        header: 'Domains',
        cell: ({ getValue }) => {
          const count = getValue().length
          return (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe2 className="size-3.5" />
              {count > 0 ? count : <span className="text-muted-foreground/50">—</span>}
            </span>
          )
        },
      }),
      column.accessor('updatedAt', {
        header: 'Updated',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">{timeAgo(getValue())}</span>
        ),
      }),
      column.display({
        id: 'actions',
        size: 48,
        enableSorting: false,
        header: '',
        cell: ({ row }) => {
          const w = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyEmbed(w) }}>
                  {copiedId === w.id ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                  {copiedId === w.id ? 'Copied!' : 'Copy embed code'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`/widget/demo?embed=true&widgetKey=${w.publicKey}&preview=true`, '_blank')
                  }}
                >
                  <Eye className="size-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(w) }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [bulk.isAllSelected, bulk.isSelected, bulk.toggleSelect, bulk.toggleSelectAll, navigate, copiedId],
  )

  const PAGE_SIZE = 15
  const showPagination = filtered.length > PAGE_SIZE

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

  const hasActiveFilters = !!search.trim() || filter !== 'all'
  const loading = orgLoading || isLoading

  const clearFilters = () => {
    setSearch('')
    setFilter('all')
  }

  return (
    <PageContainer className="space-y-4 [&>:last-child]:mb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Widgets</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Create and manage your AI assistants on any website.
          </p>
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
              Create Widget
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {widgets.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search widgets..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter((v ?? 'all') as FilterStatus)}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Live</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm font-medium">Failed to load widgets</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Something went wrong while fetching your widgets.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {!isError && loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <div className="size-9 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty: no widgets at all */}
      {!loading && !isError && widgets.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No widgets yet"
          description="Widgets let you embed your AI assistant on any website. Choose an agent, customize the experience, then publish one installation snippet."
          action={{ label: 'Create Widget', onClick: () => setCreateOpen(true) }}
        />
      )}

      {/* Empty: filters match nothing */}
      {!loading && !isError && widgets.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No widgets match your filters"
          description="Try a different search term or clear the filters."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}

      {/* List */}
      {!loading && !isError && filtered.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((widget) => (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  onCopyEmbed={copyEmbed}
                  onDelete={setDeleteTarget}
                  isSelected={bulk.isSelected(widget.id)}
                  onToggleSelect={() => bulk.toggleSelect(widget.id)}
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
                          style={{ width: header.getSize() }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="text-muted-foreground/50">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp className="size-3" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown className="size-3" />
                                ) : (
                                  <ArrowUpDown className="size-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      onClick={() => navigate(`/widgets/${row.original.id}`)}
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
                    of {filtered.length} widget{filtered.length !== 1 ? 's' : ''}
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
            <AlertDialogTitle>Delete {bulk.selectedCount} widget{bulk.selectedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {bulk.selectedCount} widget{bulk.selectedCount !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(bulk.selectedIds))}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${bulk.selectedCount} widget${bulk.selectedCount !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation (single) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete widget</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently deleted. This action cannot be undone.`
                : 'This widget will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWidget.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteWidget.isPending}
              onClick={() => deleteTarget && deleteWidget.mutate(deleteTarget.id)}
            >
              {deleteWidget.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={form.handleSubmit((values) => createWidget.mutate(values))}>
            <DialogHeader>
              <DialogTitle>Create a widget</DialogTitle>
              <DialogDescription>
                Pick a name and the agent this widget will use. You can adjust everything else later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget name</Label>
                <Input
                  id="widget-name"
                  placeholder="Website assistant"
                  {...form.register('name')}
                  autoFocus
                />
                <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select
                  value={form.watch('agentId')}
                  onValueChange={(value) => form.setValue('agentId', value ?? '', { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-destructive">{form.formState.errors.agentId?.message}</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWidget.isPending}>
                {createWidget.isPending ? (
                  'Creating...'
                ) : (
                  <>
                    <Rocket className="size-4" />
                    Continue to setup
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
