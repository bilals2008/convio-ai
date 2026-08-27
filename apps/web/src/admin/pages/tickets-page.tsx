import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender, createColumnHelper, type SortingState } from '@/lib/table'
import type { RowSelectionState } from '@tanstack/react-table'
import { LifeBuoy, RefreshCw, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Clock, MessageSquare, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import {
  useAdminTickets,
  useAdminDeleteTicket,
  useAdminRestoreTicket,
  useAdminBulkTickets,
} from '@/admin/hooks/use-admin'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { AdminTicket } from '@/admin/services/admin-api'

const STATUS_META: Record<string, { label: string; variant: string }> = {
  open: { label: 'Open', variant: 'pending' },
  in_progress: { label: 'In progress', variant: 'active' },
  resolved: { label: 'Resolved', variant: 'resolved' },
  closed: { label: 'Closed', variant: 'closed' },
}

const STATUS_VARIANTS = ['open', 'in_progress', 'resolved', 'closed']

function TicketStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={meta.variant as 'outline'}>{meta.label}</Badge>
}

export default function AdminTicketsPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  const isDeletedView = status === 'deleted'

  const query = useAdminTickets({
    deleted: isDeletedView ? 'true' : 'false',
    status: status === 'all' || isDeletedView ? undefined : status,
    search: search.trim() || undefined,
  })

  useEffect(() => {
    setRowSelection({})
  }, [status, search])

  const tickets = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  )
  const loading = query.isLoading
  const isError = query.isError

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  )

  const deleteMutation = useAdminDeleteTicket(() => setPendingDelete(null))
  const restoreMutation = useAdminRestoreTicket()
  const bulkMutation = useAdminBulkTickets(() => {
    setBulkConfirmOpen(false)
    setRowSelection({})
  })

  const columnHelper = createColumnHelper<AdminTicket>()

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox
            checked={
              table.getIsAllRowsSelected()
                ? true
                : table.getIsSomeRowsSelected()
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        </div>
      ),
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ticket
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
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={row.original.reporter.avatar ?? undefined} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              {(row.original.reporter.name || row.original.reporter.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground max-w-[280px]">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground max-w-[240px]">
              {row.original.reporter.name || row.original.reporter.email}
            </p>
          </div>
        </div>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('organization.name', {
      header: 'Organization',
      cell: ({ row }) => (
        <span className="truncate text-xs text-muted-foreground max-w-[180px]">
          {row.original.organization.name}
        </span>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
      sortingFn: 'text',
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.original.priority
        if (p === 'urgent') return <Badge variant="destructive">Urgent</Badge>
        if (p === 'high') return <Badge variant="pending">High</Badge>
        if (p === 'low') return <Badge variant="outline">Low</Badge>
        return <Badge variant="secondary">Normal</Badge>
      },
      sortingFn: 'text',
    }),
    columnHelper.accessor('messageCount', {
      header: 'Messages',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <MessageSquare className="size-3.5" />
          {row.original.messageCount}
        </span>
      ),
      sortingFn: 'number',
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
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {formatRelativeTime(row.original.updatedAt)}
        </span>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          {isDeletedView ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => restoreMutation.mutate(row.original.id)}
              disabled={restoreMutation.isPending}
              aria-label="Restore ticket"
            >
              {restoreMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPendingDelete(row.original.id)}
              aria-label="Delete ticket"
            >
              {deleteMutation.isPending && pendingDelete === row.original.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          )}
        </div>
      ),
    }),
  ], [columnHelper, isDeletedView, restoreMutation.isPending])

  const table = useReactTable({
    data: tickets,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  const pageRows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const showPagination = pageCount > 1

  return (
    <PageContainer>
      <PageHeader
        title="Support Tickets"
        description="All support tickets across organizations."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
              <RefreshCw className={`size-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          {isDeletedView ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkMutation.mutate({ ids: selectedIds, action: 'restore' })}
                disabled={bulkMutation.isPending}
              >
                {bulkMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                Restore
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkConfirmOpen(true)}
                disabled={bulkMutation.isPending}
              >
                {bulkMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Delete
              </Button>
              <AlertDialog open={bulkConfirmOpen} onOpenChange={(open) => {
                if (!bulkMutation.isPending) setBulkConfirmOpen(open)
              }}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.length} ticket(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      They will be hidden (soft-deleted) and restorable from the Deleted filter.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={bulkMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={bulkMutation.isPending}
                      onClick={() => {
                        bulkMutation.mutate({ ids: selectedIds, action: 'delete' })
                      }}
                    >
                      {bulkMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
            Clear
          </Button>
          <span className="ml-auto text-xs font-medium text-muted-foreground">{selectedIds.length} selected</span>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, reporter, or organization..."
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_VARIANTS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
            ))}
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Ticket</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Organization</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Priority</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Messages</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-muted/20')}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-3 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
      )}

      {!loading && isError && (
        <EmptyState
          icon={LifeBuoy}
          title="Failed to load tickets"
          description="Something went wrong while fetching tickets."
          action={{ label: 'Try again', onClick: () => query.refetch() }}
        />
      )}

      {!loading && !isError && tickets.length === 0 && (
        <EmptyState icon={LifeBuoy} title="No tickets" description="No support tickets match the current filter." />
      )}

      {!loading && !isError && tickets.length > 0 && (
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
                  {pageRows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      onClick={() => navigate(`/admin/tickets/${row.original.id}`)}
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
                    Showing {table.getState().pagination.pageIndex * 15 + 1} to{' '}
                    {Math.min((table.getState().pagination.pageIndex + 1) * 15, tickets.length)} of {tickets.length} tickets
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

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden (soft-deleted) and restorable from the Deleted filter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
            >
              {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
