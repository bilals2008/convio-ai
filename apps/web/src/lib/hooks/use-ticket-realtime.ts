import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/hooks/useAuth'
import { ticketKeys } from '@/lib/hooks/use-tickets'

export type ConnectionStatus = 'connecting' | 'online' | 'reconnecting'

export interface PresenceUser {
  userId: string
  name: string
  avatar: string | null
}

export interface TypingUser {
  userId: string
  name: string
}

const TYPING_TIMEOUT_MS = 4000
const TYPING_THROTTLE_MS = 2000

/**
 * Realtime wiring for one ticket conversation:
 * - new messages / ticket updates -> Postgres Changes -> refetch detail query
 * - read receipts -> Postgres Changes -> local state
 * - typing -> broadcast, presence -> channel presence
 */
export function useTicketRealtime(
  orgId: string | undefined,
  ticketId: string | undefined,
  // Query key to refetch when new rows arrive — callers with a non-standard
  // detail query key (e.g. admin) must pass their own or updates never land.
  invalidateKey?: readonly unknown[],
) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const currentUserId = session?.user.id

  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [liveReads, setLiveReads] = useState<Record<string, string>>({})

  const typingTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const lastTypingSent = useRef(0)

  const detailKey = invalidateKey ?? ticketKeys.detail(orgId, ticketId)

  useEffect(() => {
    if (!ticketId || !currentUserId || !orgId) return

    setTypingUsers([])
    setOnlineUsers([])
    setLiveReads({})
    setStatus('connecting')

    const channel = supabase.channel(`ticket:${ticketId}`, {
      config: { presence: { key: currentUserId } },
    })

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_messages',
          filter: `ticketId=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: detailKey })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_reads',
          filter: `ticketId=eq.${ticketId}`,
        },
        (payload) => {
          const row = payload.new as { userId: string; lastReadAt: string } | null
          if (row) {
            setLiveReads((prev) => ({ ...prev, [row.userId]: row.lastReadAt }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: detailKey })
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.userId === currentUserId) return
        const user = { userId: payload.userId as string, name: (payload.name as string) || 'Someone' }

        setTypingUsers((prev) => {
          const next = prev.filter((u) => u.userId !== user.userId)
          return [...next, user]
        })

        const existing = typingTimeouts.current.get(user.userId)
        if (existing) clearTimeout(existing)
        typingTimeouts.current.set(
          user.userId,
          setTimeout(() => {
            typingTimeouts.current.delete(user.userId)
            setTypingUsers((prev) => prev.filter((u) => u.userId !== user.userId))
          }, TYPING_TIMEOUT_MS)
        )
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string; name: string; avatar: string | null }>()
        const users = Object.values(state).map((metas) => metas[0])
        setOnlineUsers(users.filter((u) => !!u?.userId))
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') setStatus('online')
        else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('reconnecting')
      })

    return () => {
      supabase.removeChannel(channel)
      const timeouts = typingTimeouts.current
      for (const t of timeouts.values()) clearTimeout(t)
      timeouts.clear()
    }
  }, [ticketId, orgId, currentUserId, queryClient, detailKey])

  const notifyTyping = useCallback(() => {
    if (!session?.user || !ticketId) return
    const now = Date.now()
    // ponytail: throttle window instead of send-on-change diffing
    if (now - lastTypingSent.current < TYPING_THROTTLE_MS) return
    lastTypingSent.current = now

    const channel = supabase.channel(`ticket:${ticketId}`, {
      config: { presence: { key: session.user.id } },
    })
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: session.user.id, name: session.user.name || session.user.email },
    })
  }, [session, ticketId])

  return {
    status,
    typingUsers,
    onlineUsers,
    liveReads,
    notifyTyping,
    isOnline: status === 'online',
  }
}
