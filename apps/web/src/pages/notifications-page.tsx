import { useCallback, useMemo, useState } from 'react'
import { BellRing, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NotificationList } from '@/components/notifications/notification-list'
import { NotificationFilters } from '@/components/notifications/notification-filters'
import { DEFAULT_NOTIFICATION_FILTERS as DEFAULT_FILTERS, type NotificationFilters as NotificationFiltersState } from '@/components/notifications/notification-styles'
import { useNotifications, useUnreadCount, useMarkAllNotificationsRead, useMarkNotificationRead, useArchiveNotification, showNotificationError } from '@/lib/hooks/use-notifications'
import { useOrg } from '@/lib/org-context'
import { LoadingPage } from '@/components/shared/loading'

export default function NotificationsPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const [filters, setFilters] = useState<NotificationFiltersState>(DEFAULT_FILTERS)

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useNotifications(
    orgId ?? undefined,
    filters,
    !!orgId
  )
  const { data: counts } = useUnreadCount(orgId ?? undefined, !!orgId)
  const markRead = useMarkNotificationRead(orgId ?? undefined)
  const markAllRead = useMarkAllNotificationsRead(orgId ?? undefined)
  const archive = useArchiveNotification(orgId ?? undefined)

  const items = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

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
        { rootMargin: '200px' }
      )
      observer.observe(node)
      return () => observer.disconnect()
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  if (orgLoading) return <LoadingPage text="Loading notifications..." />

  if (!orgId) return null

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description="Activity from your agents, workspace, and billing."
        action={
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={!counts?.unread}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <NotificationFilters
            filters={filters}
            onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            counts={counts}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <NotificationList
            items={items}
            isLoading={isLoading}
            hasMore={hasNextPage ?? false}
            isFetchingMore={isFetchingNextPage}
            onRead={handleMarkRead}
            onArchive={handleArchive}
            sentinelRef={sentinelRef}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <BellRing className="size-3.5" />
        Critical and high-priority notifications also trigger email when enabled.
      </div>
    </div>
  )
}