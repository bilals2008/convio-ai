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

  auditLogs: (params?: {
    action?: string; entityType?: string; actorId?: string
    dateFrom?: string; dateTo?: string; search?: string
    limit?: number; offset?: number
  }) => api.get<{ data: AuditLogEntry[]; total: number }>('/admin/audit-logs', { params }),
}
