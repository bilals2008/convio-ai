import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import {
  UsersIcon, ShieldCheck, UserPlus, UserX, BadgeCheck, CreditCard,
  MoreHorizontal, Pencil, Ban, CheckCircle2, KeyRound, Eye, LogOut, Trash2,
  Download, CalendarIcon, Mail, FilterX, Loader2, SlidersHorizontal,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { UserAvatar } from '@/components/admin/user-avatar'
import { EmptyState } from '@/components/admin/empty-state'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAdminStats, useAdminUsers, useAdminUserAction, useAdminBulkUsers, useAdminUpdateUser } from '@/admin/hooks/use-admin'
import { ActionLinkDialog } from '@/components/admin/action-link-dialog'
import { UserStatusBadge } from '@/components/admin/user-verification'
import type { AdminActionLink, AdminUser } from '@/admin/services/admin-api'
import { cn, formatRelativeTime } from '@/lib/utils'

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-500/10 text-blue-500',
  enterprise: 'bg-violet-500/10 text-violet-500',
}

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function DateFilterPopover({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) {
  return (
    <div className="w-full sm:w-32">
      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" data-empty={!value} className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground" />
          }
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          {value ? value.toLocaleDateString() : <span>Any</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  const val = value || 'all'
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-muted-foreground">{label}</label>
      <Select value={val} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {[{ value: 'all', label: 'All' }, ...options].map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')
  const [orgId, setOrgId] = useState('')
  const [verified, setVerified] = useState('')
  const [createdFrom, setCreatedFrom] = useState<Date>()
  const [createdTo, setCreatedTo] = useState<Date>()
  const [activeFrom, setActiveFrom] = useState<Date>()
  const [activeTo, setActiveTo] = useState<Date>()
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState('')
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [linkResult, setLinkResult] = useState<{ title: string; description: string; link: string } | null>(null)

  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data, isLoading } = useAdminUsers({
    cursor,
    search: search || undefined,
    status: status || undefined,
    plan: plan || undefined,
    orgId: orgId || undefined,
    verified: verified || undefined,
    createdFrom: createdFrom?.toISOString(),
    createdTo: createdTo?.toISOString(),
    activeFrom: activeFrom?.toISOString(),
    activeTo: activeTo?.toISOString(),
  })

  const rows = data?.data || []
  const orgOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of rows) for (const o of u.organizations) map.set(o.id, o.name)
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [rows])

  const action = useAdminUserAction()
  const bulk = useAdminBulkUsers()
  const updateUser = useAdminUpdateUser()

  function resetFilters() {
    setSearch(''); setStatus(''); setPlan(''); setOrgId(''); setVerified('')
    setCreatedFrom(undefined); setCreatedTo(undefined); setActiveFrom(undefined); setActiveTo(undefined)
    setCursor(undefined); setCursors([])
  }

  const hasFilters = search || status || plan || orgId || verified || createdFrom || createdTo || activeFrom || activeTo
  const activeFilterCount = [status, plan, orgId, verified].filter(Boolean).length
    + [createdFrom, createdTo, activeFrom, activeTo].filter(Boolean).length

  const doAction = async (type: 'suspend' | 'activate' | 'verify' | 'reset' | 'impersonate' | 'logout' | 'delete', user: AdminUser) => {
    try {
      const res = await action.mutateAsync({ type, id: user.id })
      if (type === 'reset' || type === 'impersonate') {
        const link = (res as { data: { data: AdminActionLink } }).data.data
        const linkValue = (link.link || link.actionLink) ?? ''
        setLinkResult(type === 'impersonate'
          ? { title: 'Impersonate user', description: 'Open this link in a private window to access the account. Copy it before closing.', link: linkValue }
          : { title: 'Password reset', description: `A recovery link was generated for ${user.email}. Forward it to the user.`, link: linkValue })
      } else {
        const messages: Record<string, string> = {
          suspend: `${user.name || user.email} suspended`,
          activate: `${user.name || user.email} activated`,
          verify: `${user.name || user.email} email verified`,
          logout: `All sessions revoked for ${user.name || user.email}`,
          delete: `${user.name || user.email} deleted`,
        }
        toast.success(messages[type])
      }
      setSelected((s) => { const next = new Set(s); next.delete(user.id); return next })
    } catch (err) {
      toast.error((err as { friendlyMessage?: string }).friendlyMessage || 'Action failed')
    }
  }

  const doBulk = async (type: 'suspend' | 'activate' | 'verify' | 'delete') => {
    const ids = [...selected]
    try {
      const res = await bulk.mutateAsync({ ids, action: type })
      const failed = res.data.data.failed
      if (failed.length > 0) toast.warning(`Processed ${res.data.data.processed} users, ${failed.length} failed`)
      else toast.success(`Bulk ${type} applied to ${ids.length} users`)
      setSelected(new Set())
    } catch (err) {
      toast.error((err as { friendlyMessage?: string }).friendlyMessage || 'Bulk action failed')
    }
  }

  const exportCsv = () => {
    if (rows.length === 0) return
    const header = ['id', 'name', 'email', 'status', 'verified', 'plan', 'organizations', 'agents', 'conversations', 'messages', 'tokens_used', 'last_active', 'joined']
    const lines = rows.map((u) => [
      u.id, u.name || '', u.email, u.status, u.emailVerified, u.plan,
      u.organizations.map((o) => o.name).join('|'),
      u.agentCount, u.conversationCount, u.messageCount, u.tokensUsed,
      u.lastActive || '', u.createdAt,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
          onCheckedChange={(checked) => {
            setSelected((prev) => {
              const next = new Set(prev)
              for (const r of rows) {
                if (checked) next.add(r.id)
                else next.delete(r.id)
              }
              return next
            })
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={(checked) => {
            setSelected((prev) => {
              const next = new Set(prev)
              if (checked) next.add(row.original.id)
              else next.delete(row.original.id)
              return next
            })
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => <UserAvatar name={row.original.name} email={row.original.email} avatar={row.original.avatar} size="sm" />,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'plan',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('border-transparent capitalize', PLAN_COLORS[row.original.plan] || 'bg-muted text-muted-foreground')}>
          {row.original.plan}
        </Badge>
      ),
    },
    {
      accessorKey: 'orgCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Orgs" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.orgCount}</span>,
    },
    {
      accessorKey: 'agentCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agents" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.agentCount}</span>,
    },
    {
      accessorKey: 'conversationCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chats" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.conversationCount}</span>,
    },
    {
      accessorKey: 'tokensUsed',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tokens" />,
      cell: ({ row }) => <span className="tabular-nums">{compact(row.original.tokensUsed)}</span>,
    },
    {
      accessorKey: 'lastActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Active" />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastActive ? formatRelativeTime(row.original.lastActive) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${row.original.id}`) }}>
              <Eye className="size-3.5" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditing(row.original); setEditName(row.original.name || '') }}>
              <Pencil className="size-3.5" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status !== 'suspended' ? (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('suspend', row.original) }}>
                <Ban className="size-3.5" /> Suspend User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('activate', row.original) }}>
                <CheckCircle2 className="size-3.5" /> Activate User
              </DropdownMenuItem>
            )}
            {!row.original.emailVerified && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('verify', row.original) }}>
                <Mail className="size-3.5" /> Verify Email
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('reset', row.original) }}>
              <KeyRound className="size-3.5" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('impersonate', row.original) }}>
              <Eye className="size-3.5" /> Impersonate User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); doAction('logout', row.original) }}>
              <LogOut className="size-3.5" /> Force Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); setDeleting(row.original) }}>
              <Trash2 className="size-3.5" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [rows, selected, navigate, action])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const busy = action.isPending || bulk.isPending

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage, monitor and troubleshoot every platform user."
        actions={
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search users..." />
          </div>
        }
      />

      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-3">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)
          : (
            <>
              {([
                { icon: UsersIcon, label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'bg-primary/10 text-primary' },
                { icon: ShieldCheck, label: 'Active Users', value: stats?.activeUsers ?? 0, color: 'bg-emerald-500/10 text-emerald-500' },
                { icon: UserPlus, label: 'New (30d)', value: stats?.newUsers30d ?? 0, color: 'bg-blue-500/10 text-blue-500' },
                { icon: UserX, label: 'Suspended', value: stats?.suspendedUsers ?? 0, color: 'bg-destructive/10 text-destructive' },
                { icon: BadgeCheck, label: 'Verified', value: stats?.verifiedUsers ?? 0, color: 'bg-cyan-500/10 text-cyan-500' },
                { icon: CreditCard, label: 'Paying', value: stats?.payingUsers ?? 0, color: 'bg-amber-500/10 text-amber-500' },
              ] as const).map((m) => (
                <div
                  key={m.label}
                  className="group flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border hover:shadow-sm"
                >
                  <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
                    <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-muted-foreground truncate">{m.label}</span>
                    <span className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-foreground">{m.value.toLocaleString()}</span>
                  </div>
                  <div className={cn('flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105', m.color)}>
                    <m.icon className="size-3.5 sm:size-4" />
                  </div>
                </div>
              ))}
            </>
          )}
      </div>

      <div className="mt-6">
        <UserGrowthChart />
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2">
          <span className="text-sm font-medium">{rows.length} users</span>
          <div className="ml-auto flex items-center gap-1">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <FilterX className="size-3.5" /> Reset
              </Button>
            )}
            <Popover>
              <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                <SlidersHorizontal className="size-3.5" /> Filters
                {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1 px-1.5">{activeFilterCount}</Badge>}
              </PopoverTrigger>
              <PopoverContent className="w-[340px]" align="end">
                <div className="grid grid-cols-2 gap-3">
                  <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v); setCursor(undefined) }} options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
                  <FilterSelect label="Plan" value={plan} onChange={(v) => { setPlan(v); setCursor(undefined) }} options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' }]} />
                  <FilterSelect label="Verified" value={verified} onChange={(v) => { setVerified(v); setCursor(undefined) }} options={[{ value: 'true', label: 'Verified' }, { value: 'false', label: 'Unverified' }]} />
                  <FilterSelect label="Organization" value={orgId} onChange={(v) => { setOrgId(v); setCursor(undefined) }} options={orgOptions.map(([id, name]) => ({ value: id, label: name }))} />
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2">
                  <DateFilterPopover label="Joined from" value={createdFrom} onChange={(d) => { setCreatedFrom(d); setCursor(undefined) }} />
                  <DateFilterPopover label="Joined to" value={createdTo} onChange={(d) => { setCreatedTo(d); setCursor(undefined) }} />
                  <DateFilterPopover label="Active from" value={activeFrom} onChange={(d) => { setActiveFrom(d); setCursor(undefined) }} />
                  <DateFilterPopover label="Active to" value={activeTo} onChange={(d) => { setActiveTo(d); setCursor(undefined) }} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => doBulk('suspend')} disabled={busy}><Ban className="size-3.5" /> Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => doBulk('activate')} disabled={busy}><CheckCircle2 className="size-3.5" /> Activate</Button>
            <Button size="sm" variant="outline" onClick={() => doBulk('verify')} disabled={busy}><Mail className="size-3.5" /> Verify</Button>
            <Button size="sm" variant="destructive" onClick={() => doBulk('delete')} disabled={busy}><Trash2 className="size-3.5" /> Delete</Button>
            <Button size="sm" variant="ghost" onClick={exportCsv} disabled={busy}><Download className="size-3.5" /> Export CSV</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-8">
                    <EmptyState icon={UsersIcon} title="No users found" />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer odd:bg-muted/30 data-[selected]:bg-muted"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('[data-slot="checkbox"], button, a, input, select, textarea')) return
                      navigate(`/admin/users/${row.original.id}`)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{rows.length} user{rows.length !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={() => { const prev = cursors.pop(); setCursor(prev); setCursors([...cursors]) }}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.nextCursor} onClick={() => { setCursors([...cursors, cursor!]); setCursor(data!.nextCursor!) }}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update display name. Email is managed by auth and cannot be changed here.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="User name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={editing?.email || ''} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              disabled={updateUser.isPending}
              onClick={async () => {
                if (!editing) return
                try {
                  await updateUser.mutateAsync({ id: editing.id, data: { name: editName || null } })
                  toast.success('User updated')
                  setEditing(null)
                } catch (err) {
                  toast.error((err as { friendlyMessage?: string }).friendlyMessage || 'Update failed')
                }
              }}
            >
              {updateUser.isPending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleting?.name || deleting?.email} — auth account, profile, and all owned organizations
              with their agents, knowledge bases, chats and billing data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return
                setDeleting(null)
                await doAction('delete', deleting)
              }}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {linkResult && <ActionLinkDialog {...linkResult} onClose={() => setLinkResult(null)} />}
    </div>
  )
}
