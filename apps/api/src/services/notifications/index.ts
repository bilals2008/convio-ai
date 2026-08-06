import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { NotificationService } from './service.js'
import realtimePlugin from './realtime.js'
import { handleNotificationEvent } from './handlers.js'
import { domainEvents, NOTIFICATION_EVENTS, type NotificationEventPayload, type NotificationEventType } from './events.js'

declare module 'fastify' {
  interface FastifyInstance {
    notifications: NotificationService
    events: typeof domainEvents
    emitEvent: (event: NotificationEventType, payload: NotificationEventPayload) => void
  }
}

export default fp(async function notificationsPlugin(fastify: FastifyInstance) {
  await fastify.register(realtimePlugin)

  fastify.decorate('events', domainEvents)
  fastify.decorate('emitEvent', (event: NotificationEventType, payload: NotificationEventPayload) => {
    domainEvents.emit(event, payload)
  })

  const service = new NotificationService(fastify)
  fastify.decorate('notifications', service)

  for (const event of Object.values(NOTIFICATION_EVENTS)) {
    domainEvents.on(event, (payload: NotificationEventPayload) => {
      void handleNotificationEvent(fastify, event, payload).catch((err) => {
        fastify.log.error({ err, event }, 'Notification handler failed')
      })
    })
  }

  const sweeper = setInterval(() => {
    void service.retryFailedDeliveries().catch((err) => {
      fastify.log.error({ err }, 'Notification delivery retry sweep failed')
    })
    void service.cleanupExpired(15).catch((err) => {
      fastify.log.error({ err }, 'Notification cleanup sweep failed')
    })
  }, 5 * 60 * 1000)
  sweeper.unref?.()

  fastify.addHook('onClose', () => clearInterval(sweeper))
}, {
  name: 'notifications',
  dependencies: ['auth', 'membership'],
})
