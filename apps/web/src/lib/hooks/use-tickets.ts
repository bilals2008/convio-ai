import { useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tickets as ticketsApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
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

export interface TicketPerson {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

export interface TicketMessage {
  id: string
  authorId: string
  content: string
  isInternalNote: boolean
  createdAt: string
  author: TicketPerson
}

export interface TicketDetail {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  isReporter?: boolean
  reporter: TicketPerson
  organization?: { id: string; name: string; slug: string }
  messages: TicketMessage[]
}

export const ticketKeys = {
  list: (orgId: string, filters: Record<string, unknown> = {}) => ['tickets', orgId, filters] as const,
  detail: (ticketId: string) => ['tickets', 'detail', ticketId] as const,
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

export function useTicket(orgId: string | undefined, ticketId: string | undefined) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId ?? 'none'),
    queryFn: async () => {
      const res = await ticketsApi.detail(orgId!, ticketId!)
      return res.data.data as TicketDetail
    },
    enabled: !!orgId && !!ticketId,
  })
}

export function useTicketRealtime(ticketId: string | undefined) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!ticketId) return
    const channel = supabase.channel(`ticket:${ticketId}`, {
      config: { broadcast: { self: false } },
    })
    channel.on('broadcast', { event: 'message' }, () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
    })
    channel.on('broadcast', { event: 'changed' }, () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
    })
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, queryClient])
}

function broadcastTicket(ticketId: string, event: 'message' | 'changed') {
  try {
    supabase.channel(`ticket:${ticketId}`).send({ type: 'broadcast', event, payload: {} })
  } catch {}
}

export function useSendTicketMessage(orgId: string | undefined, ticketId: string, currentUser?: TicketPerson) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      ticketsApi.sendMessage(orgId!, ticketId, { content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) })
      const prev = queryClient.getQueryData<TicketDetail>(ticketKeys.detail(ticketId))
      if (prev) {
        const optimistic: TicketMessage = {
          id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          authorId: currentUser?.id ?? '',
          content,
          isInternalNote: false,
          createdAt: new Date().toISOString(),
          author: currentUser ?? { id: '', name: 'You', email: '', avatar: null },
        }
        queryClient.setQueryData<TicketDetail>(ticketKeys.detail(ticketId), {
          ...prev,
          messages: [...prev.messages, optimistic],
        })
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ticketKeys.detail(ticketId), ctx.prev)
      toast.error('Failed to send message')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
      broadcastTicket(ticketId, 'message')
    },
  })
}

export function useUpdateTicket(orgId: string | undefined, ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { status?: string; priority?: string }) =>
      ticketsApi.update(orgId!, ticketId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      broadcastTicket(ticketId, 'changed')
      toast.success(`Status: ${res.data.data.status}`)
    },
    onError: (err: { friendlyMessage?: string }) => toast.error(err.friendlyMessage || 'Failed to update ticket'),
  })
}
