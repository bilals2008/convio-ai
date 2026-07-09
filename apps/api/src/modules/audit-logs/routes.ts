import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { auditLogQuerySchema } from '@convio/validation'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

export default async function auditLogRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/audit-logs', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: auditLogQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit, action, entityType } = request.query as {
      cursor?: string; limit: number; action?: string; entityType?: string
    }

    const where: Record<string, unknown> = { organizationId: orgId }
    if (action) where.action = action
    if (entityType) where.entityType = entityType

    const logs = await prisma.auditLog.findMany({
      where: where as any,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = logs.length > limit
    const items = hasNextPage ? logs.slice(0, limit) : logs

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })
}
