import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Receipt,
} from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn, formatDate } from '@/lib/utils'

export interface Invoice {
  id: string
  subscriptionId: string | null
  providerInvoiceId: string
  invoiceNumber: string | null
  status: string
  total: number
  currency: string
  invoiceUrl: string | null
  paidAt: string | null
  billingReason: string | null
  createdAt: string
}

interface InvoiceTableProps {
  invoices: Invoice[]
  search?: string
}

type SortableStatus = 'paid' | 'pending' | 'refunded' | 'void'

const statusBadgeVariant: Record<SortableStatus, 'processed' | 'pending' | 'destructive' | 'archived'> = {
  paid: 'processed',
  pending: 'pending',
  refunded: 'destructive',
  void: 'archived',
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

function formatAmount(total: number, currency: string): string {
  const code = (currency || 'USD').toUpperCase()
  const dollars = total / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars)
  } catch {
    return `$${dollars.toFixed(2)}`
  }
}

function formatReason(reason: string | null): string {
  if (!reason) return '—'
  if (reason === 'subscription') return 'Subscription'
  if (reason === 'initial') return 'Initial charge'
  return reason.charAt(0).toUpperCase() + reason.slice(1)
}

export function InvoiceTable({ invoices, search = '' }: InvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const showPagination = invoices.length > 10

  const columns: ColumnDef<Invoice, unknown>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => {
        const num = row.original.invoiceNumber || row.original.providerInvoiceId
        const display = num.length > 12 ? `${num.slice(0, 8)}…` : num
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate font-mono">{display}</p>
              <p className="text-[11px] text-muted-foreground truncate">{formatReason(row.original.billingReason)}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'date',
      accessorFn: (row) => new Date(row.paidAt || row.createdAt).getTime(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDate(row.original.paidAt || row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {formatAmount(row.original.total, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status as SortableStatus
        const variant = statusBadgeVariant[status] ?? 'archived'
        return (
          <Badge variant={variant} className="text-xs font-medium capitalize">
            {row.original.status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }) => {
        const url = row.original.invoiceUrl
        if (!url) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Receipt className="size-3" />
              No PDF
            </span>
          )
        }
        return (
          <div className="flex items-center justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Download invoice"
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                      <Download className="size-3.5 text-muted-foreground" />
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Download PDF
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting, pagination, globalFilter: search },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(invoices.length / 10),
  })

  return (
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
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-4 py-3',
                      cell.column.id === 'actions' && 'w-24 text-right'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No invoices yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {invoices.length} invoices
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {table.getPageOptions().map((page) => (
              <button
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
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
