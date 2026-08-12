import { useQuery } from '@tanstack/react-query'
import { chat as chatApi } from '@/lib/api'

export interface AvailableModel {
  id: string
  name: string
  provider?: string
}

export function useAvailableModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await chatApi.models()
      const items = (response.data.data ?? []) as AvailableModel[]
      return [...new Map(items.map((m) => [m.id, m])).values()]
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
