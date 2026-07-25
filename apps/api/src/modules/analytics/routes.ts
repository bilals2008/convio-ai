import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { validate } from '../../plugins/validate.js'
import {
  orgParamsSchema,
  agentParamsSchema,
  dateRangeQuerySchema,
  topAgentsQuerySchema,
  snapshotBodySchema,
} from './analytics.schema.js'
import * as service from './analytics.service.js'

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/analytics — Org-wide aggregate analytics
  fastify.get('/organizations/:orgId/analytics', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to } = request.query as { from?: string; to?: string }
    await fastify.getMembership(request.userId!, orgId)
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
      validate({ params: orgParamsSchema, query: topAgentsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to, limit } = request.query as { from?: string; to?: string; limit: number }
    await fastify.getMembership(request.userId!, orgId)
    const data = await service.getTopAgents(orgId, from, to, limit)
    return { data }
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
