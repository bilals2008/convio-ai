import { useQuery } from '@tanstack/react-query'
import { apiKeys as apiKeysClient } from '@/lib/api'

export interface ApiKey {
  id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsedAt?: string
}

export function useApiKeys(orgId?: string) {
  return useQuery({
    queryKey: ['api-keys', orgId],
    queryFn: async () => (await apiKeysClient.list(orgId!)).data.data as ApiKey[],
    enabled: Boolean(orgId),
  })
}
