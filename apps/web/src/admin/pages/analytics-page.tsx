import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@/lib/table'
import { MessageSquare, CheckCircle, Building2, Bot, Users, BarChart3, Globe, TrendingUp, AlertCircle } from 'lucide-react'
import { PageContainer, Section } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { ChannelPerformanceChart } from '@/components/analytics/channel-performance-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/admin/status-badge'
import { useAdminAnalytics } from '@/admin/hooks/use-admin'

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(271, 81%, 56%)', 'hsl(25, 95%, 53%)', 'hsl(340, 82%, 52%)', 'hsl(200, 98%, 39%)', 'hsl(45, 93%, 47%)']

const ranges = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

const signupConfig = {
  signups: { label: 'New Orgs', color: 'hsl(142, 71%, 45%)' },
} satisfies ChartConfig

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, isFetching, isError } = useAdminAnalytics(days)

  const chartData = (data?.dailyBreakdown || []).map((d) => ({
    date: d.date,
    conversations: d.totalConversations,
    messages: d.totalMessages,
  }))

  const [orgSorting, setOrgSorting] = useState<SortingState>([])
  const orgColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
      cell: ({ row }) => <StatusBadge status={row.original.plan || 'free'} />,
    },
    {
      accessorKey: 'conversationCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Conversations" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.conversationCount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ], [])
  const orgTable = useReactTable({
    data: data?.topOrgs || [],
    columns: orgColumns as ColumnDef<Record<string, unknown>>[],
    state: { sorting: orgSorting },
    onSortingChange: setOrgSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) return <PageContainer>
    <PageHeader title="Platform Analytics" description="Aggregated metrics across all organizations." />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
    </div>
  </PageContainer>

  if (isError) return <PageContainer>
    <PageHeader title="Platform Analytics" description="Aggregated metrics across all organizations." />
    <EmptyState icon={AlertCircle} title="Failed to load analytics" description="Something went wrong. Please try again." />
  </PageContainer>

  return (
    <PageContainer>
      <PageHeader
        title="Platform Analytics"
        description="Aggregated metrics across all organizations."
        action={
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  days === r.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard icon={Building2} label="Total Organizations" value={data?.totalOrgs.toLocaleString() || '0'} iconClassName="bg-violet-500/10 text-violet-500" loading={isFetching} />
        <StatsCard icon={Bot} label="Total Agents" value={data?.totalAgents.toLocaleString() || '0'} iconClassName="bg-blue-500/10 text-blue-500" loading={isFetching} />
        <StatsCard icon={MessageSquare} label="Conversations" value={data?.totalConversations.toLocaleString() || '0'} description={`${data?.conversationsChange ?? 0}% from prev`} iconClassName="bg-emerald-500/10 text-emerald-500" loading={isFetching} />
        <StatsCard icon={CheckCircle} label="Success Rate" value={`${data?.successRate ?? 0}%`} descriptionClassName={data && data.successRate >= 80 ? 'text-emerald-500' : data?.successRate >= 60 ? 'text-amber-500' : 'text-red-500'} iconClassName="bg-amber-500/10 text-amber-500" loading={isFetching} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={chartData} loading={isFetching} />
        </div>
        <div>
          <ChannelPerformanceChart data={data?.channelBreakdown} loading={isFetching} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Organization Signups</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={signupConfig} className="h-[200px] w-full">
              <BarChart data={data?.orgSignups || []} margin={{ top: 13, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="var(--color-signups)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-4">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Plan Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {(!data?.planDistribution || data.planDistribution.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 mb-3">
                  <Globe className="size-5 text-violet-500" />
                </div>
                <p className="text-sm font-medium text-foreground">No plan data</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data!.planDistribution} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                        {data!.planDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  {data!.planDistribution.map((d, i) => (
                    <div key={d.plan} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="w-16 capitalize text-muted-foreground">{d.plan}</span>
                      <span className="w-8 text-right font-medium tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Section title="Top Organizations" description="By conversation volume">
        <Card>
          <Table>
            <TableHeader>
              {orgTable.getHeaderGroups().map((hg) => (
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
              {orgTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Section>
    </PageContainer>
  )
}
