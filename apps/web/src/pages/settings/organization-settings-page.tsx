import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Building2, Plus, AlertCircle, Users, Calendar, Shield } from 'lucide-react'
import { z } from 'zod'
import { PageHeader } from '@/components/shared/page-header'
import { OrgInfoForm } from '@/components/settings/org-info-form'
import { OrgDangerZone } from '@/components/settings/org-danger-zone'
import { Skeleton } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'

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

function CreateOrgForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => orgsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      window.location.reload()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = createOrgSchema.safeParse({ name, slug })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    createMutation.mutate({ name, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="create-org-name">Name</Label>
          <Input
            id="create-org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Organization"
            disabled={createMutation.isPending}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-org-slug">Slug</Label>
          <Input
            id="create-org-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-organization"
            disabled={createMutation.isPending}
            aria-invalid={!!errors.slug}
          />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
        </div>
      </div>

      {createMutation.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {(createMutation.error as any)?.response?.data?.message || (createMutation.error as Error)?.message || 'Failed to create'}
        </div>
      )}

      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        <Plus className="size-4" />
        Create Organization
      </Button>
    </form>
  )
}

function OrgDetailsCard({ org }: { org: Organization }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-5" />
          Organization Details
        </CardTitle>
        <CardDescription>View your organization information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="size-16 rounded-lg object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold">{org.name}</h3>
              <p className="text-sm text-muted-foreground">/{org.slug}</p>
            </div>
          </div>

          <div className="grid gap-4 pt-4 border-t sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-medium capitalize">{org.plan}</p>
              </div>
            </div>
            {org.createdAt && (
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {org.updatedAt && (
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(org.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrgMembersCard({ orgId }: { orgId: string }) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const res = await orgsApi.members(orgId)
      return res.data.data as OrgMember[]
    },
    enabled: !!orgId,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Members
        </CardTitle>
        <CardDescription>Manage your organization members</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {member.user?.name
                    ? member.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : member.user?.email?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No members found.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return res.data.data as Organization
    },
    enabled: !!orgId,
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; logo?: string }) =>
      orgsApi.update(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => orgsApi.delete(orgId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      window.location.href = '/'
    },
  })

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Settings" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (orgId && org) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization Settings"
          description="Manage your organization details and preferences"
        />

        <OrgDetailsCard org={org} />

        <OrgInfoForm
          name={org.name}
          slug={org.slug}
          plan={org.plan}
          logo={org.logo}
          onSubmit={(data) => updateMutation.mutate(data)}
          loading={updateMutation.isPending}
        />

        <OrgMembersCard orgId={orgId} />

        <OrgDangerZone
          orgName={org.name}
          onDelete={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Create New Organization
            </CardTitle>
            <CardDescription>Set up a new workspace to start managing agents.</CardDescription>
          </CardHeader>
          <CardContent>
            {showCreateForm ? (
              <div className="space-y-4">
                <CreateOrgForm />
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="size-4" />
                Create New Organization
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings"
        description="Create your first organization to get started"
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Create Organization
          </CardTitle>
          <CardDescription>Set up your workspace to start managing agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrgForm />
        </CardContent>
      </Card>
    </div>
  )
}
