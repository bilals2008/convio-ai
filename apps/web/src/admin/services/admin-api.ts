import api from '@/lib/api'

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  verifiedUsers: number
  payingUsers: number
  newUsers30d: number
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
  status: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  orgCount: number
  plan: string
  organizations: Array<{ id: string; name: string; slug: string; plan: string | null }>
  agentCount: number
  conversationCount: number
  messageCount: number
  tokensUsed: number
  lastActive: string | null
}

export interface AdminUserDetail extends Omit<AdminUser, 'orgCount' | 'plan' | 'organizations' | 'agentCount' | 'conversationCount' | 'messageCount' | 'tokensUsed' | 'lastActive'> {
  organizations: Array<{
    id: string
    name: string
    slug: string
    plan: string | null
    role: string
    joinedAt: string
    subscription: {
      plan: string
      status: string
      renewsAt: string | null
      endsAt: string | null
      cancelAtPeriodEnd: boolean
    } | null
    invoices: Array<{
      id: string
      invoiceNumber: string | null
      status: string
      total: number
      currency: string
      createdAt: string
      paidAt: string | null
    }>
  }>
  agents: Array<{
    id: string
    name: string
    model: string
    status: string
    createdAt: string
    updatedAt: string
    organization: { id: string; name: string; slug: string }
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
  usage: {
    conversationCount: number
    messageCount: number
    tokensUsed: number
    knowledgeBaseCount: number
    agentCountInOrgs: number
    channelBreakdown: Array<{ channel: string; count: number }>
    lastActive: string | null
  }
}

export interface AdminActionLink {
  link?: string
  actionLink?: string
  email?: string
  sent?: boolean
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
  userSignups: Array<{ date: string; count: number }>
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

export interface AdminDocFeedback {
  summary: {
    totalVotes: number
    helpful: number
    notHelpful: number
    helpRate: number
  }
  perPage: Array<{ slug: string; helpful: number; notHelpful: number; total: number }>
  recent: Array<{
    id: string
    slug: string
    helpful: boolean
    comment: string | null
    createdAt: string
    user: { name: string | null; email: string; avatar: string | null }
    organization: { name: string; slug: string }
  }>
}

export interface AdminPlan {
  id: string
  key: string
  name: string
  description: string | null
  price: string | null
  priceMonthly: number | null
  yearlyPrice: string | null
  period: string | null
  badge: string | null
  highlighted: boolean
  comingSoon: boolean
  cta: string | null
  href: string | null
  variant: string | null
  icon: string | null
  iconColor: string | null
  features: Array<{ text: string; included?: boolean }>
  limits: {
    agents: number | null
    messagesPerMonth: number | null
    knowledgeBases: number | null
    organizations: number | null
  } | null
  active: boolean
  sortOrder: number
  providerMonthlyProductId: string | null
  providerYearlyProductId: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminKnowledgeBase {
  id: string
  name: string
  description: string | null
  createdAt: string
  organization: { id: string; name: string; slug: string }
  documentCount: number
  agentCount: number
  chunkCount: number
  queryCount: number
}

export interface AdminKnowledgeDocument {
  id: string
  name: string
  type: string
  status: string
  url: string | null
  fileKey: string | null
  createdAt: string
  chunkCount: number
  queryCount: number
  successCount: number
}

export interface AdminKnowledgeBaseDetail {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  organization: { id: string; name: string; slug: string }
  documents: AdminKnowledgeDocument[]
}

export interface AdminKnowledgeDocumentDetail {
  id: string
  name: string
  type: string
  status: string
  url: string | null
  fileKey: string | null
  content: string | null
  createdAt: string
  chunkCount: number
  successCount: number
  chunks: Array<{ id: string; content: string; createdAt: string }>
  queries: Array<{ id: string; success: boolean; createdAt: string }>
}

export const adminApi = {
  stats: () => api.get<{ data: AdminStats }>('/admin/stats'),

  users: (params?: {
    cursor?: string
    limit?: number
    search?: string
    status?: string
    plan?: string
    orgId?: string
    verified?: string
    createdFrom?: string
    createdTo?: string
    activeFrom?: string
    activeTo?: string
  }) => api.get<PaginatedResponse<AdminUser>>('/admin/users', { params }),

  user: (id: string) => api.get<{ data: AdminUserDetail }>(`/admin/users/${id}`),

  updateUser: (id: string, data: { name?: string | null; avatar?: string | null }) =>
    api.patch<{ data: { id: string; name: string | null; email: string; avatar: string | null; status: string; updatedAt: string } }>(`/admin/users/${id}`, data),

  userConversations: (id: string, params?: { cursor?: string; limit?: number }) =>
    api.get<PaginatedResponse<{
      id: string
      channel: string
      status: string
      contactName: string | null
      messageCount: number
      createdAt: string
      updatedAt: string
      agent: { id: string; name: string; organization: { id: string; name: string; slug: string } }
    }>>(`/admin/users/${id}/conversations`, { params }),

  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.post(`/admin/users/${id}/activate`),
  verifyUserEmail: (id: string) => api.post(`/admin/users/${id}/verify-email`),
  resetUserPassword: (id: string) => api.post<{ data: AdminActionLink }>(`/admin/users/${id}/reset-password`),
  impersonateUser: (id: string) => api.post<{ data: AdminActionLink }>(`/admin/users/${id}/impersonate`),
  forceLogoutUser: (id: string) => api.post(`/admin/users/${id}/force-logout`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  bulkUsers: (body: { ids: string[]; action: 'suspend' | 'activate' | 'verify' | 'delete' }) =>
    api.post<{ data: { processed: number; failed: Array<{ id: string; ok: boolean; error?: string }> } }>('/admin/users/bulk', body),

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

  docsFeedback: () => api.get<{ data: AdminDocFeedback }>('/admin/docs-feedback'),

  plans: () => api.get<{ data: AdminPlan[] }>('/admin/plans'),

  createPlan: (data: Partial<AdminPlan>) => api.post<{ data: AdminPlan }>('/admin/plans', data),

  updatePlan: (id: string, data: Partial<AdminPlan>) =>
    api.patch<{ data: AdminPlan }>(`/admin/plans/${id}`, data),

  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),

  knowledgeBases: (params?: { cursor?: string; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminKnowledgeBase>>('/admin/knowledge-bases', { params }),

  knowledgeBase: (id: string) => api.get<{ data: AdminKnowledgeBaseDetail }>(`/admin/knowledge-bases/${id}`),

  knowledgeDocument: (kbId: string, documentId: string) =>
    api.get<{ data: AdminKnowledgeDocumentDetail }>(`/admin/knowledge-bases/${kbId}/documents/${documentId}`),
}
