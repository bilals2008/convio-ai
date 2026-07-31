import api from '@/lib/api'

export interface AdminStats {
  totalUsers: number
  totalOrgs: number
  totalAgents: number
  messagesLast24h: number
  conversationsLast24h: number
}

export interface AdminUser {
  id: string
  name: string | null
  email: string
  avatar: string | null
  createdAt: string
  updatedAt: string
  orgCount: number
}

export interface AdminUserDetail extends Omit<AdminUser, 'orgCount'> {
  organizations: Array<{
    id: string
    name: string
    slug: string
    plan: string | null
    role: string
    joinedAt: string
  }>
  recentLogins: Array<{
    ipAddress: string | null
    device: string | null
    browser: string | null
    os: string | null
    location: string | null
    status: string
    createdAt: string
  }>
}

export interface AdminOrg {
  id: string
  name: string
  slug: string
  logo: string | null
  plan: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
  agentCount: number
}

export interface AdminOrgDetail extends AdminOrg {
  members: Array<{
    id: string
    role: string
    joinedAt: string
    user: { id: string; name: string | null; email: string; avatar: string | null }
  }>
  stats: {
    agentCount: number
    conversationCount: number
    messageCount: number
  }
}

export interface SystemHealth {
  conversationsByStatus: Record<string, number>
  activeDeployments: number
  errorsLast24h: number
}

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  organizationId: string | null
  actor: { id: string; name: string | null; email: string; avatar: string | null } | null
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
}

export interface AdminAnalyticsDaily {
  date: string
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  inputTokens: number
  outputTokens: number
}

export interface AdminAnalytics {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  successRate: number
  conversationsChange: number
  messagesChange: number
  usersChange: number
  dailyBreakdown: AdminAnalyticsDaily[]
  channelBreakdown: Array<{ channel: string; count: number }>
  planDistribution: Array<{ plan: string; count: number }>
  orgSignups: Array<{ date: string; count: number }>
  totalOrgs: number
  totalAgents: number
  totalUsers: number
  topOrgs: Array<{
    id: string
    name: string
    slug: string
    plan: string | null
    logo: string | null
    createdAt: string
    conversationCount: number
  }>
}

export interface AdminAgent {
  id: string
  name: string
  model: string
  status: string
  avatar: string | null
  createdAt: string
  updatedAt: string
  organization: { id: string; name: string; slug: string }
  conversationCount: number
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: string
  published: boolean
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminProviderKey {
  id: string
  provider: string
  keyPreview: string
  label: string | null
  createdAt: string
  updatedAt: string
  organization: { id: string; name: string; slug: string }
}

export interface AdminBilling {
  totalSubscriptions: number
  activeSubscriptions: number
  totalRevenue: number
  planDistribution: Array<{ plan: string; count: number }>
  invoices: Array<{
    id: string
    invoiceNumber: string | null
    status: string
    total: number
    currency: string
    createdAt: string
    paidAt: string | null
    organization: { id: string; name: string; slug: string } | null
  }>
  subscriptionsByStatus: Record<string, number>
}

export interface ModerationOrgConfig {
  id: string
  name: string
  slug: string
  plan: string | null
  createdAt: string
  config: {
    id: string
    enabled: boolean
    profanityEnabled: boolean
    piiEnabled: boolean
    injectionEnabled: boolean
    blockOnViolation: boolean
    customRules: unknown
  } | null
  violationCount: number
}

export interface ModerationViolation {
  id: string
  organizationId: string
  organization: { id: string; name: string; slug: string } | null
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export const adminApi = {
  stats: () => api.get<{ data: AdminStats }>('/admin/stats'),

  users: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminUser>>('/admin/users', { params }),

  user: (id: string) => api.get<{ data: AdminUserDetail }>(`/admin/users/${id}`),

  orgs: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminOrg>>('/admin/organizations', { params }),

  org: (id: string) => api.get<{ data: AdminOrgDetail }>(`/admin/organizations/${id}`),

  analytics: (days?: number) => api.get<{ data: AdminAnalytics }>('/admin/analytics', { params: { limit: days || 30 } }),

  agents: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminAgent>>('/admin/agents', { params }),

  system: () => api.get<{ data: SystemHealth }>('/admin/system'),

  billing: () => api.get<{ data: AdminBilling }>('/admin/billing'),

  providerKeys: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminProviderKey>>('/admin/provider-keys', { params }),

  announcements: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<Announcement>>('/admin/announcements', { params }),

  createAnnouncement: (data: { title: string; body: string; priority?: string; published?: boolean; startsAt?: string; endsAt?: string }) =>
    api.post<{ data: Announcement }>('/admin/announcements', data),

  updateAnnouncement: (id: string, data: Partial<{ title: string; body: string; priority: string; published: boolean; startsAt: string; endsAt: string }>) =>
    api.patch<{ data: Announcement }>(`/admin/announcements/${id}`, data),

  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

  moderationConfigs: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get<{ data: ModerationOrgConfig[]; total: number }>('/admin/moderation', { params }),

  moderationViolations: (params?: { search?: string; limit?: number; offset?: number; severity?: string; orgId?: string }) =>
    api.get<{ data: ModerationViolation[]; total: number }>('/admin/moderation/violations', { params }),

  auditLogs: (params?: {
    action?: string; entityType?: string; actorId?: string
    dateFrom?: string; dateTo?: string; search?: string
    limit?: number; offset?: number
  }) => api.get<{ data: AuditLogEntry[]; total: number }>('/admin/audit-logs', { params }),
}
