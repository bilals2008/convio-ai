import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { validate } from '../../plugins/validate.js'
import {
  orgParamsSchema,
  agentParamsSchema,
  dateRangeQuerySchema,
  topAgentsQuerySchema,
  topDocsQuerySchema,
  snapshotBodySchema,
} from './analytics.schema.js'
import * as service from './analytics.service.js'

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/analytics — Org-wide aggregate analytics
  fastify.get('/organizations/:orgId/analytics', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to } = request.query as { from?: string; to?: string }
    const data = await service.getOrgAnalytics(orgId, from, to)
    return { data }
  })

  // GET /api/agents/:agentId/analytics — Single agent aggregate analytics
  fastify.get('/agents/:agentId/analytics', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)

    const data = await service.getAgentAnalytics(agentId, from, to)
    return { data }
  })

  // GET /api/agents/:agentId/analytics/daily — Daily breakdown for charts
  fastify.get('/agents/:agentId/analytics/daily', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)

    const data = await service.getAgentDailyBreakdown(agentId, from, to)
    return { data }
  })

  // GET /api/organizations/:orgId/analytics/top-agents — Top performing agents
  fastify.get('/organizations/:orgId/analytics/top-agents', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: topAgentsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to, limit } = request.query as { from?: string; to?: string; limit: number }
    const data = await service.getTopAgents(orgId, from, to, limit)
    return { data }
  })

  // GET /api/organizations/:orgId/analytics/top-documents — Top documents by query count
  fastify.get('/organizations/:orgId/analytics/top-documents', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: topDocsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { limit } = request.query as { limit: number }

    const rows = await prisma.$queryRawUnsafe<
      Array<{ id: string; name: string; queries: bigint; successCount: bigint }>
    >(
      `SELECT
         d."id",
         d."name",
         COUNT(dq."id")::bigint AS "queries",
         COALESCE(SUM(CASE WHEN dq."success" THEN 1 ELSE 0 END), 0)::bigint AS "successCount"
       FROM "Document" d
       JOIN "KnowledgeBase" kb ON kb."id" = d."knowledgeBaseId"
       LEFT JOIN "DocumentQuery" dq ON dq."documentId" = d."id"
       WHERE kb."organizationId" = $1
       GROUP BY d."id", d."name"
       ORDER BY "queries" DESC
       LIMIT $2`,
      orgId,
      limit,
    )

    return {
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        queries: Number(r.queries),
        successRate: Number(r.queries) > 0
          ? Math.round((Number(r.successCount) / Number(r.queries)) * 100)
          : 0,
      })),
    }
  })

  // POST /api/analytics/process — Daily snapshot aggregation (called by cron, guarded by CRON_SECRET when set)
  fastify.post('/analytics/process', async (request) => {
    const secret = process.env.CRON_SECRET
    if (secret && request.headers['x-cron-secret'] !== secret) {
      throw new AppError(403, 'Unauthorized', 'FORBIDDEN')
    }
    const result = await service.processDailySnapshots()
    return { data: result }
  })

  // POST /api/agents/:agentId/analytics/snapshot — Upsert daily analytics snapshot
  fastify.post('/agents/:agentId/analytics/snapshot', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: snapshotBodySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const body = request.body as Record<string, unknown>

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)

    const result = await service.upsertSnapshot(agentId, body as any)
    return { data: result }
  })
}
