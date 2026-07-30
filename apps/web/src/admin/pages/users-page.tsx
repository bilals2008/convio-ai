import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { UserAvatar } from '@/components/admin/user-avatar'
import { EmptyState } from '@/components/admin/empty-state'
import { StatusBadge } from '@/components/admin/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon } from 'lucide-react'
import { useAdminUsers } from '@/admin/hooks/use-admin'
import type { AdminUser } from '@/admin/services/admin-api'

function UserRow({ user }: { user: AdminUser }) {
  const navigate = useNavigate()
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => navigate(`/admin/users/${user.id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/users/${user.id}`)}
    >
      <TableCell>
        <UserAvatar name={user.name} email={user.email} avatar={user.avatar} />
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <StatusBadge status={user.orgCount > 0 ? 'active' : 'inactive'} />
      </TableCell>
      <TableCell className="text-muted-foreground">{user.orgCount}</TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  )
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])

  const { data, isLoading } = useAdminUsers({ cursor, search: search || undefined })

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
        title="Users"
        description="All platform users across organizations."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search users..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orgs</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <EmptyState icon={UsersIcon} title="No users found" description="No users match your search." />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {data?.data.length ?? 0} user{data?.data.length !== 1 ? 's' : ''}
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
