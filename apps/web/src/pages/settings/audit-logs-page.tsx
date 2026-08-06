import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,

  flexRender,
  createColumnHelper,
  type SortingState,
} from '@/lib/table'
import {
  ScrollText,
  SearchX,
  RefreshCw,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  CalendarIcon,
  X,
  Users,
  Activity,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { LoadingPage } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { DateTime } from '@/components/shared/date-time'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/stat-card'
import { auditLogs as auditLogsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn, formatRelativeTime, formatDate } from '@/lib/utils'

const ENTITY_TYPES = ['agent', 'member', 'organization', 'knowledge', 'api_key', 'provider_key', 'sso', 'moderation', 'data_category', 'data_wipe'] as const
const ACTIONS = ['created', 'updated', 'deleted', 'invited', 'removed', 'role_changed', 'configured', 'disabled', 'violation'] as const
const PAGE_SIZE = 25

function formatAction(action: string): string {
  return action
    .replace(/\./g, ' · ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getEntityBadgeVariant(type: string) {
  const map: Record<string, 'entity_agent' | 'entity_member' | 'entity_organization' | 'entity_knowledge' | 'entity_api_key' | 'entity_provider_key' | 'entity_sso' | 'entity_moderation' | 'entity_data_category' | 'entity_data_wipe' | 'entity_membership' | 'entity_invitation'> = {
    agent: 'entity_agent',
    member: 'entity_member',
    membership: 'entity_membership',
    organization: 'entity_organization',
    knowledge: 'entity_knowledge',
    api_key: 'entity_api_key',
    provider_key: 'entity_provider_key',
    sso: 'entity_sso',
    moderation: 'entity_moderation',
    data_category: 'entity_data_category',
    data_wipe: 'entity_data_wipe',
    invitation: 'entity_invitation',
  }
  return map[type] || 'entity_data_category'
}

function formatLabel(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown> | null
  createdAt: string
  actor: { id: string; name?: string; email?: string; avatar?: string } | null
}

export default function AuditLogsPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<{ id: string; label: string; group: string }[]>([])
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [page, setPage] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filterItems = useMemo(() => [
    ...ACTIONS.map(a => ({ id: `action:${a}`, label: formatLabel(a), group: 'action' as const })),
    ...ENTITY_TYPES.map(t => ({ id: `type:${t}`, label: formatLabel(t), group: 'type' as const })),
  ], [])

  const selectedActions = useMemo(() =>
    selectedFilters.filter(f => f.group === 'action').map(f => f.id.replace('action:', '')), [selectedFilters])

  const selectedTypes = useMemo(() =>
    selectedFilters.filter(f => f.group === 'type').map(f => f.id.replace('type:', '')), [selectedFilters])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', orgId, debouncedSearch, selectedFilters, fromDate, toDate, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: page * PAGE_SIZE }
      if (search) params.search = search
      if (selectedActions.length > 0) params.action = selectedActions.join(',')
      if (selectedTypes.length > 0) params.entityType = selectedTypes.join(',')
      if (fromDate) params.dateFrom = fromDate.toISOString().split('T')[0]
      if (toDate) params.dateTo = toDate.toISOString().split('T')[0]
      const res = await auditLogsApi.list(orgId!, params)
      return res.data
    },
    enabled: !!orgId,
    placeholderData: (prev) => prev,
  })

  const logs = useMemo(() => (data?.data || []) as AuditLog[], [data])
  const total = data?.total || 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const uniqueActors = useMemo(() => {
    const ids = new Set(logs.map(l => l.actor?.id).filter(Boolean))
    return ids.size
  }, [logs])

  const uniqueActions = useMemo(() => {
    const types = new Set(logs.map(l => l.action))
    return types.size
  }, [logs])

  const clearDateFilters = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setPage(0)
  }

  const hasDateFilters = !!fromDate || !!toDate
  const hasFilters = !!search || selectedFilters.length > 0 || hasDateFilters

  const columnHelper = createColumnHelper<AuditLog>()

  const columns = useMemo(() => [
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Time
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
        <div>
          <span className="text-xs text-foreground">
            {formatRelativeTime(row.original.createdAt)}
          </span>
          <div className="text-[10px] text-muted-foreground/60 mt-0.5">
            <DateTime date={row.original.createdAt} format="full" />
          </div>
        </div>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('actor', {
      header: 'Actor',
      cell: ({ row }) => {
        const actor = row.original.actor
        return actor ? (
          <span className="text-sm font-medium text-foreground">
            {actor.name || actor.email || 'Unknown'}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">System</span>
        )
      },
      sortingFn: (a, b) => {
        const aName = a.original.actor?.name || a.original.actor?.email || 'zzz'
        const bName = b.original.actor?.name || b.original.actor?.email || 'zzz'
        return aName.localeCompare(bName)
      },
    }),
    columnHelper.accessor('action', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Action
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
        <span className="text-sm text-foreground">{formatAction(row.original.action)}</span>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('entityType', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
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
        <Badge variant={getEntityBadgeVariant(row.original.entityType)} className="capitalize">
          {row.original.entityType.replace(/_/g, ' ')}
        </Badge>
      ),
      sortingFn: 'text',
    }),
    columnHelper.display({
      id: 'details',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSelectedLog(row.original)}
        >
          <Eye className="size-4" />
        </Button>
      ),
      size: 48,
      enableSorting: false,
    }),
  ], [columnHelper])

  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: totalPages,
    manualPagination: true,
  })

  const handleFilterChange = () => {
    setPage(0)
  }

  if (orgLoading) return <LoadingPage text="Loading audit logs..." />

  if (!orgId) return null

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit Logs" description="Chronological record of all actions in your organization." />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <SearchX className="size-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Failed to load audit logs</h3>
            <p className="text-sm text-muted-foreground mb-4">{(error as Error)?.message || 'Something went wrong.'}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Logs"
        description="Chronological record of all actions in your organization."
        action={
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard title="Total Events" value={total} icon={ScrollText} color="text-primary" />
        <StatCard title="Unique Actors" value={uniqueActors} icon={Users} color="text-blue-500" />
        <StatCard title="Action Types" value={uniqueActions} icon={Activity} color="text-emerald-500" />
        <StatCard title="Filters Active" value={selectedFilters.length + (hasDateFilters ? 1 : 0) + (search ? 1 : 0)} icon={ScrollText} color="text-amber-500" change={hasFilters ? 'active' : undefined} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-full sm:max-w-64">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Search</label>
              <SearchInput value={search} onChange={(v) => { setSearch(v); handleFilterChange() }} placeholder="Action, type, or ID..." />
            </div>
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Action / Type</label>
              <Combobox
                items={filterItems}
                multiple
                value={selectedFilters}
                onValueChange={(v) => { setSelectedFilters(v); handleFilterChange() }}
                itemToStringValue={(item) => item.label}
              >
                <ComboboxChips className="min-h-9">
                  <ComboboxValue>
                    {selectedFilters.map((item) => (
                      <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  <ComboboxChipsInput placeholder="Filter actions or types..." />
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>No matches found.</ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxGroup>
                      <ComboboxLabel>Actions</ComboboxLabel>
                      {filterItems.filter(i => i.group === 'action').map((item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                    <ComboboxSeparator />
                    <ComboboxGroup>
                      <ComboboxLabel>Entity Types</ComboboxLabel>
                      {filterItems.filter(i => i.group === 'type').map((item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">From</label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      data-empty={!fromDate}
                      className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    />
                  }
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {fromDate ? formatDate(fromDate) : <span>Pick date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(d) => { setFromDate(d); handleFilterChange() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">To</label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      data-empty={!toDate}
                      className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    />
                  }
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {toDate ? formatDate(toDate) : <span>Pick date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(d) => { setToDate(d); handleFilterChange() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {hasDateFilters && (
              <div className="flex items-end pb-0.5">
                <Button variant="ghost" size="icon-sm" onClick={clearDateFilters} title="Clear dates">
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="size-8 animate-pulse rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        ) : logs.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={ScrollText}
              title="No audit logs yet"
              description={hasFilters
                ? 'No logs match your filters. Try adjusting them.'
                : 'Actions performed in your organization will appear here.'
              }
            />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                      className={cn(
                        'border-b border-border/60 last:border-0 transition-colors',
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
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1} to{' '}
                  {Math.min((page + 1) * PAGE_SIZE, total)}{' '}
                  of {total} logs
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i
                    } else if (page < 3) {
                      pageNum = i
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="icon-sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit event.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Time</label>
                  <p className="text-sm text-foreground mt-1">
                    <DateTime date={selectedLog.createdAt} format="full" />
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Actor</label>
                  <p className="text-sm text-foreground mt-1">
                    {selectedLog.actor?.name || selectedLog.actor?.email || 'System'}
                  </p>
                  {selectedLog.actor?.email && selectedLog.actor?.name && (
                    <p className="text-xs text-muted-foreground">{selectedLog.actor.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Action</label>
                  <p className="text-sm text-foreground mt-1">{formatAction(selectedLog.action)}</p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Entity Type</label>
                  <div className="mt-1">
                    <Badge variant={getEntityBadgeVariant(selectedLog.entityType)} className="capitalize">
                      {selectedLog.entityType.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                {selectedLog.entityId && (
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Entity ID</label>
                    <p className="text-sm text-foreground mt-1 font-mono break-all bg-muted/50 rounded-md px-3 py-2 border border-border/60">
                      {selectedLog.entityId}
                    </p>
                  </div>
                )}
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Metadata</label>
                  <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border/60">
                    {Object.entries(selectedLog.metadata).map(([key, value]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
                      return (
                        <div key={key} className="flex items-start justify-between gap-4 px-3 py-2.5">
                          <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                          <span className="text-xs text-foreground font-medium text-right break-all max-w-[240px]">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                             value === null || value === undefined ? '—' :
                             String(value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
