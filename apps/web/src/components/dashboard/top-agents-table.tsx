import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Bot, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analytics as analyticsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'
import { formatResponseTime } from '@/lib/analytics'

interface Agent {
  id: string
  name: string
  status: string
  totalConversations?: number
  successRate?: number
  avgResponseTime?: number
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-1.5 -ml-1.5 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-1 size-3.5" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-1 size-3.5" />
        ) : (
          <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}

export function TopAgentsTable() {
  const { orgId } = useOrg()
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: topAgentsData, isLoading } = useQuery({
    queryKey: ['top-agents', orgId],
    queryFn: async () => {
      const res = await analyticsApi.topAgents(orgId!)
      return res.data.data
    },
    enabled: !!orgId,
  })

  const agents = useMemo(() => {
    return (topAgentsData || []).map((item: Record<string, unknown>) => ({
      id: item.agentId as string,
      name: item.agentName as string,
      status: 'active',
      totalConversations: (item.totalConversations as number) || 0,
      successRate: (item.successRate as number) ?? 95,
      avgResponseTime: (item.avgResponseTime as number) || 0,
    }))
  }, [topAgentsData])

  const columns = useMemo<ColumnDef<Agent, unknown>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <Bot className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{row.original.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{row.original.status}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalConversations',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Conversations" />,
      cell: ({ row }) => (
        <span className="text-sm font-medium">{(row.original.totalConversations || 0).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'successRate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Success Rate" />,
      cell: ({ row }) => {
        const rate = row.original.successRate || 0
        return (
          <span className={cn(
            'text-sm font-medium',
            rate >= 95 ? 'text-emerald-500' : rate >= 80 ? 'text-amber-500' : 'text-red-500'
          )}>
            {rate}%
          </span>
        )
      },
    },
    {
      accessorKey: 'avgResponseTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Avg Response" />,
      cell: ({ row }) => {
        const time = row.original.avgResponseTime || 0
        return (
          <span className={cn(
            'text-sm font-medium',
            time < 1 ? 'text-emerald-500' : time < 2 ? 'text-amber-500' : 'text-red-500'
          )}>
            {formatResponseTime(time)}
          </span>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: agents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Top Performing Agents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Top Performing Agents</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-muted-foreground font-medium h-11 px-4 text-sm',
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                    index % 2 === 1 && 'bg-muted/20'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <Bot className="size-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No agents yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Create an agent to see its performance here.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
