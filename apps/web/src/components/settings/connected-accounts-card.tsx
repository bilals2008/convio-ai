import { Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z" />
      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
      <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.566-5.09 3.566-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436a5.5 5.5 0 0 1-2.396 3.558l3.793 2.987Z" />
      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
    </svg>
  )
}

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
    icon: <GithubIcon className="size-4" />,
  },
  {
    id: 'google',
    provider: 'Google',
    email: 'bilal@example.com',
    connected: true,
    icon: <GoogleIcon className="size-4" />,
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
