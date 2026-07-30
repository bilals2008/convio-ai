import { Shield } from 'lucide-react'

interface RestrictedNoticeProps {
  permission?: string
}

export function RestrictedNotice({ permission }: RestrictedNoticeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Shield className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">Access Restricted</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        {permission
          ? `You need the "${permission}" permission to access this section.`
          : 'You do not have permission to access this section.'}
      </p>
    </div>
  )
}
