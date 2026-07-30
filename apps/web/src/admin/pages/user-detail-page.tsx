import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Globe, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/admin/user-avatar'
import { RoleBadge } from '@/components/admin/role-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminUser } from '@/admin/hooks/use-admin'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useAdminUser(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/users')}>Back to users</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>

      <Card>
        <CardContent className="p-5">
          <UserAvatar name={user.name} email={user.email} avatar={user.avatar} size="md" />
          <p className="mt-3 text-xs text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString()} &middot; Updated {new Date(user.updatedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            Organizations ({user.organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {user.organizations.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">Not a member of any organization.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {user.organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {org.plan && <span className="text-xs text-muted-foreground capitalize">{org.plan}</span>}
                    <RoleBadge role={org.role} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            Recent Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {user.recentLogins.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">No recent login activity recorded.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {user.recentLogins.map((login, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs">
                      {login.ipAddress || 'Unknown IP'} &middot; {login.device || 'Unknown device'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {[login.browser, login.os].filter(Boolean).join(' — ') || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      <Clock className="size-3 inline mr-1" />
                      {new Date(login.createdAt).toLocaleString()}
                    </span>
                    <RoleBadge role={login.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
