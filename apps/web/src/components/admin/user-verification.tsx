import { BadgeCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function UserStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-500',
    suspended: 'bg-destructive/10 text-destructive',
    pending: 'bg-amber-500/10 text-amber-500',
  }
  return (
    <Badge variant="outline" className={cn('capitalize border-transparent', styles[status] || 'bg-muted text-muted-foreground')}>
      {status}
    </Badge>
  )
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500"><BadgeCheck className="size-3.5" /> Verified</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><X className="size-3.5" /> Unverified</span>
  )
}