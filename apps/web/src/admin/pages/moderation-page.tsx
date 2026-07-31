import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { Flag, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminModeration, useAdminModerationViolations } from '@/admin/hooks/use-admin'
import type { ModerationOrgConfig, ModerationViolation } from '@/admin/services/admin-api'

export default function AdminModerationPage() {
  const [search, setSearch] = useState('')
  const [orgOffset, setOrgOffset] = useState(0)
  const [violationOffset, setViolationOffset] = useState(0)
  const [orgSorting, setOrgSorting] = useState<SortingState>([])
  const [violationSorting, setViolationSorting] = useState<SortingState>([])
  const limit = 25

  const { data: orgsData, isLoading: orgsLoading } = useAdminModeration({ search: search || undefined, limit, offset: orgOffset })
  const { data: violationsData, isLoading: violationsLoading } = useAdminModerationViolations({ search: search || undefined, limit, offset: violationOffset })

  const orgColumns = useMemo<ColumnDef<ModerationOrgConfig>[]>(() => [
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <div><p className="text-sm font-medium">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.slug}</p></div> },
    { accessorKey: 'plan', header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
      cell: ({ row }) => <StatusBadge status={row.original.plan || 'free'} /> },
    { id: 'moderation', header: ({ column }) => <DataTableColumnHeader column={column} title="Moderation" />,
      cell: ({ row }) => {
        const c = row.original.config
        return c?.enabled
          ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">Enabled</Badge>
          : <Badge variant="secondary" className="bg-muted text-muted-foreground">Disabled</Badge>
      } },
    { id: 'blockOnViolation', header: ({ column }) => <DataTableColumnHeader column={column} title="Block" />,
      cell: ({ row }) => {
        const c = row.original.config
        if (!c?.enabled) return <span className="text-xs text-muted-foreground">—</span>
        return c.blockOnViolation
          ? <span className="text-xs text-red-500">Blocking</span>
          : <span className="text-xs text-amber-500">Flagging</span>
      } },
    { accessorKey: 'violationCount', header: ({ column }) => <DataTableColumnHeader column={column} title="Violations" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.violationCount}</span> },
  ], [])

  const orgTable = useReactTable({
    data: orgsData?.data || [],
    columns: orgColumns,
    state: { sorting: orgSorting },
    onSortingChange: setOrgSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const violationColumns = useMemo<ColumnDef<ModerationViolation>[]>(() => [
    { accessorKey: 'organization', header: ({ column }) => <DataTableColumnHeader column={column} title="Org" />,
      cell: ({ row }) => <span className="text-sm">{row.original.organization?.name || '—'}</span> },
    { accessorKey: 'entityType', header: ({ column }) => <DataTableColumnHeader column={column} title="Entity" />,
      cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.entityType}</code> },
    { id: 'flags', header: ({ column }) => <DataTableColumnHeader column={column} title="Flags" />,
      cell: ({ row }) => {
        const flags = (row.original.metadata as { flags?: string })?.flags
        return flags ? <span className="text-xs text-red-500">{flags}</span> : <span className="text-xs text-muted-foreground">—</span>
      } },
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
  ], [])

  const violationTable = useReactTable({
    data: violationsData?.data || [],
    columns: violationColumns,
    state: { sorting: violationSorting },
    onSortingChange: setViolationSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <PageHeader
        title="Moderation Overview"
        description="Organization moderation configs and platform violation log."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setOrgOffset(0); setViolationOffset(0) }} placeholder="Search orgs..." />}
      />

      <Card className="mb-6">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-2">
            <Flag className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Organization Moderation Configs</CardTitle>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            {orgTable.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {orgsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{orgColumns.map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
              ))
            ) : orgTable.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={orgColumns.length} className="py-8"><EmptyState icon={Flag} title="No moderation configs found" /></TableCell></TableRow>
            ) : (
              orgTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{orgsData?.total ?? 0} total</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={orgOffset === 0} onClick={() => setOrgOffset(Math.max(0, orgOffset - limit))}><ChevronLeftIcon className="size-4" /> Previous</Button>
            <Button variant="outline" size="sm" disabled={!orgsData || orgOffset + limit >= orgsData.total} onClick={() => setOrgOffset(orgOffset + limit)}>Next <ChevronRightIcon className="size-4" /></Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Violations</CardTitle>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            {violationTable.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {violationsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{violationColumns.map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
              ))
            ) : violationTable.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={violationColumns.length} className="py-8"><EmptyState icon={ShieldAlert} title="No violations found" /></TableCell></TableRow>
            ) : (
              violationTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{violationsData?.total ?? 0} total</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={violationOffset === 0} onClick={() => setViolationOffset(Math.max(0, violationOffset - limit))}><ChevronLeftIcon className="size-4" /> Previous</Button>
            <Button variant="outline" size="sm" disabled={!violationsData || violationOffset + limit >= violationsData.total} onClick={() => setViolationOffset(violationOffset + limit)}>Next <ChevronRightIcon className="size-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
