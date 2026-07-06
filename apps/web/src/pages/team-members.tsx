import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

export default function TeamMembers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">Manage who has access to your organization</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Team Management</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Invite team members, assign roles (owner, admin, member, viewer), and manage permissions.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
