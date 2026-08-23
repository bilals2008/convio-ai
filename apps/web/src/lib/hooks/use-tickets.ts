import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tickets as ticketsApi } from '@/lib/api'
import { toast } from '@/lib/toast'

export interface TicketSummary {
  id: string
  title: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  isReporter: boolean
  messageCount: number
}

export const ticketKeys = {
  list: (orgId: string, filters: Record<string, unknown> = {}) => ['tickets', orgId, filters] as const,
}

export function useTickets(orgId: string | undefined, filters: { status?: string } = {}) {
  return useInfiniteQuery({
    queryKey: [...ticketKeys.list(orgId ?? 'none', filters)],
    queryFn: async ({ pageParam }) => {
      const res = await ticketsApi.list(orgId!, { ...filters, cursor: pageParam ?? undefined, limit: 25 })
      return res.data
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!orgId,
  })
}

export function useCreateTicket(orgId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description: string; category: string; priority: string }) =>
      ticketsApi.create(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', orgId] })
      toast.success('Ticket created')
    },
    onError: (err: { friendlyMessage?: string }) => toast.error(err.friendlyMessage || 'Failed to create ticket'),
  })
}
