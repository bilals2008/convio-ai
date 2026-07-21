import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Download,
  Check,
  Sparkles,
  DollarSign,
  Clock,
  Receipt,
  Calendar,
  MoreHorizontal,
  Plus,
  Eye,
} from 'lucide-react'
import { FileIcon } from '@/components/shared/file-icon'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Invoice {
  id: string
  date: string
  description: string
  status: 'paid' | 'pending' | 'cancelled'
  amount: number
}

const invoices: Invoice[] = [
  { id: 'INV-1024', date: 'Jul 12, 2025', description: 'Pro Business – Monthly Subscription', status: 'paid', amount: 240.00 },
  { id: 'INV-1023', date: 'Jun 12, 2025', description: 'Pro Business – Monthly Subscription', status: 'paid', amount: 240.00 },
  { id: 'INV-1022', date: 'May 12, 2025', description: 'Pro Business – Monthly Subscription', status: 'pending', amount: 240.00 },
  { id: 'INV-1021', date: 'Apr 12, 2025', description: 'Pro Business – Monthly Subscription', status: 'paid', amount: 240.00 },
]

const statusVariant: Record<string, 'processed' | 'pending' | 'canceled'> = {
  paid: 'processed',
  pending: 'pending',
  cancelled: 'canceled',
}

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Invoices"
        description="Manage your payments, invoices and subscription."
        action={
          <Button variant="outline" onClick={() => toast.info('Statement download coming soon')}>
            <Download className="size-3.5" />
            Download Statement
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI icon={DollarSign} label="Total Revenue" value="$12,450" iconBg="bg-emerald-500/10 text-emerald-500" change="+12%" />
        <KPI icon={Clock} label="Outstanding" value="$1,240" iconBg="bg-amber-500/10 text-amber-500" change="+8%" />
        <KPI icon={Receipt} label="Paid Invoices" value={62} iconBg="bg-blue-500/10 text-blue-500" />
        <KPI icon={Calendar} label="Next Billing" value="Aug 12" iconBg="bg-violet-500/10 text-violet-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlanCard />
        <PaymentMethodsCard />
      </div>

      <RecentInvoicesTable />
    </div>
  )
}

// ── KPI ─────────────────────────────────────────────────────────────────────
function KPI({ icon: Icon, label, value, iconBg, change }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconBg?: string
  change?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold leading-none tracking-tight text-foreground">{value}</p>
        </div>
        {change && (
          <span className="inline-flex items-center gap-0.5 shrink-0 text-xs font-medium text-emerald-500">
            ↑ {change}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Plan Card ───────────────────────────────────────────────────────────────
function PlanCard() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">Active</span>
      </div>

      <div className="flex items-start gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <svg className="size-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 20h10" />
            <path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold text-foreground">Pro Business</h4>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-foreground">$49</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {['Unlimited Invoices', 'Priority Support', 'Multi-user Access', 'Advanced Analytics'].map((f) => (
          <div key={f} className="flex items-center gap-2.5">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="size-3 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">{f}</span>
          </div>
        ))}
      </div>

      <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.info('Upgrade flow coming soon')}>
        <Sparkles className="size-4" />
        Upgrade Plan
      </Button>
    </div>
  )
}

// ── Payment Methods Card ────────────────────────────────────────────────────
function PaymentMethodsCard() {
  const methods = [
    { brand: 'mastercard', last4: '4242', exp: '12/28', isDefault: true },
    { brand: 'visa', last4: '8888', exp: '09/27', isDefault: false },
  ]

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h3 className="mb-6 text-sm font-medium text-muted-foreground">Payment Methods</h3>

      <div className="space-y-3">
        {methods.map((m) => (
          <div key={m.last4} className="flex items-center gap-4 rounded-lg border border-border/60 bg-background px-4 py-3">
            {m.brand === 'mastercard' ? (
              <div className="relative size-8 shrink-0">
                <div className="absolute left-1 top-1/2 size-4 -translate-y-1/2 rounded-full bg-red-400 opacity-80" />
                <div className="absolute right-1 top-1/2 size-4 -translate-y-1/2 rounded-full bg-amber-400 opacity-80" />
              </div>
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center">
                <span className="text-xs font-bold italic text-blue-600">VISA</span>
              </div>
            )}

            <div className="flex flex-1 items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-foreground">•••• {m.last4}</span>
              {m.isDefault && (
                <span className="inline-flex shrink-0 items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">Default</span>
              )}
            </div>

            <span className="shrink-0 text-xs text-muted-foreground">Exp {m.exp}</span>
            <button className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => toast.info('Add payment method coming soon')}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-500/40 bg-transparent py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500/5"
      >
        <Plus className="size-4" />
        Add New Payment Method
      </button>
    </div>
  )
}

// ── Recent Invoices Table ───────────────────────────────────────────────────
function RecentInvoicesTable() {
  const [data] = useState<Invoice[]>(invoices)

  const columns: ColumnDef<Invoice, unknown>[] = [
    {
      accessorKey: 'id',
      header: 'Invoice ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <FileIcon type="pdf" size={18} />
          <span className="text-sm font-medium font-mono text-foreground">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.date}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]} className="text-xs font-medium capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums text-foreground">${row.original.amount.toFixed(2)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toast.info(`Downloading ${row.original.id}`)}
          >
            <Download className="size-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toast.info(`Viewing ${row.original.id}`)}
          >
            <Eye className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-medium text-foreground">Recent Invoices</h3>
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          View All Invoices →
        </button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-b border-border">
              {hg.headers.map((h) => (
                <TableHead key={h.id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-10 px-5">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-5 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
