import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@/lib/table'
import { Shield } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAdminProviderKeys } from '@/admin/hooks/use-admin'
import type { AdminProviderKey } from '@/admin/services/admin-api'

export default function AdminProvidersPage() {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursors, setCursors] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const limit = 25

  const { data, isLoading } = useAdminProviderKeys({ search: search || undefined, limit, cursor })

  const columns = useMemo<ColumnDef<AdminProviderKey>[]>(() => [
    { accessorKey: 'provider', header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
      cell: ({ row }) => <span className="text-sm font-medium capitalize">{row.original.provider}</span> },
    { accessorKey: 'organization', header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <span className="text-sm">{row.original.organization.name}</span> },
    { accessorKey: 'label', header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.label || '—'}</span> },
    { accessorKey: 'keyPreview', header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
      cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.keyPreview}</code> },
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
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
        title="Provider Keys"
        description="All API provider keys across organizations."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search providers..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{columns.map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="py-8"><EmptyState icon={Shield} title="No provider keys found" /></TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{data?.data?.length ?? 0} keys shown</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={() => { const prev = [...cursors]; setCursor(prev.pop()); setCursors(prev) }}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.nextCursor} onClick={() => { setCursors([...cursors, cursor!]); setCursor(data!.nextCursor!) }}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
