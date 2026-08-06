import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { NotificationCategory, NotificationPriority, NotificationStatus } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { isPlatformAdmin } from '../../plugins/admin.js'
import { NOTIFICATION_EVENTS } from '../../services/notifications/events.js'

const listQuerySchema = z.object({
  status: z.union([z.enum(['unread', 'read', 'archived']), z.literal('all')]).transform((v) => (v === 'all' ? undefined : v)).optional(),
  category: z.union([z.enum(Object.values(NotificationCategory) as [string, ...string[]]), z.literal('all')]).transform((v) => (v === 'all' ? undefined : v)).optional(),
  priority: z.union([z.enum(Object.values(NotificationPriority) as [string, ...string[]]), z.literal('all')]).transform((v) => (v === 'all' ? undefined : v)).optional(),
  search: z.string().max(100).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
})

const preferenceBodySchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  digestFrequency: z.enum(['never', 'daily', 'weekly']).optional(),
  quietHours: z.object({ start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) }).optional(),
  categorySettings: z.record(z.object({ email: z.boolean().optional(), inApp: z.boolean().optional() })).optional(),
  muteAll: z.boolean().optional(),
})

const broadcastBodySchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
  type: z.enum([
    NOTIFICATION_EVENTS.PLATFORM_UPDATE,
    NOTIFICATION_EVENTS.NEW_FEATURE,
    NOTIFICATION_EVENTS.MAINTENANCE,
    NOTIFICATION_EVENTS.SECURITY_ALERT,
    NOTIFICATION_EVENTS.INCIDENT,
    NOTIFICATION_EVENTS.DOWNTIME,
  ]).default(NOTIFICATION_EVENTS.PLATFORM_UPDATE),
  priority: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('low'),
  category: z.enum(['system']).default('system'),
  actionUrl: z.string().max(500).optional(),
  expiresAt: z.coerce.date().optional(),
})

export default async function notificationsRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/notifications', {
    preHandler: [fastify.authenticate, fastify.requirePermission('notification.read'), validate({
      params: z.object({ orgId: z.string().uuid() }),
      query: listQuerySchema,
    })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const query = request.query as z.infer<typeof listQuerySchema>
    return fastify.notifications.list(request.userId!, {
      orgId,
      status: query.status as NotificationStatus | undefined,
      category: query.category as NotificationCategory | undefined,
      priority: query.priority as NotificationPriority | undefined,
      search: query.search,
      cursor: query.cursor,
      limit: query.limit,
    })
  })

  fastify.get('/organizations/:orgId/notifications/unread-count', {
    preHandler: [fastify.authenticate, fastify.requirePermission('notification.read'), validate({
      params: z.object({ orgId: z.string().uuid() }),
    })],
  }, async (request) => {
    return fastify.notifications.unreadCount(request.userId!)
  })

  fastify.post('/organizations/:orgId/notifications/read-all', {
    preHandler: [fastify.authenticate, fastify.requirePermission('notification.manage'), validate({
      params: z.object({ orgId: z.string().uuid() }),
    })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const count = await fastify.notifications.markAllRead(request.userId!, orgId)
    return { count }
  })

  fastify.post('/organizations/:orgId/notifications/:id/read', {
    preHandler: [fastify.authenticate, fastify.requirePermission('notification.manage'), validate({
      params: z.object({ orgId: z.string().uuid(), id: z.string().uuid() }),
    })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const changed = await fastify.notifications.markRead(request.userId!, id)
    if (!changed) throw new AppError(404, 'Notification not found', 'NOT_FOUND')
    return { ok: true }
  })

  fastify.post('/organizations/:orgId/notifications/:id/archive', {
    preHandler: [fastify.authenticate, fastify.requirePermission('notification.manage'), validate({
      params: z.object({ orgId: z.string().uuid(), id: z.string().uuid() }),
    })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const changed = await fastify.notifications.archive(request.userId!, id)
    if (!changed) throw new AppError(404, 'Notification not found', 'NOT_FOUND')
    return { ok: true }
  })

  fastify.get('/notifications/preferences', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    return fastify.notifications.getPreferences(request.userId!)
  })

  fastify.put('/notifications/preferences', {
    preHandler: [fastify.authenticate, validate({ body: preferenceBodySchema })],
  }, async (request) => {
    const body = request.body as z.infer<typeof preferenceBodySchema>
    return fastify.notifications.updatePreferences(request.userId!, body)
  })

  fastify.post('/admin/notifications/broadcast', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: broadcastBodySchema })],
  }, async (request) => {
    const body = request.body as z.infer<typeof broadcastBodySchema>
    const count = await fastify.notifications.broadcastSystem({
      type: body.type,
      category: body.category,
      priority: body.priority,
      title: body.title,
      message: body.message,
      actionUrl: body.actionUrl,
      expiresAt: body.expiresAt,
      metadata: { summary: body.message },
    })
    return { delivered: count }
  })

  fastify.post('/admin/notifications/send', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({
      body: broadcastBodySchema.extend({ email: z.string().email() }),
    })],
  }, async (request) => {
    const body = request.body as z.infer<typeof broadcastBodySchema> & { email: string }
    const sent = await fastify.notifications.sendToUser(body.email, {
      type: body.type,
      category: body.category,
      priority: body.priority,
      title: body.title,
      message: body.message,
      actionUrl: body.actionUrl,
      expiresAt: body.expiresAt,
      metadata: { summary: body.message },
    })
    if (!sent) throw new AppError(404, 'No user found with that email', 'USER_NOT_FOUND')
    return { ok: true }
  })

  void fastify
}
