import { useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { ThumbsUp, ThumbsDown, FileText, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react'
import { PageContainer, Section } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { EmptyState } from '@/components/shared/empty-state'
import { useAdminDocFeedback } from '@/admin/hooks/use-admin'
import { cn } from '@/lib/utils'

export default function AdminDocsFeedbackPage() {
  const { data, isLoading, isError } = useAdminDocFeedback()

  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Docs Page" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">/{row.original.slug}</p>
          <p className="text-xs text-muted-foreground">{row.original.total} vote{row.original.total !== 1 ? 's' : ''}</p>
        </div>
      ),
    },
    {
      accessorKey: 'helpful',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Helpful" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-emerald-500 tabular-nums">
          <ThumbsUp className="size-3.5" /> {row.original.helpful}
        </span>
      ),
    },
    {
      accessorKey: 'notHelpful',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Not Helpful" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-red-500 tabular-nums">
          <ThumbsDown className="size-3.5" /> {row.original.notHelpful}
        </span>
      ),
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Help Rate" />,
      cell: ({ row }) => {
        const total = row.original.helpful + row.original.notHelpful
        const rate = total > 0 ? Math.round((row.original.helpful / total) * 100) : 0
        return (
          <span className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
            rate >= 70 ? 'bg-emerald-500/10 text-emerald-500' : rate >= 40 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
          )}>
            {rate}%
          </span>
        )
      },
    },
  ], [])
  const table = useReactTable({
    data: data?.perPage || [],
    columns: columns as ColumnDef<Record<string, unknown>>[],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) return <PageContainer>
    <PageHeader title="Docs Feedback" description="How helpful users find the documentation." />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
    </div>
  </PageContainer>

  if (isError || !data) return <PageContainer>
    <PageHeader title="Docs Feedback" description="How helpful users find the documentation." />
    <EmptyState icon={AlertCircle} title="Failed to load feedback" description="Something went wrong. Please try again." />
  </PageContainer>

  return (
    <PageContainer>
      <PageHeader
        title="Docs Feedback"
        description="Was this page helpful? votes across all documentation."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard icon={FileText} label="Total Votes" value={data.summary.totalVotes.toLocaleString()} iconClassName="bg-violet-500/10 text-violet-500" />
        <StatsCard icon={ThumbsUp} label="Helpful" value={data.summary.helpful.toLocaleString()} iconClassName="bg-emerald-500/10 text-emerald-500" />
        <StatsCard icon={ThumbsDown} label="Not Helpful" value={data.summary.notHelpful.toLocaleString()} iconClassName="bg-red-500/10 text-red-500" />
        <StatsCard icon={TrendingUp} label="Help Rate" value={`${data.summary.helpRate}%`} descriptionClassName={data.summary.helpRate >= 70 ? 'text-emerald-500' : data.summary.helpRate >= 40 ? 'text-amber-500' : 'text-red-500'} iconClassName="bg-blue-500/10 text-blue-500" />
      </div>

      <Section title="By Docs Page" description="Pages ranked by total votes">
        <Card>
          {data.perPage.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 mb-3">
                <FileText className="size-5 text-violet-500" />
              </div>
              <p className="text-sm font-medium text-foreground">No feedback yet</p>
              <p className="text-xs text-muted-foreground mt-1">Votes will appear here once users rate docs pages.</p>
            </div>
          ) : (
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Section>

      <Section title="Recent Feedback" description="Latest votes across the platform">
        <Card>
          <CardContent className="pt-6">
            {data.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 mb-3">
                  <MessageSquare className="size-5 text-violet-500" />
                </div>
                <p className="text-sm font-medium text-foreground">No recent feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recent.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <div className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full',
                      f.helpful ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    )}>
                      {f.helpful ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium text-foreground">{f.user.name || f.user.email}</span>
                        <span className="text-xs text-muted-foreground">· {f.organization.name}</span>
                        <span className="text-xs text-muted-foreground">· {new Date(f.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        /{f.slug}
                        {f.comment && <span className="text-foreground/70"> — “{f.comment}”</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Section>
    </PageContainer>
  )
}
