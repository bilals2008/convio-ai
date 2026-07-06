import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key } from 'lucide-react'

export default function ApiKeys() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">Manage API keys for programmatic access</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Key className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">API Key Management</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Generate and manage API keys for authenticating with the Convio API. Secrets are shown only once upon creation.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
