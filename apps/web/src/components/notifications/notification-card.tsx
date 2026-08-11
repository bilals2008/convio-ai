import { Check, Archive } from 'lucide-react'
import type { NotificationItem } from '@/lib/api/notifications'
import { formatRelativeTime, cn } from '@/lib/utils'
import { CATEGORY_META, PRIORITY_META } from './notification-styles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NotificationCardProps {
  item: NotificationItem
  onRead: (id: string) => void
  onArchive: (id: string) => void
}

export function NotificationCard({ item, onRead, onArchive }: NotificationCardProps) {
  const Icon = CATEGORY_META[item.category]?.icon ?? CATEGORY_META.system.icon
  const priority = PRIORITY_META[item.priority] ?? PRIORITY_META.info
  const unread = item.status === 'unread'

  const content = (
    <div
      className={cn(
        'group relative flex w-full gap-3 rounded-lg p-3 text-left transition-colors',
        unread ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-muted/60'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
          unread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-[13px] leading-snug', unread ? 'font-semibold' : 'font-medium text-foreground/80')}>
            {item.title}
          </p>
          {unread && <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', priority.dot)} aria-hidden />}
        </div>
        {item.message && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          {item.priority !== 'info' && (
            <Badge variant="outline" className={cn('px-1 py-0 text-[9px]', priority.badge)}>
              {priority.label}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground/80">
            {CATEGORY_META[item.category]?.label ?? item.category}
          </span>
          <span className="text-[11px] text-muted-foreground/60">{formatRelativeTime(item.createdAt)}</span>
        </div>
      </div>

      <div className="absolute right-2 top-2 hidden items-center gap-1 group-hover:flex">
        {unread && (
          <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRead(item.id) }} aria-label="Mark as read">
            <Check className="size-3.5" />
          </Button>
        )}
        {item.status !== 'archived' && (
          <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(item.id) }} aria-label="Archive">
            <Archive className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )

  if (item.actionUrl) {
    return (
      <a href={item.actionUrl} className="block" onClick={() => unread && onRead(item.id)}>
        {content}
      </a>
    )
  }

  return content
}