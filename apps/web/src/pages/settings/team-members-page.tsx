import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MemberTable } from '@/components/settings/member-table'
import { MemberInviteForm } from '@/components/settings/member-invite-form'
import { MemberRemoveDialog } from '@/components/settings/member-remove-dialog'
import { organizations as orgsApi } from '@/lib/api'

const MOCK_ORG_ID = 'mock-org-id'

type MemberRole = 'owner' | 'admin' | 'member'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  role: MemberRole
  joinedAt: string
}

export default function TeamMembersPage() {
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeMember, setRemoveMember] = useState<Member | null>(null)

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', MOCK_ORG_ID],
    queryFn: async () => {
      const res = await orgsApi.members(MOCK_ORG_ID)
      return (res.data.data || []) as Member[]
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      orgsApi.api.patch(`/organizations/${MOCK_ORG_ID}/members/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', MOCK_ORG_ID] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      orgsApi.api.delete(`/organizations/${MOCK_ORG_ID}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', MOCK_ORG_ID] })
      setRemoveMember(null)
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      orgsApi.api.post(`/organizations/${MOCK_ORG_ID}/members`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', MOCK_ORG_ID] })
      setInviteOpen(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Members" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Manage who has access to your organization"
        action={
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="size-4" />
            Invite Member
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <MemberTable
            members={members || []}
            onRoleChange={(userId, role) => roleMutation.mutate({ userId, role })}
            onRemove={(userId) => {
              const member = members?.find((m) => m.userId === userId)
              if (member) setRemoveMember(member)
            }}
            loading={roleMutation.isPending}
          />
        </CardContent>
      </Card>

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
