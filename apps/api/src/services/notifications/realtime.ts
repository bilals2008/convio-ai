import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    notificationsRealtime: {
      subscribe: (userId: string, reply: FastifyReply) => void
      unsubscribe: (userId: string, reply: FastifyReply) => void
      publish: (userId: string, event: RealtimeNotificationEvent) => void
      clientCount: () => number
    }
  }
}

export interface RealtimeNotificationEvent {
  id: string
  type: string
  category: string
  priority: string
  title: string
  message?: string | null
  actionUrl?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

// ponytail: in-memory per-instance hub. With multiple API instances, SSE delivery
// is per-instance only — cross-instance events still land via polling fallback
// (refetchInterval on the unread-count query). Upgrade to a Redis/Postgres pubsub
// if multi-instance live delivery becomes a requirement.
export default fp(async function notificationsRealtimePlugin(fastify: FastifyInstance) {
  const clients = new Map<string, Set<FastifyReply>>()

  fastify.decorate('notificationsRealtime', {
    subscribe(userId: string, reply: FastifyReply) {
      let set = clients.get(userId)
      if (!set) {
        set = new Set()
        clients.set(userId, set)
      }
      set.add(reply)
    },
    unsubscribe(userId: string, reply: FastifyReply) {
      const set = clients.get(userId)
      if (!set) return
      set.delete(reply)
      if (set.size === 0) clients.delete(userId)
    },
    publish(userId: string, event: RealtimeNotificationEvent) {
      const set = clients.get(userId)
      if (!set || set.size === 0) return
      const frame = `data: ${JSON.stringify(event)}\n\n`
      for (const reply of set) {
        try {
          reply.raw.write(frame)
        } catch (err) {
          fastify.log.error({ err, userId }, 'Realtime publish failed')
          reply.raw.destroy()
          set.delete(reply)
        }
      }
    },
    clientCount() {
      let count = 0
      for (const set of clients.values()) count += set.size
      return count
    },
  })

  fastify.get('/api/notifications/stream', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.userId!
    const raw = reply.raw

    reply.hijack()
    raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    raw.write(': connected\n\n')

    fastify.notificationsRealtime.subscribe(userId, reply)

    const heartbeat = setInterval(() => {
      try {
        raw.write(': ping\n\n')
      } catch {
        clearInterval(heartbeat)
      }
    }, 25000)

    request.raw.on('close', () => {
      clearInterval(heartbeat)
      fastify.notificationsRealtime.unsubscribe(userId, reply)
    })
  })
})