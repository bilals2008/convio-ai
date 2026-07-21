import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { checkAgentLimit, checkMessageLimit, checkOrgLimit } from '../services/billing.js'
import { AppError } from './error.js'

declare module 'fastify' {
  interface FastifyInstance {
    checkAgentLimit: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    checkMessageLimit: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    checkOrgLimit: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async function billingLimitsPlugin(fastify: FastifyInstance) {
  fastify.decorate('checkAgentLimit', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.params as { orgId?: string }
    if (!orgId) {
      throw new AppError(400, 'Missing organization ID', 'BAD_REQUEST')
    }

    const { allowed, current, limit } = await checkAgentLimit(orgId)
    if (!allowed) {
      throw new AppError(
        402,
        `Agent limit (${limit}) reached. You have ${current} agents. Upgrade your plan to create more.`,
        'PLAN_LIMIT_EXCEEDED',
      )
    }
  })

  fastify.decorate('checkMessageLimit', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.params as { orgId?: string }
    if (!orgId) {
      throw new AppError(400, 'Missing organization ID', 'BAD_REQUEST')
    }

    const { allowed, current, limit } = await checkMessageLimit(orgId)
    if (!allowed) {
      throw new AppError(
        402,
        `Monthly message limit (${limit.toLocaleString()}) reached. You've used ${current.toLocaleString()} messages this month. Upgrade your plan to continue.`,
        'PLAN_LIMIT_EXCEEDED',
      )
    }
  })
  fastify.decorate('checkOrgLimit', async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.userId
    if (!userId) {
      throw new AppError(401, 'Not authenticated', 'UNAUTHORIZED')
    }

    const { allowed, current, limit } = await checkOrgLimit(userId)
    if (!allowed) {
      throw new AppError(
        402,
        `Organization limit (${limit}) reached. You have ${current} organization${current === 1 ? '' : 's'}. Upgrade your plan to create more.`,
        'PLAN_LIMIT_EXCEEDED',
      )
    }
  })

}, {
  name: 'billing-limits',
  dependencies: ['auth', 'membership'],
})
