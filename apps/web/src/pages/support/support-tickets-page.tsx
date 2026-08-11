import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@/lib/table'
import { Plus, LifeBuoy, MessageSquare, Inbox, LayoutGrid, List, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/loading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useOrg } from '@/lib/org-context'
import { useTickets, useCreateTicket, type TicketSummary } from '@/lib/hooks/use-tickets'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TicketStatusBadge } from './ticket-status'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug report' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature request' },
  { value: 'account', label: 'Account' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}

function TicketCard({ ticket }: { ticket: TicketSummary }) {
  return (
    <Link
      to={`/support/${ticket.id}`}
      className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium group-hover:text-primary">{ticket.title}</span>
          {ticket.category !== 'general' && (
            <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
              {categoryLabel(ticket.category)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3" />
            {ticket.messageCount}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatRelativeTime(ticket.updatedAt)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <TicketStatusBadge status={ticket.status} />
      </div>
    </Link>
  )
}

function TicketCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

export default function SupportTicketsPage() {
  const { orgId } = useOrg()
  const [open, setOpen] = useState(false)
  const [submit, setSubmit] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table')
  const [sorting, setSorting] = useState<SortingState>([])

  const ticketsQuery = useTickets(orgId ?? undefined, {})
  const createMutation = useCreateTicket(orgId ?? undefined)

  const tickets = useMemo(
    () => ticketsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [ticketsQuery.data],
  )

  const columnHelper = createColumnHelper<TicketSummary>()

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Subject
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
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground max-w-[320px]">{row.original.title}</p>
          {row.original.category !== 'general' && (
            <p className="truncate text-xs text-muted-foreground">{categoryLabel(row.original.category)}</p>
          )}
        </div>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{categoryLabel(row.original.category)}</span>
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
  const showPagination = table.getPageCount() > 1

  return (
    <div className="space-y-6">
      <PageHeader
        className="flex-row items-center justify-between gap-3"
        title="Support"
        description="Get help from the team. Tickets are tracked in your organization."
        action={
          <div className="flex items-center gap-2">
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
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4 shrink-0" />
              New Ticket
            </Button>
          </div>
        }
      />

      <CreateTicketDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => setOpen(false)}
        createMutation={createMutation}
        submitting={submit}
        setSubmitting={setSubmit}
      />

      {ticketsQuery.isLoading ? (
        viewMode === 'table' ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Subject</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Category</TableHead>
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
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
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
            {Array.from({ length: 3 }).map((_, i) => <TicketCardSkeleton key={i} />)}
          </div>
        )
      ) : ticketsQuery.isError ? (
        <EmptyState
          icon={Inbox}
          title="Couldn't load tickets"
          description="Something went wrong while fetching your tickets."
          action={{ label: 'Try again', onClick: () => ticketsQuery.refetch() }}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No tickets yet"
          description="Need help? Create a ticket and the team will get back to you."
          action={{ label: 'Create a ticket', onClick: () => setOpen(true) }}
        />
      ) : viewMode === 'table' ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
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
                  onClick={() => window.location.assign(`/support/${row.original.id}`)}
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
                <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
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
                <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      )}
    </div>
  )
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  onCreated,
  createMutation,
  submitting,
  setSubmitting,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated?: () => void
  createMutation: ReturnType<typeof useCreateTicket>
  submitting: boolean
  setSubmitting: (s: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('normal')

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setCategory('general')
      setPriority('normal')
    }
  }, [open])

  function handleCreate() {
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    createMutation.mutate(
      { title: title.trim(), description: description.trim(), category, priority },
      {
        onSuccess: () => {
          setSubmitting(false)
          onCreated?.()
        },
        onSettled: () => setSubmitting(false),
      },
    )
  }

  const valid = title.trim().length > 0 && description.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Support Ticket</DialogTitle>
          <DialogDescription>
            Describe the issue or request and our team will follow up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticketTitle">Subject</Label>
            <Input
              id="ticketTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketCategory">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="ticketCategory">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketPriority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="ticketPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketDescription">Details</Label>
            <Textarea
              id="ticketDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, expected vs actual behavior, links, etc."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!valid || submitting}>
            {submitting ? 'Submitting...' : 'Create Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}