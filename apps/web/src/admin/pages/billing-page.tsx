import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { CreditCard, DollarSign, Receipt, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useAdminBilling } from '@/admin/hooks/use-admin'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const statusBadge = (status: string) => {
  const map: Record<string, string> = { paid: 'bg-emerald-500/10 text-emerald-500', open: 'bg-amber-500/10 text-amber-500', draft: 'bg-muted text-muted-foreground', uncollectible: 'bg-red-500/10 text-red-500', void: 'bg-muted text-muted-foreground' }
  return <Badge variant="secondary" className={map[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>
}

export default function AdminBillingPage() {
  const { data, isLoading } = useAdminBilling()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<typeof data extends { invoices: (infer U)[] } ? U : never>[]>(() => [
    { accessorKey: 'invoiceNumber', header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.invoiceNumber || '—'}</span> },
    { accessorKey: 'organization', header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <span className="text-sm">{row.original.organization?.name || '—'}</span> },
    { accessorKey: 'total', header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span className="tabular-nums">${row.original.total.toFixed(2)}</span> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => statusBadge(row.original.status) },
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ], [])

  const table = useReactTable({
    data: data?.invoices || [],
    columns: columns as ColumnDef<Record<string, unknown>>[],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <PageHeader title="Billing Overview" description="Platform revenue, subscriptions, and invoices." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatsCard icon={DollarSign} label="Total Revenue" value={data ? `$${data.totalRevenue.toLocaleString()}` : '—'} iconClassName="bg-emerald-500/10 text-emerald-500" />
        <StatsCard icon={TrendingUp} label="Active Subscriptions" value={data?.activeSubscriptions.toLocaleString() || '—'} description={`/ ${data?.totalSubscriptions ?? 0} total`} iconClassName="bg-blue-500/10 text-blue-500" />
        <StatsCard icon={Receipt} label="Total Invoices" value={data?.invoices.length.toLocaleString() || '—'} description="last 20" iconClassName="bg-amber-500/10 text-amber-500" />
        <StatsCard icon={CreditCard} label="Avg. Invoice" value={data?.invoices.length ? `$${(data.invoices.reduce((s, i) => s + i.total, 0) / data.invoices.length).toFixed(2)}` : '—'} iconClassName="bg-violet-500/10 text-violet-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Plan Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.planDistribution && data.planDistribution.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.planDistribution} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                        {data.planDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  {data.planDistribution.map((d, i) => (
                    <div key={d.plan} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="w-20 capitalize text-muted-foreground">{d.plan}</span>
                      <span className="w-8 text-right font-medium tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No subscription data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Subscriptions by Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.subscriptionsByStatus && Object.keys(data.subscriptionsByStatus).length > 0 ? (
              <div className="flex flex-col gap-3">
                {Object.entries(data.subscriptionsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-muted-foreground">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / data.totalSubscriptions) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right text-sm font-medium tabular-nums">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No subscription data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Invoices</CardTitle>
          </div>
        </CardHeader>
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
              <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">No invoices found</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
