import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@/lib/table'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { EmptyState } from '@/components/admin/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAdminGrants, useAdminGrantActions } from '@/admin/hooks/use-admin'
import type { AdminGrant } from '@/admin/services/admin-api'

export default function AdminAccessPage() {
  const { data: grants, isLoading } = useAdminGrants()
  const grantActions = useAdminGrantActions()
  const [email, setEmail] = useState('')
  const [hours, setHours] = useState(24)

  const active = useMemo(() => (grants || []).filter((g) => new Date(g.expiresAt) > new Date()), [grants])

  const columns = useMemo<ColumnDef<AdminGrant>[]>(() => [
    { accessorKey: 'email', header: 'Email' },
    { id: 'grantedBy', header: 'Granted by', cell: ({ row }) => row.original.grantedBy?.name || row.original.grantedBy?.email || '—' },
    { accessorKey: 'expiresAt', header: 'Expires',
      cell: ({ row }) => {
        const exp = new Date(row.original.expiresAt)
        return <span className={exp < new Date() ? 'text-muted-foreground' : ''}>{exp.toLocaleString()}</span>
      } },
    { id: 'status', header: 'Status', cell: ({ row }) =>
      new Date(row.original.expiresAt) > new Date()
        ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Active</Badge>
        : <Badge variant="secondary" className="bg-muted text-muted-foreground">Expired</Badge> },
    { id: 'actions', header: null,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-500"
            disabled={grantActions.isPending}
            onClick={async () => { await grantActions.mutateAsync({ action: 'delete', id: row.original.id }); toast.success('Access revoked') }}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) },
  ], [grantActions])

  const table = useReactTable({ data: grants || [], columns, getCoreRowModel: getCoreRowModel() })

  const handleCreate = async () => {
    if (!email.trim()) { toast.error('Enter an email'); return }
    try {
      await grantActions.mutateAsync({ action: 'create', data: { email: email.trim(), hours } })
      toast.success('Temporary admin access granted')
      setEmail('')
    } catch {
      toast.error('Failed to grant access')
    }
  }

  return (
    <div>
      <PageHeader
        title="Admin Access"
        description="Grant temporary admin access to the panel. Access auto-revokes after the duration ends."
      />
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Hours</Label>
            <Input type="number" min={1} max={720} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <Button size="sm" onClick={handleCreate} disabled={grantActions.isPending}>
              <Plus className="size-4 mr-1" /> Grant Access
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          <Clock className="mr-1 inline size-3.5" />
          Access is revoked automatically once the time elapses. New grants require this email to have a Convio account.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/60 p-3 text-sm font-medium">{active.length} active grant{active.length !== 1 ? 's' : ''}</div>
        {isLoading ? (
          <Skeleton className="m-4 h-32" />
        ) : (grants?.length || 0) === 0 ? (
          <div className="p-6"><EmptyState icon={Clock} title="No admin grants" description="Grant temporary access using the form above." /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => <TableHead key={h.id} className={h.column.columnDef.header === null ? 'text-right' : ''}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="odd:bg-muted/30">
                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}