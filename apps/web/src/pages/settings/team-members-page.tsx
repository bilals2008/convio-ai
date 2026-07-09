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
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'

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
  const { orgId } = useOrg()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeMember, setRemoveMember] = useState<Member | null>(null)

  const { data: rawMembers, isLoading } = useQuery({
    queryKey: ['members', orgId],
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
  }))

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      orgsApi.updateMemberRole(orgId!, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      orgsApi.removeMember(orgId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      setRemoveMember(null)
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: { members: Array<{ email: string; role: string }> }) =>
      orgsApi.api.post(`/organizations/${orgId}/members/bulk`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', orgId] })
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
