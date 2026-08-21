import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export interface TicketAttachment {
  name: string
  size: number
  type: string
  path: string
}

export interface TicketMessage {
  id: string
  content: string
  attachments: TicketAttachment[]
  createdAt: string
  author: { id: string; name: string | null; email: string; avatar: string | null }
}

export interface TicketRead {
  userId: string
  lastReadAt: string
}

export interface TicketDetail extends TicketSummary {
  description: string
  reporter: { id: string; name: string | null; email: string; avatar: string | null }
  reads: TicketRead[]
  messages: TicketMessage[]
}

export const ticketKeys = {
  list: (orgId: string, filters: Record<string, unknown> = {}) => ['tickets', orgId, filters] as const,
  detail: (orgId: string, ticketId: string) => ['tickets', orgId, ticketId] as const,
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

export function useTicket(orgId: string | undefined, ticketId: string | undefined) {
  return useQuery({
    queryKey: ticketKeys.detail(orgId ?? 'none', ticketId ?? 'none'),
    queryFn: async () => {
      const res = await ticketsApi.get(orgId!, ticketId!)
      return res.data.data as TicketDetail
    },
    enabled: !!orgId && !!ticketId,
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

export function useReplyTicket(orgId: string | undefined, ticketId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; attachments?: TicketAttachment[] }) =>
      ticketsApi.reply(orgId!, ticketId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(orgId!, ticketId!) })
      queryClient.invalidateQueries({ queryKey: ['tickets', orgId] })
    },
    onError: (err: { friendlyMessage?: string }) => toast.error(err.friendlyMessage || 'Failed to send message'),
  })
}

export function useMarkTicketRead(orgId: string | undefined, ticketId: string | undefined) {
  return useMutation({
    mutationFn: () => ticketsApi.markRead(orgId!, ticketId!),
    retry: 1,
  })
}

export function useUpdateTicketStatus(orgId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      ticketsApi.updateStatus(orgId!, ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', orgId] })
      toast.success('Ticket updated')
    },
    onError: (err: { friendlyMessage?: string }) => toast.error(err.friendlyMessage || 'Failed to update ticket'),
  })
}