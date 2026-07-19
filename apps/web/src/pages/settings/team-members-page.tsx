import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const { orgId, isLoading: orgLoading } = useOrg()
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

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Members" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">Team members</h1>
          <Badge variant="secondary" className="text-xs">
            {members.length} users
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-3.5" />
            Download CSV
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="size-3.5" />
            Add user
          </Button>
        </div>
      </div>

      <MemberTable
        members={members || []}
        onRoleChange={(userId, role) => roleMutation.mutate({ userId, role })}
        onRemove={(userId) => {
          const member = members?.find((m) => m.userId === userId)
          if (member) setRemoveMember(member)
        }}
        loading={roleMutation.isPending}
        removingId={removeMutation.isPending ? removeMember?.userId : null}
      />

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
