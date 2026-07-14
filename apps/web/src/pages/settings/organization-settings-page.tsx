import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Shield, Calendar, Users, Pencil } from 'lucide-react'
import { z } from 'zod'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
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
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

const editOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
})

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
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
      window.location.reload()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => orgsApi.delete(orgId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
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
      <div className="space-y-6">
        <PageHeader title="Organization" description="Manage your organization details and team" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (orgId && org) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization"
          description="Manage your organization details and team"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <Avatar size="lg" className="size-16">
                {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">{org.name}</h2>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    <Shield className="size-3" />
                    {org.plan}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 font-mono">/{org.slug}</p>
                {org.createdAt && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleEditOpen}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4" />
              Members
            </CardTitle>
            <CardDescription>
              {members?.length || 0} {members?.length === 1 ? 'member' : 'members'} in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="size-8 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar size="sm">
                      {member.user?.avatar && <AvatarImage src={member.user.avatar} />}
                      <AvatarFallback className="text-xs">
                        {member.user?.name
                          ? getInitials(member.user.name)
                          : member.user?.email?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px] shrink-0">
                      {member.role}
                    </Badge>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">New Organization</h3>
                <p className="text-xs text-muted-foreground">Create a new workspace</p>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Create
              </Button>
            </div>
          </CardContent>
        </Card>

        <OrgDangerZone orgName={org.name} onDelete={handleDelete} loading={deleteMutation.isPending} />

        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditErrors({}) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>Update your organization details</DialogDescription>
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
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Create your first organization to get started"
      />
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Create Organization</h3>
              <p className="text-xs text-muted-foreground">Set up a new workspace</p>
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
