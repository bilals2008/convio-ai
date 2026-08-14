import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface OAuthStatus {
  authorized: boolean
  hasRefreshToken: boolean
  tokenExpiresAt: number | null
  lastError: string | null
}

export function useOAuthStatus(serverId: string | undefined) {
  return useQuery({
    queryKey: ['mcp-oauth-status', serverId],
    queryFn: async () => {
      const res = await api.get(`/mcp-servers/${serverId}/oauth-status`)
      return res.data.data as OAuthStatus
    },
    enabled: Boolean(serverId),
    retry: false,
    staleTime: 30 * 1000,
  })
}

export function useOAuthStatuses(serverIds: string[]) {
  return useQuery({
    queryKey: ['mcp-oauth-statuses', serverIds],
    queryFn: async () => {
      const entries = await Promise.all(
        serverIds.map(async (id) => {
          const res = await api.get(`/mcp-servers/${id}/oauth-status`)
          return [id, res.data.data as OAuthStatus] as const
        })
      )
      return new Map(entries)
    },
    enabled: serverIds.length > 0,
    retry: false,
    staleTime: 30 * 1000,
  })
}