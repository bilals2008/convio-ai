import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings } from 'lucide-react'

export default function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details and preferences</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Settings className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Organization Settings</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Update your organization name, slug, logo, and billing plan. Manage team members and roles.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
