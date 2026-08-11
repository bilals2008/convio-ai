import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from './notification-dropdown'
import { useUnreadCount } from '@/lib/hooks/use-notifications'

interface NotificationBellProps {
  orgId: string | null
}

export function NotificationBell({ orgId }: NotificationBellProps) {
  const { data: counts } = useUnreadCount(orgId ?? undefined, !!orgId)
  const unread = counts?.unread ?? 0
  const hasCritical = !!counts?.critical

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
            {unread === 0 && hasCritical && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" aria-hidden />
            )}
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-auto rounded-xl p-0">
        {orgId ? <NotificationDropdown orgId={orgId} /> : null}
      </PopoverContent>
    </Popover>
  )
}