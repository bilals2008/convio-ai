import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>}
    </div>
  )
}
