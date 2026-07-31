import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAuditLogs } from '@/admin/hooks/use-admin'
import type { AuditLogEntry } from '@/admin/services/admin-api'

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const limit = 25

  const { data, isLoading } = useAuditLogs({ search: search || undefined, limit, offset })

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(() => [
    {
      accessorKey: 'action',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.action}</code>,
    },
    {
      accessorKey: 'entityType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Entity" />,
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.entityType}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.entityId?.slice(0, 12)}…</div>
        </div>
      ),
    },
    {
      accessorKey: 'actor',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" />,
      cell: ({ row }) => <span className="text-sm">{row.original.actor?.name || row.original.actor?.email || '—'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ], [])

  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Platform-wide audit trail of all actions."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setOffset(0) }} placeholder="Search logs..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8">
                  <EmptyState icon={ShieldAlert} title="No audit logs found" />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{data?.total ?? 0} total log{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data || offset + limit >= data.total} onClick={() => setOffset(offset + limit)}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
