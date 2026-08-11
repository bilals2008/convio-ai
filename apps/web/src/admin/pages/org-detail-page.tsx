import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Bot, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/admin/user-avatar'
import { RoleBadge } from '@/components/admin/role-badge'
import { StatusBadge } from '@/components/admin/status-badge'
import { KpiCard } from '@/components/admin/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminOrg } from '@/admin/hooks/use-admin'

export default function AdminOrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: org, isLoading } = useAdminOrg(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Organization not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/organizations')}>Back to organizations</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/organizations')}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{org.name}</h1>
          <p className="text-sm text-muted-foreground">{org.slug}</p>
        </div>
        <StatusBadge status={org.plan || 'free'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Bot} label="Agents" value={org.stats.agentCount} />
        <KpiCard icon={MessageSquare} label="Conversations" value={org.stats.conversationCount} />
        <KpiCard icon={Users} label="Messages" value={org.stats.messageCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            Members ({org.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {org.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-3">
                <UserAvatar name={member.user.name} email={member.user.email} avatar={member.user.avatar} size="sm" />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                  <RoleBadge role={member.role} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
