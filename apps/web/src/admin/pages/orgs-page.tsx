import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { StatusBadge } from '@/components/admin/status-badge'
import { EmptyState } from '@/components/admin/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, Building2 } from 'lucide-react'
import { useAdminOrgs } from '@/admin/hooks/use-admin'
import type { AdminOrg } from '@/admin/services/admin-api'

function OrgRow({ org }: { org: AdminOrg }) {
  const navigate = useNavigate()
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => navigate(`/admin/organizations/${org.id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/organizations/${org.id}`)}
    >
      <TableCell className="font-medium">{org.name}</TableCell>
      <TableCell className="text-muted-foreground">{org.slug}</TableCell>
      <TableCell>
        <StatusBadge status={org.plan || 'free'} />
      </TableCell>
      <TableCell className="text-muted-foreground">{org.memberCount}</TableCell>
      <TableCell className="text-muted-foreground">{org.agentCount}</TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {new Date(org.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  )
}

export default function AdminOrgsPage() {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])

  const { data, isLoading } = useAdminOrgs({ cursor, search: search || undefined })

  const handleNext = useCallback(() => {
    if (data?.nextCursor) {
      setCursors((prev) => [...prev, cursor!])
      setCursor(data.nextCursor)
    }
  }, [data, cursor])

  const handlePrev = useCallback(() => {
    const prev = cursors[cursors.length - 1]
    setCursors((prevC) => prevC.slice(0, -1))
    setCursor(prev)
  }, [cursors])

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="All organizations on the platform."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search organizations..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8">
                  <EmptyState icon={Building2} title="No organizations found" description="No organizations match your search." />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((org) => <OrgRow key={org.id} org={org} />)
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {data?.data.length ?? 0} organization{data?.data.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={handlePrev}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.nextCursor} onClick={handleNext}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
