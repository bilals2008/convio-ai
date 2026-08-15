import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@/lib/table'
import { ArrowUpDown, ArrowDown, ArrowUp, Monitor, Smartphone, Tablet, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLoginActivity, type LoginActivityItem } from '@/lib/hooks/use-login-activity'

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ` at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

function getDeviceIcon(device: string) {
  switch (device) {
    case 'Mobile':
      return <Smartphone className="size-3.5" />
    case 'Tablet':
      return <Tablet className="size-3.5" />
    default:
      return <Monitor className="size-3.5" />
  }
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
        type="button"
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

const statusVariantMap: Record<string, 'active' | 'failed' | 'secondary'> = {
  success: 'active',
  failed: 'failed',
  suspicious: 'secondary',
}

export function LoginActivityTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const { data: activities = [], isError } = useLoginActivity()
  const showPagination = activities.length > 10

  const columns = useMemo<ColumnDef<LoginActivityItem, unknown>[]>(() => [
    {
      accessorKey: 'device',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted shrink-0">
            {getDeviceIcon(row.original.device)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium capitalize">{row.original.os ?? 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{row.original.browser ?? 'Unknown'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{row.original.location ?? 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">{row.original.ipAddress}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatTime(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={statusVariantMap[row.original.status] || 'secondary'} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
  ], [])

  const table = useReactTable({
    data: activities,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Login Activity</CardTitle>
        <CardDescription>Your recent sign-in sessions across devices</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Could not load login activity.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-b border-border bg-muted/30"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide',
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
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
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
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        No login activity found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {showPagination && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {table.getRowModel().rows.length} of {activities.length} sessions
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {table.getPageOptions().map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => table.setPageIndex(page)}
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded-md border border-border bg-transparent text-sm font-medium transition-colors hover:bg-muted',
                        table.getState().pagination.pageIndex === page
                          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'text-muted-foreground'
                      )}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
