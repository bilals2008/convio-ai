import { Github, Mail, Chrome } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ConnectedAccount {
  id: string
  provider: string
  email: string
  connected: boolean
  icon: React.ReactNode
}

const connectedAccounts: ConnectedAccount[] = [
  {
    id: 'github',
    provider: 'GitHub',
    email: 'bilal@example.com',
    connected: true,
    icon: <Github className="size-4" />,
  },
  {
    id: 'google',
    provider: 'Google',
    email: 'bilal@example.com',
    connected: true,
    icon: <Chrome className="size-4" />,
  },
  {
    id: 'email',
    provider: 'Email',
    email: 'bilal@example.com',
    connected: true,
    icon: <Mail className="size-4" />,
  },
]

export function ConnectedAccountsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your linked authentication providers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectedAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                {account.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{account.provider}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {account.connected && (
                <Badge variant="active" className="text-[11px]">
                  Connected
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
