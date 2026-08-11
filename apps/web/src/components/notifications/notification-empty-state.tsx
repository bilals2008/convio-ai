import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
}

export function NotificationEmptyState({ icon: Icon = Inbox, title, description, className }: NotificationEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-10 text-center', className)}>
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}