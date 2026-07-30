import { useQuery } from '@tanstack/react-query'
import { adminApi, type AdminStats, type AdminUserDetail, type AdminOrgDetail, type SystemHealth, type AuditLogEntry } from '@/admin/services/admin-api'

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
