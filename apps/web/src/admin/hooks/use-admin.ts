import { useQuery } from '@tanstack/react-query'
import { adminApi, type AdminStats, type AdminUserDetail, type AdminOrgDetail, type SystemHealth, type AuditLogEntry, type AdminAnalytics, type AdminBilling, type AdminProviderKey, type Announcement, type ModerationOrgConfig, type ModerationViolation, type AdminDocFeedback, type AdminPlan } from '@/admin/services/admin-api'

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminApi.stats()
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useAdminUsers(params?: { cursor?: string; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await adminApi.users(params)
      return res.data
    },
  })
}

export function useAdminUser(id: string | undefined) {
  return useQuery<AdminUserDetail>({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await adminApi.user(id!)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useAdminOrgs(params?: { cursor?: string; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'orgs', params],
    queryFn: async () => {
      const res = await adminApi.orgs(params)
      return res.data
    },
  })
}

export function useAdminOrg(id: string | undefined) {
  return useQuery<AdminOrgDetail>({
    queryKey: ['admin', 'orgs', id],
    queryFn: async () => {
      const res = await adminApi.org(id!)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useAdminAnalytics(days = 30) {
  return useQuery<AdminAnalytics>({
    queryKey: ['admin', 'analytics', days],
    queryFn: async () => {
      const res = await adminApi.analytics(days)
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useAdminAgents(params?: { cursor?: string; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'agents', params],
    queryFn: async () => {
      const res = await adminApi.agents(params)
      return res.data
    },
  })
}

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['admin', 'system'],
    queryFn: async () => {
      const res = await adminApi.system()
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useAdminAnnouncements(params?: { cursor?: string; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'announcements', params],
    queryFn: async () => {
      const res = await adminApi.announcements(params)
      return res.data
    },
  })
}

export function useAdminProviderKeys(params?: { cursor?: string; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'provider-keys', params],
    queryFn: async () => {
      const res = await adminApi.providerKeys(params)
      return res.data
    },
  })
}

export function useAdminBilling() {
  return useQuery<AdminBilling>({
    queryKey: ['admin', 'billing'],
    queryFn: async () => {
      const res = await adminApi.billing()
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useAdminModeration(params?: { search?: string; limit?: number; offset?: number }) {
  return useQuery<{ data: ModerationOrgConfig[]; total: number }>({
    queryKey: ['admin', 'moderation', params],
    queryFn: async () => {
      const res = await adminApi.moderationConfigs(params)
      return res.data
    },
  })
}

export function useAdminModerationViolations(params?: {
  search?: string; limit?: number; offset?: number; severity?: string; orgId?: string
}) {
  return useQuery<{ data: ModerationViolation[]; total: number }>({
    queryKey: ['admin', 'moderation-violations', params],
    queryFn: async () => {
      const res = await adminApi.moderationViolations(params)
      return res.data
    },
  })
}

export function useAuditLogs(params?: {
  action?: string; entityType?: string; actorId?: string
  dateFrom?: string; dateTo?: string; search?: string
  limit?: number; offset?: number
}) {
  return useQuery<{ data: AuditLogEntry[]; total: number }>({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const res = await adminApi.auditLogs(params)
      return res.data
    },
  })
}

export function useAdminDocFeedback() {
  return useQuery<AdminDocFeedback>({
    queryKey: ['admin', 'docs-feedback'],
    queryFn: async () => {
      const res = await adminApi.docsFeedback()
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useAdminPlans() {
  return useQuery<AdminPlan[]>({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await adminApi.plans()
      return res.data.data
    },
  })
}
