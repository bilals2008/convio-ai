import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Shield, Calendar, Users, Crown, ArrowLeft, Download } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'
import { OrgPlanUpgrade } from '@/components/shared/org-plan-upgrade'
import { usePlan } from '@/lib/hooks/use-billing'
import { MemberTable } from '@/components/settings/member-table'
import { MemberInviteForm } from '@/components/settings/member-invite-form'
import { MemberRemoveDialog } from '@/components/settings/member-remove-dialog'

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: string
  createdAt?: string
  updatedAt?: string
}

interface OrgMember {
  id: string
  userId: string
  role: string
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}

const createOrgSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId, orgs, isLoading: orgLoading } = useOrg()

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [createShowUpgrade, setCreateShowUpgrade] = useState(false)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeMember, setRemoveMember] = useState<Member | null>(null)

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return res.data.data as Organization
    },
    enabled: !!orgId,
    retry: false,
  })

  const { data: rawMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const res = await orgsApi.members(orgId!)
      return res.data.data as { id: string; role: MemberRole; joinedAt: string; user: { id: string; name?: string; email: string; image?: string } }[]
    },
    enabled: !!orgId,
  })

  const members: Member[] = (rawMembers || []).map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name || 'Unknown',
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
    avatar: m.user.image,
  }))

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => orgsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      setCreateOpen(false)
      setCreateName('')
      setCreateSlug('')
      setCreateShowUpgrade(false)
      toast.success('Organization created')
      window.location.reload()
    },
    onError: (error) => {
      const data = (error as any)?.response?.data
      if (data?.error === 'PLAN_LIMIT_EXCEEDED') {
        setCreateShowUpgrade(true)
      } else {
        toast.error(error.message || 'Failed to create organization')
      }
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      orgsApi.updateMemberRole(orgId!, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      toast.success('Role updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      orgsApi.removeMember(orgId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      setRemoveMember(null)
      toast.success('Member removed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: { members: Array<{ email: string; role: string }> }) =>
      orgsApi.api.post(`/organizations/${orgId}/invitations`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', orgId] })
      setInviteOpen(false)
      const result = res.data?.data as { succeeded?: number } | undefined
      const count = result?.succeeded ?? 0
      if (count > 0) toast.success(`${count} invitation${count > 1 ? 's' : ''} sent! They'll receive an email to join.`)
      else toast.error('No invitations were sent. Some users may already be registered members.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invites')
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = createOrgSchema.safeParse({ name: createName, slug: createSlug })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setCreateErrors(fieldErrors)
      return
    }
    setCreateErrors({})
    createMutation.mutate({ name: createName, slug: createSlug })
  }

  const { data: planData } = usePlan()
  const planName = planData?.name || org?.plan || 'free'
  const planLimits: Record<string, number> = { free: 1, pro: 3, business: 5, enterprise: Infinity }
  const orgLimit = planLimits[planName] ?? 1

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Organization" description="Manage your organization details and team" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-52 w-full rounded-xl md:col-span-2" />
          <Skeleton className="h-52 w-full rounded-xl md:col-span-3" />
        </div>
      </div>
    )
  }

  if (orgId && org) {
    const memberCount = members?.length || 0
    const adminCount = members?.filter((m) => m.role === 'owner' || m.role === 'admin').length || 0

    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization"
          description="Manage your workspace settings and team"
          action={
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              New workspace
            </Button>
          }
        />

        <OrgKPISection
          memberCount={memberCount}
          adminCount={adminCount}
          planName={org.plan}
          createdAt={org.createdAt}
        />

        <OrgMembersSection
          members={members}
          isLoading={membersLoading}
          inviteOpen={inviteOpen}
          setInviteOpen={setInviteOpen}
          removeMember={removeMember}
          setRemoveMember={setRemoveMember}
          roleMutation={roleMutation}
          removeMutation={removeMutation}
          inviteMutation={inviteMutation}
        />

        {/* ── Create Dialog ───────────────────────────────────── */}
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setCreateName(''); setCreateSlug(''); setCreateErrors({}); setCreateShowUpgrade(false) } }}>
          <DialogContent className="sm:max-w-md">
            {createShowUpgrade ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setCreateShowUpgrade(false)}
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  <DialogTitle className="text-sm">Upgrade your plan</DialogTitle>
                </div>
                <OrgPlanUpgrade
                  currentOrgs={(orgs?.length || 1)}
                  currentPlan={planName}
                  limit={orgLimit}
                />
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>Set up a new workspace</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="My Organization"
                    disabled={createMutation.isPending}
                  />
                  {createErrors.name && <p className="text-xs text-destructive">{createErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Slug</Label>
                  <Input
                    id="create-slug"
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value)}
                    placeholder="my-organization"
                    disabled={createMutation.isPending}
                  />
                  {createErrors.slug && <p className="text-xs text-destructive">{createErrors.slug}</p>}
                </div>
                {!createShowUpgrade && createMutation.isError && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {(createMutation.error as any)?.response?.data?.message || 'Failed to create'}
                  </div>
                )}
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost" size="sm" />}>Cancel</DialogClose>
                  <Button type="submit" size="sm" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="size-3 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Create your first organization to get started"
      />
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Create Organization</p>
            <p className="text-xs text-muted-foreground">Set up a new workspace to get started</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setCreateName(''); setCreateSlug(''); setCreateErrors({}); setCreateShowUpgrade(false) } }}>
        <DialogContent className="sm:max-w-md">
          {createShowUpgrade ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setCreateShowUpgrade(false)}
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <DialogTitle className="text-sm">Upgrade your plan</DialogTitle>
              </div>
              <OrgPlanUpgrade
                currentOrgs={(orgs?.length || 0)}
                currentPlan={planName}
                limit={orgLimit}
              />
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>Set up a new workspace</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="create-name-empty">Name</Label>
                <Input
                  id="create-name-empty"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="My Organization"
                  disabled={createMutation.isPending}
                />
                {createErrors.name && <p className="text-xs text-destructive">{createErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-slug-empty">Slug</Label>
                <Input
                  id="create-slug-empty"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  placeholder="my-organization"
                  disabled={createMutation.isPending}
                />
                {createErrors.slug && <p className="text-xs text-destructive">{createErrors.slug}</p>}
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" size="sm" />}>Cancel</DialogClose>
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="size-3 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── KPI Section ─────────────────────────────────────────────────────────────

function OrgKPISection({
  memberCount,
  adminCount,
  planName,
  createdAt,
}: {
  memberCount: number
  adminCount: number
  planName: string
  createdAt?: string
}) {
  const kpis = [
    {
      icon: Users,
      label: 'Members',
      value: memberCount,
      iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Crown,
      label: 'Admins',
      value: adminCount,
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      icon: Shield,
      label: 'Plan',
      value: planName,
      iconBg: 'bg-violet-500/10 text-violet-500',
    },
    {
      icon: Calendar,
      label: 'Created',
      value: createdAt ? formatDate(createdAt) : '—',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPI key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

function KPI({ icon: Icon, label, value, iconBg }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconBg?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold leading-none tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

// ── Members Section ─────────────────────────────────────────────────────────

function OrgMembersSection({
  members,
  isLoading,
  inviteOpen,
  setInviteOpen,
  removeMember,
  setRemoveMember,
  roleMutation,
  removeMutation,
  inviteMutation,
}: {
  members: Member[]
  isLoading: boolean
  inviteOpen: boolean
  setInviteOpen: (open: boolean) => void
  removeMember: Member | null
  setRemoveMember: (member: Member | null) => void
  roleMutation: ReturnType<typeof useMutation>
  removeMutation: ReturnType<typeof useMutation>
  inviteMutation: ReturnType<typeof useMutation>
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Members</h3>
          <Badge variant="secondary" className="text-[10px]">
            {members.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-3.5" />
            CSV
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="size-3.5" />
            Invite
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="size-9 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="rounded-xl border border-border/60 bg-card">
          <MemberTable
            members={members}
            onRoleChange={(userId, role) => roleMutation.mutate({ userId, role })}
            onRemove={(userId) => {
              const member = members.find((m) => m.userId === userId)
              if (member) setRemoveMember(member)
            }}
            loading={roleMutation.isPending}
            removingId={removeMutation.isPending ? removeMember?.userId : null}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No members</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Invite team members to collaborate.
          </p>
        </div>
      )}

      <MemberInviteForm
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={(data) => inviteMutation.mutate(data)}
        loading={inviteMutation.isPending}
      />

      {removeMember && (
        <MemberRemoveDialog
          open={!!removeMember}
          onOpenChange={(open) => { if (!open) setRemoveMember(null) }}
          memberName={removeMember.name}
          memberEmail={removeMember.email}
          onConfirm={() => removeMutation.mutate(removeMember.userId)}
          loading={removeMutation.isPending}
        />
      )}
    </div>
  )
}
