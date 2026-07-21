import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowDown, ArrowUp, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'
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

interface LoginActivity {
  id: string
  device: string
  browser: string
  os: string
  location: string
  ipAddress: string
  time: string
  status: 'success' | 'failed' | 'suspicious'
}

const mockActivity: LoginActivity[] = [
  {
    id: '1',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    location: 'Karachi, Pakistan',
    ipAddress: '103.247.12.45',
    time: 'Today at 10:32 AM',
    status: 'success',
  },
  {
    id: '2',
    device: 'Desktop',
    browser: 'Safari',
    os: 'macOS',
    location: 'Lahore, Pakistan',
    ipAddress: '103.247.12.45',
    time: 'Yesterday at 8:14 PM',
    status: 'success',
  },
  {
    id: '3',
    device: 'Mobile',
    browser: 'Chrome',
    os: 'Android',
    location: 'Islamabad, Pakistan',
    ipAddress: '103.247.12.45',
    time: '17 Jul, 2026 at 5:22 PM',
    status: 'success',
  },
  {
    id: '4',
    device: 'Desktop',
    browser: 'Firefox',
    os: 'Linux',
    location: 'Lahore, Pakistan',
    ipAddress: '103.247.12.99',
    time: '15 Jul, 2026 at 2:10 PM',
    status: 'success',
  },
  {
    id: '5',
    device: 'Mobile',
    browser: 'Safari',
    os: 'iOS',
    location: 'Karachi, Pakistan',
    ipAddress: '103.247.12.45',
    time: '14 Jul, 2026 at 9:45 AM',
    status: 'failed',
  },
]

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
  suspicious: 'pending',
}

export function LoginActivityTable() {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<LoginActivity, unknown>[] = [
    {
      accessorKey: 'device',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted shrink-0">
            {getDeviceIcon(row.original.device)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium capitalize">{row.original.os}</p>
            <p className="text-xs text-muted-foreground">{row.original.browser}</p>
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
          <span className="text-sm">{row.original.location}</span>
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
      accessorKey: 'time',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.time}</span>
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
  ]

  const table = useReactTable({
    data: mockActivity,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Login Activity</CardTitle>
          <CardDescription>Your recent sign-in sessions across devices</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {mockActivity.length} sessions
        </p>
      </CardContent>
    </Card>
  )
}
