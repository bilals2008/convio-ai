import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, ShieldAlert } from 'lucide-react'
import { useAuditLogs } from '@/admin/hooks/use-admin'

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 25

  const { data, isLoading } = useAuditLogs({
    search: search || undefined,
    limit,
    offset,
  })

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Platform-wide audit trail of all actions."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setOffset(0) }} placeholder="Search logs..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8">
                  <EmptyState icon={ShieldAlert} title="No audit logs found" description="No logs match your filters." />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{log.action}</code>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{log.entityType}</div>
                    <div className="text-xs text-muted-foreground font-mono">{log.entityId?.slice(0, 12)}…</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.actor ? log.actor.name || log.actor.email : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {data?.total ?? 0} total log{data?.total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data || offset + limit >= data.total} onClick={() => setOffset(offset + limit)}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
