import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@/lib/table'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAdminKnowledgeBases } from '@/admin/hooks/use-admin'
import type { AdminKnowledgeBase } from '@/admin/services/admin-api'

export default function AdminKnowledgeBasesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading } = useAdminKnowledgeBases({ cursor, search: search || undefined })

  const columns = useMemo<ColumnDef<AdminKnowledgeBase>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Knowledge base" />,
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate text-sm font-medium">{row.original.name}</p>
        </div>
      ),
    },
    {
      id: 'org',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.organization.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.organization.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'documentCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Docs" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.documentCount}</span>,
    },
    {
      accessorKey: 'chunkCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chunks" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.chunkCount}</span>,
    },
    {
      accessorKey: 'queryCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Queries" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.queryCount}</span>,
    },
    {
      accessorKey: 'agentCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agents" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.agentCount}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
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
        title="Knowledge Bases"
        description="All knowledge bases across the platform, with document and usage counts."
        actions={
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }}
            placeholder="Search knowledge bases..."
          />
        }
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
                  <EmptyState icon={BookOpen} title="No knowledge bases found" description="No knowledge bases match your search yet." />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/knowledge-bases/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{data?.data.length ?? 0} knowledge base{(data?.data.length ?? 0) !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={() => { const prev = cursors.pop(); setCursor(prev); setCursors([...cursors]) }}>
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
