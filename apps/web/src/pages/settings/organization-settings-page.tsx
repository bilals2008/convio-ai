import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Shield, Calendar, Users, Pencil, Building2, Link2, ChevronRight, Crown, UserCog } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
import { OrgDangerZone } from '@/components/settings/org-danger-zone'

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

const editOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
})

function getRoleBadgeVariant(role: string | undefined): 'owner' | 'admin' | 'member' | 'viewer' {
  if (role === 'owner') return 'owner'
  if (role === 'admin') return 'admin'
  if (role === 'viewer') return 'viewer'
  return 'member'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editLogo, setEditLogo] = useState('')
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return res.data.data as Organization
    },
    enabled: !!orgId,
    retry: false,
  })

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const res = await orgsApi.members(orgId!)
      return res.data.data as OrgMember[]
    },
    enabled: !!orgId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; logo?: string }) =>
      orgsApi.update(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setEditOpen(false)
      toast.success('Organization updated')
    },
    onError: () => {
      toast.error('Failed to update organization')
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => orgsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      setCreateOpen(false)
      setCreateName('')
      setCreateSlug('')
      toast.success('Organization created')
      window.location.reload()
    },
    onError: () => {
      toast.error('Failed to create organization')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => orgsApi.delete(orgId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted')
      window.location.href = '/'
    },
  })

  const handleEditOpen = () => {
    if (!org) return
    setEditName(org.name)
    setEditSlug(org.slug)
    setEditLogo(org.logo || '')
    setEditErrors({})
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = editOrgSchema.safeParse({ name: editName, slug: editSlug })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setEditErrors(fieldErrors)
      return
    }
    setEditErrors({})
    updateMutation.mutate({ name: editName, slug: editSlug, logo: editLogo || undefined })
  }

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

  const handleDelete = () => {
    deleteMutation.mutate()
  }

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
      <div className="space-y-6 max-w-5xl">
        <PageHeader
          title="Organization"
          description="Manage your workspace settings and team"
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3.5" />
                New workspace
              </Button>
              <Button size="sm" onClick={handleEditOpen}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
          }
        />

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent" />
          <div className="relative p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar className="size-14 rounded-xl ring-1 ring-foreground/10 shrink-0">
                {org.logo && <AvatarImage src={org.logo} alt={org.name} className="rounded-xl" />}
                <AvatarFallback className="rounded-xl bg-primary/10 text-base font-semibold text-primary">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-bold tracking-tight">{org.name}</h2>
                  <Badge variant={getRoleBadgeVariant(org.plan === 'owner' ? 'owner' : undefined)} className="gap-1 text-[11px] capitalize">
                    <Shield className="size-3" />
                    {org.plan}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Link2 className="size-3.5" />
                    /{org.slug}
                  </span>
                  {org.createdAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Created {formatDate(org.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Inline stats */}
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <Users className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <Crown className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{adminCount} {adminCount === 1 ? 'admin' : 'admins'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <Shield className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium capitalize">{org.plan} plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column ────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-5">
          {/* Left — General */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  General
                </CardTitle>
                <CardDescription>Workspace configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0 divide-y divide-foreground/5">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium truncate">{org.name}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Slug</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium font-mono truncate">/{org.slug}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0 border-dashed">Soon</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <Badge variant={getRoleBadgeVariant(org.plan === 'owner' ? 'owner' : undefined)} className="capitalize text-[11px]">{org.plan}</Badge>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full" onClick={handleEditOpen}>
                    <Pencil className="size-3.5" />
                    Edit details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Members */}
          <div className="md:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-muted-foreground" />
                      Members
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {memberCount} {memberCount === 1 ? 'person' : 'people'} with access
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <UserCog className="size-3.5" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg p-2.5">
                        <div className="size-9 animate-pulse rounded-full bg-muted" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="-mx-1 space-y-0.5">
                    {members.map((member, i) => (
                      <div key={member.id}>
                        <div className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/50">
                          <Avatar size="sm">
                            {member.user?.avatar && <AvatarImage src={member.user.avatar} />}
                            <AvatarFallback className="text-xs">
                              {member.user?.name
                                ? getInitials(member.user.name)
                                : member.user?.email?.slice(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.user?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.user?.email}
                            </p>
                          </div>
                          <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize text-[10px] shrink-0">
                            {member.role}
                          </Badge>
                        </div>
                        {i < members.length - 1 && <Separator className="opacity-50" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No members"
                    description="Invite team members to collaborate."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <OrgDangerZone orgName={org.name} onDelete={handleDelete} loading={deleteMutation.isPending} />

        {/* ── Edit Dialog ─────────────────────────────────────── */}
        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditErrors({}) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>Update your workspace details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                />
                {editErrors.slug && <p className="text-xs text-destructive">{editErrors.slug}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-logo">Logo URL</Label>
                <Input
                  id="edit-logo"
                  value={editLogo}
                  onChange={(e) => setEditLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" size="sm" />}>Cancel</DialogClose>
                <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="size-3 animate-spin" />}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Create Dialog ───────────────────────────────────── */}
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setCreateName(''); setCreateSlug(''); setCreateErrors({}) } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
              <DialogDescription>Set up a new workspace</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
              {createMutation.isError && (
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
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Organization"
        description="Create your first organization to get started"
      />
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setCreateName(''); setCreateSlug(''); setCreateErrors({}) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Set up a new workspace</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
