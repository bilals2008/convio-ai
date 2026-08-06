import { useCallback, useState } from 'react'
import { CheckCheck, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, useArchiveNotification, useUnreadCount, showNotificationError } from '@/lib/hooks/use-notifications'
import { NotificationList } from './notification-list'
import { NotificationFilters } from './notification-filters'
import { DEFAULT_NOTIFICATION_FILTERS as DEFAULT_FILTERS, type NotificationFilters as NotificationFiltersState } from './notification-styles'
import { Button } from '@/components/ui/button'

interface NotificationDropdownProps {
  orgId: string
}

export function NotificationDropdown({ orgId }: NotificationDropdownProps) {
  const [filters, setFilters] = useState<NotificationFiltersState>(DEFAULT_FILTERS)

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useNotifications(orgId, filters)
  const { data: counts } = useUnreadCount(orgId)
  const markRead = useMarkNotificationRead(orgId)
  const markAllRead = useMarkAllNotificationsRead(orgId)
  const archive = useArchiveNotification(orgId)

  const items = data?.pages.flatMap((p) => p.data) ?? []

  const handleMarkRead = (id: string) => markRead.mutate(id, { onError: showNotificationError })
  const handleArchive = (id: string) => archive.mutate(id, { onError: showNotificationError })
  const handleMarkAllRead = () => markAllRead.mutate(undefined, { onError: showNotificationError })

  const sentinelRef = useCallback(
    (node: Element | null) => {
      if (!node || !hasNextPage || isFetchingNextPage) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) void fetchNextPage()
        },
        { rootMargin: '80px' }
      )
      observer.observe(node)
      return () => observer.disconnect()
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  return (
    <div className="flex max-h-[520px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {!!counts?.unread && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {counts.unread} unread
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleMarkAllRead}
          disabled={!counts?.unread}
        >
          <CheckCheck className="size-3.5" />
          Mark all read
        </Button>
      </div>

      <div className="border-b px-4 py-2.5">
        <NotificationFilters
          filters={filters}
          onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
          counts={counts}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        <NotificationList
          items={items}
          isLoading={isLoading}
          hasMore={hasNextPage ?? false}
          isFetchingMore={isFetchingNextPage}
          onRead={handleMarkRead}
          onArchive={handleArchive}
          sentinelRef={sentinelRef}
        />
      </div>

      <Link
        to="/notifications"
        className="flex items-center justify-center gap-1 border-t py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        View all notifications
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}