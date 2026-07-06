import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { OrgInfoForm } from '@/components/settings/org-info-form'
import { OrgDangerZone } from '@/components/settings/org-danger-zone'
import { Skeleton } from '@/components/shared/loading'
import { organizations as orgsApi } from '@/lib/api'

const MOCK_ORG_ID = 'mock-org-id'

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: string
}

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient()

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', MOCK_ORG_ID],
    queryFn: async () => {
      const res = await orgsApi.get(MOCK_ORG_ID)
      return res.data.data as Organization
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; logo?: string }) =>
      orgsApi.update(MOCK_ORG_ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', MOCK_ORG_ID] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => orgsApi.delete(MOCK_ORG_ID),
    onSuccess: () => {
      window.location.href = '/'
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Settings" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Settings" description="Organization not found" />
      </div>
    )
  }

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
