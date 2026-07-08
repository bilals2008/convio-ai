import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Building2, Plus, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { PageHeader } from '@/components/shared/page-header'
import { OrgInfoForm } from '@/components/settings/org-info-form'
import { OrgDangerZone } from '@/components/settings/org-danger-zone'
import { Skeleton } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: string
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

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()

  const { data: org, isLoading, isError } = useQuery({
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
        <OrgInfoForm
          name={org.name}
          slug={org.slug}
          plan={org.plan}
          logo={org.logo}
          onSubmit={(data) => updateMutation.mutate(data)}
          loading={updateMutation.isPending}
        />
        <OrgDangerZone
          orgName={org.name}
          onDelete={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
        />
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
          <CardDescription>Set up your workspace to start managing chatbots and agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrgForm />
        </CardContent>
      </Card>
    </div>
  )
}
