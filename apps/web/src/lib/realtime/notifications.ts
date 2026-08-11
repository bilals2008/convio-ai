import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { queryKeys } from '@/lib/hooks/use-notifications'

export interface RealtimeNotificationEvent {
  id: string
  type: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  message?: string | null
  actionUrl?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

const CHANNEL_NAME = 'convio:notifications'

function broadcastChanged() {
  try {
    new BroadcastChannel(CHANNEL_NAME).postMessage({ type: 'changed' })
  } catch {}
}

function setupBroadcastChannel(invalidateUnread: () => void): BroadcastChannel | null {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === 'changed') invalidateUnread()
    }
    return channel
  } catch {
    return null
  }
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
}

// ponytail: SSE via fetch streaming so the Authorization header can be sent
// (EventSource cannot set headers). Reconnects with backoff on its own.
function connectNotificationStream(
  url: string,
  onEvent: (event: RealtimeNotificationEvent) => void
): () => void {
  let controller: AbortController | null = null
  let timer: number | undefined
  let closed = false
  let retryDelay = 2000

  const connect = async () => {
    if (closed) return
    controller = new AbortController()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token || closed) return

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error(`SSE connection failed: ${res.status}`)

      retryDelay = 2000
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done || closed) break
        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''
        for (const frame of frames) {
          const line = frame.split('\n').find((l) => l.startsWith('data: '))
          if (!line) continue
          const payload = line.slice(6)
          if (payload === ': ping' || !payload) continue
          try {
            onEvent(JSON.parse(payload) as RealtimeNotificationEvent)
          } catch {}
        }
      }
    } catch {
      if (!closed) {
        timer = window.setTimeout(() => void connect(), retryDelay)
        retryDelay = Math.min(retryDelay * 2, 30_000)
      }
    }
  }

  void connect()

  return () => {
    closed = true
    controller?.abort()
    if (timer) window.clearTimeout(timer)
  }
}

export function useNotificationStream({ orgId, enabled = true }: { orgId?: string; enabled?: boolean }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orgId || !enabled) return

    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.unread(orgId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(orgId) })
    }

    const channel = setupBroadcastChannel(() =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.unread(orgId) })
    )

    const disconnect = connectNotificationStream(
      `${getApiBaseUrl()}/notifications/stream`,
      (event) => {
        invalidate()
        broadcastChanged()
        if (event.priority === 'high' || event.priority === 'critical') {
          toast.info(event.title)
        }
      }
    )

    return () => {
      disconnect()
      channel?.close()
      broadcastChanged()
    }
  }, [orgId, enabled, queryClient])
}