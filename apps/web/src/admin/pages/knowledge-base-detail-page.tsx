import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BookOpen, Database, FileText, CheckCircle2, Building2, Files } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminKnowledgeBase } from '@/admin/hooks/use-admin'
import type { AdminKnowledgeDocument } from '@/admin/services/admin-api'

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-500' },
  processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-500' },
  ready: { label: 'Ready', cls: 'bg-emerald-500/10 text-emerald-500' },
  error: { label: 'Error', cls: 'bg-red-500/10 text-red-500' },
  archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground' },
}

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return <Badge variant="secondary" className={meta.cls}>{meta.label}</Badge>
}

export default function AdminKnowledgeBaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: kb, isLoading } = useAdminKnowledgeBase(id)
  const [sorting, setSorting] = useState<SortingState>([])

  const documents = useMemo(() => kb?.documents ?? [], [kb])
  const totals = useMemo(() => documents.reduce(
    (acc, d) => ({ chunks: acc.chunks + d.chunkCount, queries: acc.queries + d.queryCount, success: acc.success + d.successCount }),
    { chunks: 0, queries: 0, success: 0 }
  ), [documents])

  const columns = useMemo<ColumnDef<AdminKnowledgeDocument>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Document" />,
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate text-sm font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.url || row.original.fileKey || row.original.type}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <span className="text-sm">{row.original.type}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => statusBadge(row.original.status),
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
      accessorKey: 'successCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Success" />,
      cell: ({ row }) => {
        const rate = row.original.queryCount ? Math.round((row.original.successCount / row.original.queryCount) * 100) : null
        return <span className="tabular-nums text-sm">{rate === null ? '—' : `${rate}%`}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ], [])

  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const successRate = totals.queries ? Math.round((totals.success / totals.queries) * 100) : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!kb) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Knowledge base not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/knowledge-bases')}>Back to knowledge bases</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/knowledge-bases')}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>

      <PageHeader
        title={kb.name}
        description={kb.description || 'No description'}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/organizations/${kb.organization.id}`)}
          >
            <Building2 className="size-4 mr-1" />
            {kb.organization.name}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Files} label="Documents" value={documents.length} />
        <KpiCard icon={Database} label="Chunks" value={totals.chunks} />
        <KpiCard icon={FileText} label="Queries" value={totals.queries} />
        <KpiCard icon={CheckCircle2} label="Success rate" value={`${successRate}%`} />
      </div>

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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8">
                  <EmptyState icon={BookOpen} title="No documents yet" description="This knowledge base has no documents indexed yet." />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/knowledge-bases/${kb.id}/documents/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
