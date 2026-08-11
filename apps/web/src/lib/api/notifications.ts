import api from '../api'

export interface NotificationItem {
  id: string
  title: string
  message: string | null
  type: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info'
  status: 'unread' | 'read' | 'archived'
  metadata: Record<string, unknown> | null
  actionUrl: string | null
  createdAt: string
  readAt: string | null
  archivedAt: string | null
}

export interface NotificationListParams {
  status?: string
  category?: string
  priority?: string
  search?: string
  cursor?: string
  limit?: number
}

export interface NotificationListResponse {
  data: NotificationItem[]
  nextCursor: string | null
}

export interface NotificationPreferences {
  userId: string
  organizationId: string | null
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  digestFrequency: 'never' | 'daily' | 'weekly'
  quietHours: { start?: string; end?: string } | null
  categorySettings: Record<string, { email?: boolean; inApp?: boolean }>
  muteAll: boolean
  updatedAt: string
}

export const notifications = {
  list: (orgId: string, params: NotificationListParams) =>
    api.get<NotificationListResponse>(`/organizations/${orgId}/notifications`, { params })
      .then((r) => r.data),
  unreadCount: (orgId: string) =>
    api.get<{ unread: number; critical: number }>(`/organizations/${orgId}/notifications/unread-count`)
      .then((r) => r.data),
  markRead: (orgId: string, id: string) =>
    api.post(`/organizations/${orgId}/notifications/${id}/read`).then((r) => r.data),
  markAllRead: (orgId: string) =>
    api.post(`/organizations/${orgId}/notifications/read-all`).then((r) => r.data),
  archive: (orgId: string, id: string) =>
    api.post(`/organizations/${orgId}/notifications/${id}/archive`).then((r) => r.data),
}

export const notificationPreferences = {
  get: () =>
    api.get<NotificationPreferences>('/notifications/preferences').then((r) => r.data),
  update: (body: Partial<Omit<NotificationPreferences, 'userId' | 'organizationId' | 'updatedAt'>>) =>
    api.put<NotificationPreferences>('/notifications/preferences', body).then((r) => r.data),
}