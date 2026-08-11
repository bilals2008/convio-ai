import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@/lib/table'
import {
  ArrowLeft, Building2, Bot, MessagesSquare, Mail, Globe, ShieldCheck,
  Pencil, Ban, CheckCircle2, KeyRound, Eye, LogOut, Trash2, CreditCard, Cpu, Loader2, Lock,
  ChevronLeftIcon, ChevronRightIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { RoleBadge } from '@/components/admin/role-badge'
import { StatCard } from '@/components/shared/stat-card'
import { UserStatusBadge, VerifiedBadge } from '@/components/admin/user-verification'
import { ActionLinkDialog } from '@/components/admin/action-link-dialog'
import { useAdminUser, useAdminUserConversations, useAdminUserAction, useAdminUpdateUser } from '@/admin/hooks/use-admin'
import type { AdminActionLink } from '@/admin/services/admin-api'
import { cn, formatRelativeTime } from '@/lib/utils'

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-500/10 text-blue-500',
  enterprise: 'bg-violet-500/10 text-violet-500',
}

const CHANNEL_LABELS: Record<string, string> = {
  web: 'Web', whatsapp: 'WhatsApp', telegram: 'Telegram', discord: 'Discord', slack: 'Slack', api: 'API',
}

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function SummaryTile({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-semibold leading-none tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useAdminUser(id)
  const convLimit = 10
  const [convCursor, setConvCursor] = useState<string | undefined>()
  const [convCursors, setConvCursors] = useState<string[]>([])
  const [convSorting, setConvSorting] = useState<SortingState>([])
  const { data: conversations, isLoading: conversationsLoading } = useAdminUserConversations(id, { limit: convLimit, cursor: convCursor })
  const action = useAdminUserAction()
  const updateUser = useAdminUpdateUser()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [linkResult, setLinkResult] = useState<{ title: string; description: string; link: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const doAction = async (type: 'suspend' | 'activate' | 'verify' | 'reset' | 'impersonate' | 'logout' | 'delete') => {
    try {
      const res = await action.mutateAsync({ type, id: user!.id })
      if (type === 'reset' || type === 'impersonate') {
        const link = (res as { data: { data: AdminActionLink } }).data.data
        const linkValue = (link.link || link.actionLink) ?? ''
        setLinkResult(type === 'impersonate'
          ? { title: 'Impersonate user', description: 'Open this link in a private window to access the account. Copy it before closing.', link: linkValue }
          : { title: 'Password reset', description: `A recovery link was generated for ${user.email}. Forward it to the user.`, link: linkValue })
      } else {
        const messages: Record<string, string> = {
          suspend: 'User suspended',
          activate: 'User activated',
          verify: 'Email verified',
          logout: 'All sessions revoked',
          delete: 'User deleted',
        }
        toast.success(messages[type])
      }
      if (type === 'delete') navigate('/admin/users')
    } catch (err) {
      toast.error((err as { friendlyMessage?: string }).friendlyMessage || 'Action failed')
    }
  }

  const bestPlan = (user?.organizations ?? []).reduce((best, o) => {
    if (!o.plan) return best
    const rank = { free: 0, pro: 1, enterprise: 2 } as Record<string, number>
    return (rank[o.plan] || 0) > (rank[best] || 0) ? o.plan : best
  }, 'free')

  const allInvoices = (user?.organizations ?? []).flatMap((o) =>
    o.invoices.map((i) => ({ ...i, org: o.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const convColumns = useMemo<ColumnDef<NonNullable<typeof conversations>['data'][number]>[]>(() => [
    { accessorKey: 'channel', header: ({ column }) => <DataTableColumnHeader column={column} title="Channel" />,
      cell: ({ row }) => <Badge variant="outline">{CHANNEL_LABELS[row.original.channel] || row.original.channel}</Badge> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status
        return <Badge variant="secondary" className={s === 'active' ? 'bg-emerald-500/10 text-emerald-500' : s === 'archived' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-500'}>{s}</Badge>
      } },
    { accessorKey: 'agent.name', header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      cell: ({ row }) => <span className="text-sm">{row.original.agent.name}</span> },
    { accessorKey: 'agent.organization.name', header: ({ column }) => <DataTableColumnHeader column={column} title="Org" />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.agent.organization.name}</span> },
    { accessorKey: 'messageCount', header: ({ column }) => <DataTableColumnHeader column={column} title="Messages" />,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.messageCount}</span> },
    { accessorKey: 'updatedAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelativeTime(row.original.updatedAt)}</span> },
  ], [])

  const convTable = useReactTable({
    data: conversations?.data || [],
    columns: convColumns,
    state: { sorting: convSorting },
    onSortingChange: setConvSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const agentColumns = useMemo<ColumnDef<NonNullable<typeof user>['agents'][number]>[]>(() => [
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.name}</span> },
    { accessorKey: 'model', header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.model}</span> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge> },
    { accessorKey: 'organization.name', header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <span className="text-xs">{row.original.organization.name}</span> },
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span> },
  ], [])

  const agentTable = useReactTable({
    data: user?.agents ?? [],
    columns: agentColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const totalLogins = (user?.recentLogins ?? []).length
  const uniqueIps = new Set((user?.recentLogins ?? []).map((l) => l.ipAddress).filter(Boolean)).size
  const uniqueDevices = new Set((user?.recentLogins ?? []).map((l) => l.device).filter(Boolean)).size
  const successLogins = (user?.recentLogins ?? []).filter((l) => l.status === 'success').length

  const loginColumns = useMemo<ColumnDef<NonNullable<typeof user>['recentLogins'][number]>[]>(() => [
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
      cell: ({ row }) => <span className="text-xs">{new Date(row.original.createdAt).toLocaleString()}</span> },
    { accessorKey: 'ipAddress', header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.ipAddress || 'Unknown'}</span> },
    { accessorKey: 'device', header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
      cell: ({ row }) => <span className="text-xs">{row.original.device || '—'}</span> },
    { id: 'details', header: 'Details',
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{[row.original.browser, row.original.os, row.original.location].filter(Boolean).join(' — ') || '—'}</span> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const s = row.original.status
        return <Badge variant="secondary" className={s === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>{s}</Badge>
      } },
  ], [])

  const loginTable = useReactTable({
    data: user?.recentLogins ?? [],
    columns: loginColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-36 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/users')}>Back to users</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="size-4 mr-1" /> Back to users
      </Button>

      <Card>
        <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <Avatar size="lg" className="mt-1 size-14">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-base bg-primary/10 text-primary font-semibold">
                {(user.name || user.email || '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{user.name || 'Unknown'}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <UserStatusBadge status={user.status} />
                <VerifiedBadge verified={user.emailVerified} />
                <Badge variant="outline" className={cn('border-transparent capitalize', PLAN_COLORS[bestPlan] || 'bg-muted text-muted-foreground')}>{bestPlan} plan</Badge>
              </div>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                <span aria-hidden>·</span>
                <span>Updated {new Date(user.updatedAt).toLocaleDateString()}</span>
                {user.usage.lastActive && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Last active {formatRelativeTime(user.usage.lastActive)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-1.5 lg:rounded-xl lg:border lg:border-border/60 lg:bg-muted/30 lg:p-1.5">
            <Button variant="ghost" size="sm" className="h-9 lg:h-8" onClick={() => { setEditing(true); setEditName(user.name || '') }}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            {user.status !== 'suspended' ? (
              <Button variant="ghost" size="sm" className="h-9 lg:h-8" onClick={() => doAction('suspend')}><Ban className="size-3.5" /> Suspend</Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-9 lg:h-8" onClick={() => doAction('activate')}><CheckCircle2 className="size-3.5" /> Activate</Button>
            )}
            <Button variant="ghost" size="sm" className="h-9 text-destructive hover:text-destructive lg:h-8" onClick={() => setConfirmDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <SummaryTile icon={Bot} label="Chats" value={user.usage.conversationCount} />
            <SummaryTile icon={MessagesSquare} label="Messages" value={user.usage.messageCount} />
            <SummaryTile icon={Cpu} label="Tokens" value={compact(user.usage.tokensUsed)} />
            <SummaryTile icon={Building2} label="Knowledge Bases" value={user.usage.knowledgeBaseCount} />
            <SummaryTile icon={Bot} label="Agents (orgs)" value={user.usage.agentCountInOrgs} />
            <SummaryTile icon={Globe} label="Channels" value={user.usage.channelBreakdown.length} />
          </div>
          {user.usage.channelBreakdown.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="size-4 text-muted-foreground" /> Channel Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-wrap gap-2">
                {user.usage.channelBreakdown.map((c) => (
                  <Badge key={c.channel} variant="outline">
                    {CHANNEL_LABELS[c.channel] || c.channel}
                    <span className="ml-1 text-muted-foreground tabular-nums">{c.count}</span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="organizations" className="mt-4">
          {user.organizations.length === 0 ? (
            <Card><CardContent className="p-5 text-xs text-muted-foreground">Not a member of any organization.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {user.organizations.map((org) => (
                <Card key={org.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{org.name} <span className="text-xs text-muted-foreground">· {org.slug}</span></p>
                        <div className="mt-1 flex items-center gap-2">
                          <RoleBadge role={org.role} />
                          <Badge variant="outline" className={cn('capitalize border-transparent', PLAN_COLORS[org.plan || 'free'] || 'bg-muted text-muted-foreground')}>{org.plan || 'free'}</Badge>
                          <span className="text-xs text-muted-foreground">Joined {new Date(org.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {org.subscription && (
                        <div className="text-right">
                          <p className="text-xs font-medium">{org.subscription.status}</p>
                          {org.subscription.renewsAt && <p className="text-[11px] text-muted-foreground">Renews {new Date(org.subscription.renewsAt).toLocaleDateString()}</p>}
                          {org.subscription.endsAt && <p className="text-[11px] text-muted-foreground">Ends {new Date(org.subscription.endsAt).toLocaleDateString()}</p>}
                        </div>
                      )}
                    </div>
                    {org.invoices.length > 0 && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Invoices ({org.invoices.length})</p>
                        <div className="space-y-1">
                          {org.invoices.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{inv.invoiceNumber || inv.id.slice(0, 8)} · {new Date(inv.createdAt).toLocaleDateString()}</span>
                              <span className="tabular-nums">{inv.currency} {inv.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="size-4 text-muted-foreground" /> Agents Created ({user.agents.length})
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {agentTable.getHeaderGroups().map((hg) => (
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
                  {user.agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={agentColumns.length} className="py-8 text-center text-xs text-muted-foreground">
                        No agents created by this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agentTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="odd:bg-muted/30">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessagesSquare className="size-4 text-muted-foreground" /> Recent Conversations ({user.usage.conversationCount} total)
              </CardTitle>
            </CardHeader>
            <div className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
              {conversations?.data.length ?? 0} shown
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {convTable.getHeaderGroups().map((hg) => (
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
                  {conversationsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="odd:bg-muted/30">
                        {convColumns.map((c) => <TableCell key={c.id as string}><Skeleton className="h-4 w-16" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : (conversations?.data.length || 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={convColumns.length} className="py-8 text-center text-xs text-muted-foreground">
                        No conversations found for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    convTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="odd:bg-muted/30">
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
              <p className="text-xs text-muted-foreground">{conversations?.data.length ?? 0} conversation{conversations?.data.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={convCursors.length === 0} onClick={() => { const prev = [...convCursors]; setConvCursor(prev.pop()); setConvCursors(prev) }}>
                  <ChevronLeftIcon className="size-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!conversations?.nextCursor} onClick={() => { setConvCursors([...convCursors, convCursor!]); setConvCursor(conversations!.nextCursor!) }}>
                  Next <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <SummaryTile icon={CreditCard} label="Orgs" value={user.organizations.length} />
              <SummaryTile icon={CreditCard} label="Subscribed" value={user.organizations.filter((o) => o.subscription).length} />
              <SummaryTile icon={CreditCard} label="Invoices" value={allInvoices.length} />
              <SummaryTile icon={CreditCard} label="Paid" value={allInvoices.filter((i) => i.status === 'paid').length} />
            </div>
            {allInvoices.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Org</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="text-xs">{inv.invoiceNumber || inv.id.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs">{inv.org}</TableCell>
                          <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                          <TableCell className="tabular-nums text-xs">{inv.currency} {inv.total.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {inv.paidAt ? formatRelativeTime(inv.paidAt) : new Date(inv.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="p-5 text-xs text-muted-foreground">No invoices found.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <StatCard icon={Globe} title="Total Logins" value={totalLogins} color="text-primary" />
            <StatCard icon={ShieldCheck} title="Successful" value={successLogins} color="text-emerald-500" />
            <StatCard icon={Cpu} title="Unique Devices" value={uniqueDevices} color="text-blue-500" />
            <StatCard icon={Lock} title="Unique IPs" value={uniqueIps} color="text-amber-500" />
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-muted-foreground" /> Login History ({totalLogins})
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {loginTable.getHeaderGroups().map((hg) => (
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
                  {totalLogins === 0 ? (
                    <TableRow>
                      <TableCell colSpan={loginColumns.length} className="py-8 text-center text-xs text-muted-foreground">
                        No login activity recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loginTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="odd:bg-muted/30">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="size-4 text-muted-foreground" /> Account Access</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={() => doAction('logout')}><LogOut className="size-3.5" /> Force Logout</Button>
                {!user.emailVerified && <Button variant="outline" size="sm" className="justify-start" onClick={() => doAction('verify')}><Mail className="size-3.5" /> Verify Email</Button>}
                <Button variant="outline" size="sm" className="justify-start" onClick={() => doAction('reset')}><KeyRound className="size-3.5" /> Reset Password</Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={() => doAction('impersonate')}><Eye className="size-3.5" /> Impersonate User</Button>
                {user.status !== 'suspended' ? (
                  <Button variant="outline" size="sm" className="justify-start text-destructive" onClick={() => doAction('suspend')}><Ban className="size-3.5" /> Suspend Account</Button>
                ) : (
                  <Button variant="outline" size="sm" className="justify-start text-emerald-500" onClick={() => doAction('activate')}><CheckCircle2 className="size-3.5" /> Activate Account</Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-destructive"><Lock className="size-4" /> Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Delete this account permanently</p>
                    <p className="text-xs text-muted-foreground">Removes the auth account, profile, owned organizations, agents, chats and billing data.</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    {action.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />} Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update display name. Email is managed by auth and cannot be changed here.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="detail-name">Name</Label>
              <Input id="detail-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="User name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button
              disabled={updateUser.isPending}
              onClick={async () => {
                try {
                  await updateUser.mutateAsync({ id: user.id, data: { name: editName || null } })
                  toast.success('User updated')
                  setEditing(false)
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

      <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user account?</DialogTitle>
            <DialogDescription>
              This permanently deletes {user.name || user.email} — auth account, profile, and all owned organizations
              with their agents, knowledge bases, chats and billing data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { setConfirmDelete(false); await doAction('delete') }}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {linkResult && <ActionLinkDialog {...linkResult} onClose={() => setLinkResult(null)} />}
    </div>
  )
}