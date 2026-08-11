import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { validate } from '../../plugins/validate.js'

const listQuerySchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  actorId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
})

export default async function auditLogsRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/audit-logs', {
    preHandler: [fastify.authenticate, fastify.requirePermission('audit-log.read'), validate({
      params: z.object({ orgId: z.string().uuid() }),
      query: listQuerySchema,
    })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const query = request.query as z.infer<typeof listQuerySchema>

    const where: Record<string, unknown> = { organizationId: orgId }

    if (query.action) where.action = { contains: query.action, mode: 'insensitive' }
    if (query.entityType) where.entityType = query.entityType
    if (query.actorId) where.actorId = query.actorId

    if (query.dateFrom || query.dateTo) {
      const createdAt: Record<string, Date> = {}
      if (query.dateFrom) createdAt.gte = query.dateFrom
      if (query.dateTo) createdAt.lte = query.dateTo
      where.createdAt = createdAt
    }

    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { entityType: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    const actorIds = [...new Set(items.map((l) => l.actorId).filter(Boolean))] as string[]
    const actors = actorIds.length > 0
      ? await prisma.profile.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, email: true, avatar: true },
        })
      : []
    const actorMap = new Map(actors.map((a) => [a.id, a]))

    const enriched = items.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt,
      actor: log.actorId && actorMap.has(log.actorId)
        ? { id: log.actorId, name: actorMap.get(log.actorId)!.name, email: actorMap.get(log.actorId)!.email, avatar: actorMap.get(log.actorId)!.avatar }
        : null,
    }))

    return { data: enriched, total }
  })
}
