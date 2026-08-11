import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@/lib/table'
import { LifeBuoy, RefreshCw, LayoutGrid, List, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Clock, MessageSquare } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminTickets } from '@/admin/hooks/use-admin'
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

function TicketCard({ ticket }: { ticket: AdminTicket }) {
  return (
    <Link
      to={`/admin/tickets/${ticket.id}`}
      className="group flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/40"
    >
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={ticket.reporter.avatar ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {(ticket.reporter.name || ticket.reporter.email).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium group-hover:text-primary">{ticket.title}</span>
          {ticket.priority === 'urgent' && (
            <Badge variant="destructive" className="shrink-0 text-[10px]">Urgent</Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="truncate">{ticket.reporter.name || ticket.reporter.email}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="truncate">{ticket.organization.name}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{ticket.messageCount} message{ticket.messageCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {formatRelativeTime(ticket.updatedAt)}
        </span>
        <TicketStatusBadge status={ticket.status} />
      </div>
    </Link>
  )
}

function TicketCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <Skeleton className="size-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

export default function AdminTicketsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const query = useAdminTickets({
    status: status === 'all' ? undefined : status,
    search: search.trim() || undefined,
  })

  const tickets = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  )
  const hasNextPage = !!query.data?.pages[query.data.pages.length - 1]?.nextCursor

  const loading = query.isLoading
  const isError = query.isError

  const columnHelper = createColumnHelper<AdminTicket>()

  const columns = useMemo(() => [
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
  ], [columnHelper])

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
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
            <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                  viewMode === 'list'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="List view"
              >
                <List className="size-3.5" />
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
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        }
      />

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
          </SelectContent>
        </Select>
      </div>

      {loading && (
        viewMode === 'table' ? (
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
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <TicketCardSkeleton key={i} />)}
          </div>
        )
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
        <>
          {viewMode === 'table' ? (
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
                      onClick={() => navigate?.(`/admin/tickets/${row.original.id}`)}
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
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
              {hasNextPage && (
                <div className="pt-2 text-center">
                  <Button variant="outline" size="sm" onClick={() => query.fetchNextPage()}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}