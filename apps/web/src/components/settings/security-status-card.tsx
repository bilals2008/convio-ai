import { Shield, Lock, Smartphone, Mail, MonitorSmartphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCurrentSession } from '@/lib/hooks/use-security'

interface SecurityItemProps {
  icon: React.ReactNode
  label: string
  status: 'enabled' | 'disabled' | 'warning'
  detail?: string
}

function SecurityItem({ icon, label, status, detail }: SecurityItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {detail && (
          <p className="text-xs text-muted-foreground">{detail}</p>
        )}
      </div>
      <Badge
        variant={status === 'enabled' ? 'active' : status === 'warning' ? 'pending' : 'secondary'}
        className="shrink-0"
      >
        {status === 'enabled' ? 'Enabled' : status === 'warning' ? 'Warning' : 'Disabled'}
      </Badge>
    </div>
  )
}

export function SecurityStatusCard() {
  const { data: session } = useCurrentSession()

  const sessionCount = session ? 1 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          Security Status
        </CardTitle>
        <CardDescription>Review your account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <SecurityItem
          icon={<Lock className="size-4 text-muted-foreground" />}
          label="Password"
          status="enabled"
          detail="Last changed 12 days ago"
        />
        <SecurityItem
          icon={<Smartphone className="size-4 text-muted-foreground" />}
          label="Two-Factor Auth"
          status="disabled"
          detail="Not configured"
        />
        <SecurityItem
          icon={<MonitorSmartphone className="size-4 text-muted-foreground" />}
          label="Active Sessions"
          status="enabled"
          detail={`${sessionCount} device${sessionCount !== 1 ? 's' : ''} currently active`}
        />
        <SecurityItem
          icon={<Mail className="size-4 text-muted-foreground" />}
          label="Recovery Email"
          status="enabled"
          detail="Set"
        />
      </CardContent>
    </Card>
  )
}
