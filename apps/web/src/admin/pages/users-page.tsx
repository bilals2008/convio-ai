import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { UsersIcon, CalendarDays, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { UserAvatar } from '@/components/admin/user-avatar'
import { EmptyState } from '@/components/admin/empty-state'
import { KpiCard } from '@/components/admin/kpi-card'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAdminUsers, useAdminAnalytics } from '@/admin/hooks/use-admin'
import type { AdminUser } from '@/admin/services/admin-api'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading } = useAdminUsers({ cursor, search: search || undefined })
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(30)
  const signups = analytics?.userSignups || []
  const sum = (points: typeof signups) => points.reduce((s, p) => s + p.count, 0)
  const todayCount = signups.at(-1)?.count ?? 0
  const weekCount = sum(signups.slice(-7))
  const monthCount = sum(signups)

  function pctChange(current: number, previous: number) {
    if (previous <= 0) return current > 0 ? { trend: 'up' as const, change: '100%' } : { trend: 'flat' as const, change: '0%' }
    const diff = Math.round(((current - previous) / previous) * 100)
    if (diff > 0) return { trend: 'up' as const, change: `+${diff}%` }
    if (diff < 0) return { trend: 'down' as const, change: `${diff}%` }
    return { trend: 'flat' as const, change: '0%' }
  }

  function trendOf(val: number) {
    if (val > 0) return { trend: 'up' as const, change: `+${val}%` }
    if (val < 0) return { trend: 'down' as const, change: `${val}%` }
    return { trend: 'flat' as const, change: '0%' }
  }

  const todayTrend = pctChange(todayCount, signups.at(-2)?.count ?? 0)
  const weekTrend = pctChange(weekCount, sum(signups.slice(-14, -7)))
  const monthTrend = trendOf(analytics?.usersChange ?? 0)

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => <UserAvatar name={row.original.name} email={row.original.email} avatar={row.original.avatar} />,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: 'orgCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Orgs" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.orgCount}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
        title="Users"
        description="All platform users across organizations."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search users..." />}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <KpiCard icon={UsersIcon} label="Today" value={todayCount} {...todayTrend} period="vs yesterday" color="bg-primary/10 text-primary" loading={analyticsLoading} />
        <KpiCard icon={CalendarDays} label="This Week" value={weekCount} {...weekTrend} period="vs prev week" color="bg-blue-500/10 text-blue-500" loading={analyticsLoading} />
        <KpiCard icon={CalendarRange} label="This Month" value={monthCount} {...monthTrend} period="vs last period" color="bg-violet-500/10 text-violet-500" loading={analyticsLoading} />
      </div>
      <div className="mt-6">
        <UserGrowthChart />
      </div>
      <div className="mt-6 rounded-xl border border-border/60 bg-card">
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
                  <EmptyState icon={UsersIcon} title="No users found" />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => navigate(`/admin/users/${row.original.id}`)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{data?.data.length ?? 0} user{(data?.data.length ?? 0) !== 1 ? 's' : ''}</p>
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
