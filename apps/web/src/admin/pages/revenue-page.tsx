import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, type TooltipProps } from 'recharts'
import { DollarSign, TrendingUp, Zap, Users, UserPlus, RefreshCcw, Download, FileDown, Search, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/admin/page-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { useAdminRevenue, useAdminAnalytics } from '@/admin/hooks/use-admin'
import type { AdminRevenue, RevenuePeriod } from '@/admin/services/admin-api'

const PERIODS: Array<{ label: string; value: RevenuePeriod }> = [
  { label: '12 Weeks', value: 'weekly' },
  { label: '12 Months', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

const revenueConfig = { revenue: { label: 'Revenue', color: 'hsl(142, 71%, 45%)' } } satisfies ChartConfig
const growthConfig = { customers: { label: 'Active Customers', color: 'hsl(217, 91%, 60%)' } } satisfies ChartConfig
const subsConfig = { subscriptions: { label: 'New Subscriptions', color: 'hsl(25, 95%, 53%)' } } satisfies ChartConfig

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n}%`
const changeClass = (n: number) => (n >= 0 ? 'text-emerald-500' : 'text-red-500')
const channelLabel = (ch: string) => ch.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

type TipValue = string | number | Array<string | number>

function ChartTip({ active, payload, label, money }: TooltipProps<TipValue, string> & { money?: boolean }) {
  if (!active || !payload?.length) return null
  const value = Number(payload[0].value)
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
        <span className="capitalize text-muted-foreground">{payload[0].name}:</span>
        <span className="ml-auto font-medium tabular-nums text-foreground">
          {money ? `$${value.toLocaleString()}` : value.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function AdminRevenuePage() {
  const [period, setPeriod] = useState<RevenuePeriod>('monthly')
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading, isError } = useAdminRevenue(period)
  const { data: analytics } = useAdminAnalytics(30)

  const summary = data?.summary
  const timeline = data?.timeline ?? []
  const trendData = timeline.map((t) => ({ label: t.label, revenue: t.revenue }))
  const growthData = timeline.map((t) => ({ label: t.label, customers: t.active }))
  const subsData = timeline.map((t) => ({ label: t.label, subscriptions: t.newSubs }))
  const maxPlanRevenue = Math.max(1, ...(data?.planRevenue.map((p) => p.revenue) ?? []))

  // ponytail: no revenue-by-channel in the DB; channel share is derived from conversation volume
  const channelMix = useMemo(() => {
    const rows = analytics?.channelBreakdown ?? []
    const total = rows.reduce((s, r) => s + r.count, 0)
    if (total === 0) return []
    return rows
      .map((r) => ({ channel: r.channel, pct: Math.round((r.count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
  }, [analytics])

  const columns = useMemo<ColumnDef<AdminRevenue['recentInvoices'][number]>[]>(() => [
    {
      accessorKey: 'organization',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{row.original.organization?.name ?? '—'}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.original.invoiceNumber || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
      cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.plan}</Badge>,
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span className="font-medium tabular-nums">${row.original.total.toFixed(2)}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={row.original.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'paidAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.paidAt).toLocaleDateString()}</span>,
    },
  ], [])

  const table = useReactTable({
    data: data?.recentInvoices ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getFilteredRowModel().rows

  const downloadCsv = (filename: string, header: string[], lines: Array<Array<string | number>>) => {
    const csv = [header.join(','), ...lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportInvoicesCsv = () => {
    if (rows.length === 0) return
    downloadCsv('revenue-invoices',
      ['customer', 'invoice', 'plan', 'amount', 'status', 'date'],
      rows.map((r) => [r.original.organization?.name ?? '', r.original.invoiceNumber ?? '', r.original.plan, r.original.total, r.original.status, new Date(r.original.paidAt).toLocaleDateString()]))
  }

  const exportReportCsv = () => {
    if (timeline.length === 0) return
    downloadCsv('revenue-report',
      ['period', 'revenue', 'loss', 'profit', 'new_subscriptions', 'churned_subscriptions', 'active_subscriptions'],
      timeline.map((t) => [t.label, t.revenue, t.loss, t.profit, t.newSubs, t.churnedSubs, t.active]))
  }

  const header = (
    <PageHeader
      title="Revenue"
      description="Track earnings, subscriptions & growth"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportReportCsv}>
            <FileDown className="size-3.5" />
            Download Report
          </Button>
          <Button size="sm" onClick={exportInvoicesCsv}>
            <Download className="size-3.5" />
            Export
          </Button>
        </>
      }
    />
  )

  if (isLoading) {
    return (
      <PageContainer>
        {header}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-xl" />)}
        </div>
        <Skeleton className="h-[280px] rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[220px] rounded-xl" />)}
        </div>
      </PageContainer>
    )
  }

  if (isError) {
    return (
      <PageContainer>
        {header}
        <EmptyState icon={AlertCircle} title="Failed to load revenue" description="Something went wrong. Please try again." />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {header}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard icon={DollarSign} label="Total Revenue" value={summary ? fmtMoney(summary.totalRevenue) : '—'}
          description={summary ? pct(summary.revenueChange) : undefined} descriptionClassName={summary ? changeClass(summary.revenueChange) : undefined}
          iconClassName="bg-emerald-500/10 text-emerald-500" />
        <StatsCard icon={TrendingUp} label="MRR" value={summary ? fmtMoney(summary.mrr) : '—'}
          description={summary ? pct(summary.mrrChange) : undefined} descriptionClassName={summary ? changeClass(summary.mrrChange) : undefined}
          iconClassName="bg-blue-500/10 text-blue-500" />
        <StatsCard icon={Zap} label="ARR" value={summary ? fmtMoney(summary.mrr * 12) : '—'} description="annualized from MRR"
          iconClassName="bg-amber-500/10 text-amber-500" />
        <StatsCard icon={Users} label="Active Subscriptions" value={summary?.activeSubscriptions.toLocaleString() ?? '—'}
          description={summary ? `${summary.newSubscriptions} new this period` : undefined} descriptionClassName="text-emerald-500"
          iconClassName="bg-violet-500/10 text-violet-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Revenue Trend</CardTitle>
            <Select value={period} onValueChange={(v) => v && setPeriod(v as RevenuePeriod)}>
              <SelectTrigger size="sm" className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
                <YAxis tickLine={false} axisLine={false} width={52} tickMargin={8}
                  tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)} />
                <Tooltip content={<ChartTip money />} cursor={{ stroke: 'hsl(var(--border))' }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#fillRevenue)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex-1 [&>*]:h-full"><KpiCard icon={UserPlus} label="New Customers" value={summary?.newSubscriptions.toLocaleString() ?? '—'} change="" period="signed up this period" color="bg-emerald-500/10 text-emerald-500" /></div>
          <div className="flex-1 [&>*]:h-full"><KpiCard icon={RefreshCcw} label="Churn Rate" value={summary ? `${summary.churnRate}%` : '—'} change="" period="of active subs" color="bg-red-500/10 text-red-500" /></div>
          <div className="flex-1 [&>*]:h-full"><KpiCard icon={TrendingUp} label="Avg. Revenue / User" value={summary ? `$${summary.avgOrderValue.toFixed(2)}` : '—'} change="" period="per paid invoice" color="bg-blue-500/10 text-blue-500" /></div>
          <div className="flex-1 [&>*]:h-full"><KpiCard icon={DollarSign} label="Net Profit" value={summary ? fmtMoney(summary.netProfit) : '—'} change="" period="revenue minus losses" color="bg-emerald-500/10 text-emerald-500" /></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Revenue share by plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.planRevenue.length ? (
              data.planRevenue.map((p) => (
                <div key={p.plan} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-sm capitalize text-muted-foreground">{p.plan}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(p.revenue / maxPlanRevenue) * 100}%` }} />
                  </div>
                  <span className="w-16 text-right text-sm font-medium tabular-nums">${p.revenue.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No plan revenue yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>Share by conversation volume per channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelMix.length ? (
              channelMix.map((c) => (
                <div key={c.channel} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-sm capitalize text-muted-foreground">{channelLabel(c.channel)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-medium tabular-nums">{c.pct}%</span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No channel data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest paid invoices in this period</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search customers, plans..." className="h-8 w-56 pl-8" />
            </div>
            <Button variant="outline" size="sm" onClick={exportInvoicesCsv}>
              <Download className="size-3.5" />
              Export
            </Button>
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
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">No payments found</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="odd:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Active customers over time</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={growthConfig} className="h-[200px] w-full">
              <AreaChart data={growthData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="fillCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-customers)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-customers)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: 'hsl(var(--border))' }} />
                <Area type="monotone" dataKey="customers" stroke="var(--color-customers)" fill="url(#fillCustomers)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Growth</CardTitle>
            <CardDescription>New subscriptions per period</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={subsConfig} className="h-[200px] w-full">
              <BarChart data={subsData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="subscriptions" fill="var(--color-subscriptions)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
