import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminDocsAssistantConfig } from '@/admin/services/admin-api'

export function useDocsAssistantConfig() {
  return useQuery({
    queryKey: ['admin', 'docs-assistant', 'config'],
    queryFn: async () => {
      const res = await adminApi.docsAssistant.config()
      return res.data.data as AdminDocsAssistantConfig
    },
    staleTime: 30_000,
  })
}

export function useDocsAssistantModels(provider: string, apiKey: string, enabled: boolean, refreshKey: number) {
  return useQuery({
    queryKey: ['admin', 'docs-assistant', 'models', provider, refreshKey],
    queryFn: async () => {
      const res = await adminApi.docsAssistant.models({ provider, apiKey: apiKey || undefined })
      return res.data.data
    },
    enabled: !!provider && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useSaveDocsAssistantConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { provider: string; model: string; apiKey?: string }) =>
      adminApi.docsAssistant.saveConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'docs-assistant', 'config'] })
    },
  })
}

export function useTestDocsAssistantConfig() {
  return useMutation({
    mutationFn: (data: { provider: string; model: string; apiKey?: string }) =>
      adminApi.docsAssistant.testConfig(data),
  })
}
