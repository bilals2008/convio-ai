import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications as notificationsApi, notificationPreferences as preferencesApi } from '@/lib/api'
import type { NotificationListParams, NotificationPreferences } from '@/lib/api/notifications'
import { toast } from '@/lib/toast'

export const queryKeys = {
  notifications: (orgId?: string, filters?: Record<string, unknown>) =>
    ['notifications', orgId, filters] as const,
  unread: (orgId?: string) => ['notifications', 'unread', orgId] as const,
  preferences: ['notifications', 'preferences'] as const,
}

export function useNotifications(
  orgId?: string,
  filters: Omit<NotificationListParams, 'cursor' | 'limit'> = {},
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications(orgId, filters)],
    queryFn: async ({ pageParam }) => {
      const res = await notificationsApi.list(orgId!, { ...filters, cursor: pageParam ?? undefined, limit: 25 })
      return res
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
    enabled: !!orgId && enabled,
  })
}

export function useUnreadCount(orgId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.unread(orgId),
    queryFn: async () => notificationsApi.unreadCount(orgId!),
    staleTime: 10_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    enabled: !!orgId && enabled,
  })
}

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>, orgId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  if (orgId) void queryClient.invalidateQueries({ queryKey: queryKeys.unread(orgId) })
}

export function useMarkNotificationRead(orgId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(orgId!, id),
    onSuccess: () => invalidateNotificationQueries(queryClient, orgId),
  })
}

export function useMarkAllNotificationsRead(orgId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(orgId!),
    onSuccess: () => invalidateNotificationQueries(queryClient, orgId),
  })
}

export function useArchiveNotification(orgId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.archive(orgId!, id),
    onSuccess: () => invalidateNotificationQueries(queryClient, orgId),
  })
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.preferences,
    queryFn: () => preferencesApi.get(),
    staleTime: 60_000,
  })

  const update = useMutation({
    mutationFn: (body: Partial<Omit<NotificationPreferences, 'userId' | 'organizationId' | 'updatedAt'>>) =>
      preferencesApi.update(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.preferences })
    },
  })

  return { ...query, update }
}

export function usePreferenceToggle() {
  const { data: prefs, update } = useNotificationPreferences()
  return {
    prefs,
    toggle: (patch: Partial<Omit<NotificationPreferences, 'userId' | 'organizationId' | 'updatedAt'>>) => {
      return update.mutateAsync(patch)
    },
    ...update,
  }
}

export function showNotificationError(error: unknown) {
  const msg = (error as { friendlyMessage?: string })?.friendlyMessage
  toast.error(msg || 'Something went wrong. Please try again.')
}