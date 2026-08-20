import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'

export function useOrgAnalytics(orgId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', orgId, from, to],
    queryFn: async () => {
      const res = await analyticsApi.overview(orgId!, { from, to })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
    placeholderData: keepPreviousData,
  })
}

export function useAgentAnalytics(agentId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['agent-analytics', agentId, from, to],
    queryFn: async () => {
      const res = await analyticsApi.agent(agentId!, { from, to })
      return res.data.data
    },
    enabled: !!agentId,
    retry: false,
  })
}

export function useTopDocuments(orgId: string | undefined) {
  return useQuery({
    queryKey: ['top-documents', orgId],
    queryFn: async () => {
      const res = await analyticsApi.topDocuments(orgId!, { limit: 10 })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
  })
}

export function useTopAgents(orgId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['top-agents', orgId, from, to],
    queryFn: async () => {
      const res = await analyticsApi.topAgents(orgId!, { from, to })
      return res.data.data
    },
    enabled: !!orgId,
    retry: false,
  })
}
