import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft, Building2, Bot, MessagesSquare, Mail, Globe, ShieldCheck,
  Pencil, Ban, CheckCircle2, KeyRound, Eye, LogOut, Trash2, CreditCard, Cpu, Loader2, Lock,
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
import { RoleBadge } from '@/components/admin/role-badge'
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
  const { data: conversations } = useAdminUserConversations(id, { limit: 20 })
  const action = useAdminUserAction()
  const updateUser = useAdminUpdateUser()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [linkResult, setLinkResult] = useState<{ title: string; description: string; link: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const doAction = async (type: 'suspend' | 'activate' | 'verify' | 'reset' | 'impersonate' | 'logout' | 'delete') => {
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

  const bestPlan = user.organizations.reduce((best, o) => {
    if (!o.plan) return best
    const rank = { free: 0, pro: 1, enterprise: 2 } as Record<string, number>
    return (rank[o.plan] || 0) > (rank[best] || 0) ? o.plan : best
  }, 'free')

  const allInvoices = user.organizations.flatMap((o) =>
    o.invoices.map((i) => ({ ...i, org: o.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
            <CardContent className="p-0">
              {user.agents.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground">No agents created by this user.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.agents.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium">{a.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.model}</TableCell>
                        <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                        <TableCell className="text-xs">{a.organization.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessagesSquare className="size-4 text-muted-foreground" /> Recent Conversations ({user.usage.conversationCount} total)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!conversations || conversations.data.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground">No conversations found for this user.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Org</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.data.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell><Badge variant="outline">{CHANNEL_LABELS[c.channel] || c.channel}</Badge></TableCell>
                        <TableCell className="text-sm">{c.agent.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.agent.organization.name}</TableCell>
                        <TableCell className="tabular-nums text-xs">{c.messageCount}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(c.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-muted-foreground" /> Login History ({user.recentLogins.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.recentLogins.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground">No login activity recorded.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {user.recentLogins.map((login, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-xs">{login.ipAddress || 'Unknown IP'} · {login.device || 'Unknown device'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {[login.browser, login.os, login.location].filter(Boolean).join(' — ') || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(login.createdAt)}</span>
                        <RoleBadge role={login.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
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