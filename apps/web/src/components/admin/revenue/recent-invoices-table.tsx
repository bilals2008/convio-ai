import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Receipt } from 'lucide-react'
import { formatCurrency } from './format'

interface RecentInvoice {
  id: string
  invoiceNumber: string | null
  status: string
  total: number
  currency: string
  paidAt: string
  plan: string
  organization: { id: string; name: string; slug: string } | null
}

interface RecentInvoicesTableProps {
  invoices: RecentInvoice[]
  loading?: boolean
}

export function RecentInvoicesTable({ invoices, loading }: RecentInvoicesTableProps) {
  return (
    <Card>
      <CardHeader className="border-b py-4">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Recent Paid Invoices</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Invoice</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="odd:bg-muted/30">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No paid invoices in this period
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="odd:bg-muted/30">
                  <TableCell>
                    <span className="font-mono text-sm">{inv.invoiceNumber || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{inv.organization?.name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 capitalize">
                      {inv.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(inv.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
