import { useQuery } from '@tanstack/react-query'
import { widgets as widgetsApi } from '@/lib/api'

export interface WidgetSummary {
  id: string
  name: string
  publicKey: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  allowedDomains: string[]
  updatedAt: string
  createdAt: string
  agent: { id: string; name: string; avatar?: string | null }
}

export function useWidgets(orgId?: string) {
  const query = useQuery({
    queryKey: ['widgets', orgId],
    queryFn: async () => (await widgetsApi.list(orgId!)).data.data as WidgetSummary[],
    enabled: Boolean(orgId),
  })
  return { ...query, widgets: query.data ?? [] }
}
