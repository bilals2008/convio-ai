import { SearchX } from 'lucide-react'
import { NotificationCard } from './notification-card'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationSkeleton } from './notification-skeleton'
import type { NotificationItem } from '@/lib/api/notifications'

interface NotificationListProps {
  items: NotificationItem[]
  isLoading: boolean
  hasMore: boolean
  isFetchingMore: boolean
  onRead: (id: string) => void
  onArchive: (id: string) => void
  sentinelRef: (node: Element | null) => void
}

export function NotificationList({
  items,
  isLoading,
  hasMore,
  isFetchingMore,
  onRead,
  onArchive,
  sentinelRef,
}: NotificationListProps) {
  if (isLoading) return <NotificationSkeleton />

  if (items.length === 0) {
    return (
      <NotificationEmptyState
        icon={SearchX}
        title="No notifications"
        description="Notifications for this view will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <NotificationCard key={item.id} item={item} onRead={onRead} onArchive={onArchive} />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden />}
      {isFetchingMore && <NotificationSkeleton compact />}
    </div>
  )
}