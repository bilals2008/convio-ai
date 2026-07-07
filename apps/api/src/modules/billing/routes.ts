import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const dateRangeQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
})

export default async function billingRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/billing/usage — Current month usage
  fastify.get('/organizations/:orgId/billing/usage', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { month, year } = request.query as { month?: number; year?: number }

    await fastify.getMembership(request.userId!, orgId)

    const now = new Date()
    const targetMonth = month ?? now.getMonth() + 1
    const targetYear = year ?? now.getFullYear()

    const firstDay = new Date(targetYear, targetMonth - 1, 1)
    const lastDay = new Date(targetYear, targetMonth, 0)

    const analytics = await prisma.analytics.findMany({
      where: {
        bot: { organizationId: orgId },
        date: { gte: firstDay, lte: lastDay },
      },
    })

    const conversations = analytics.reduce((sum, r) => sum + r.totalConversations, 0)
    const messages = analytics.reduce((sum, r) => sum + r.totalMessages, 0)

    return {
      data: {
        month: targetMonth,
        year: targetYear,
        conversations,
        messages,
      },
    }
  })

  // GET /api/organizations/:orgId/billing/plan — Current plan info
  fastify.get('/organizations/:orgId/billing/plan', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true, createdAt: true },
    })

    if (!org) throw new AppError(404, 'Organization not found')

    const plans: Record<string, {
      name: string
      features: string[]
      limits: Record<string, number>
      price: string
    }> = {
      free: {
        name: 'Free',
        features: ['5 chatbots', '1,000 messages/mo', 'Web widget', 'Basic analytics'],
        limits: { chatbots: 5, messagesPerMonth: 1000 },
        price: '$0',
      },
      pro: {
        name: 'Pro',
        features: ['Unlimited chatbots', '50,000 messages/mo', 'Multi-channel', 'Advanced analytics', 'Custom branding'],
        limits: { chatbots: Infinity, messagesPerMonth: 50000 },
        price: '$29/mo',
      },
      enterprise: {
        name: 'Enterprise',
        features: ['Everything in Pro', 'Unlimited messages', 'SSO', 'Dedicated support', 'SLA'],
        limits: { chatbots: Infinity, messagesPerMonth: Infinity },
        price: 'Custom',
      },
    }

    const plan = plans[org.plan] || plans.free

    return {
      data: {
        plan: org.plan,
        name: plan.name,
        features: plan.features,
        limits: plan.limits,
        price: plan.price,
        since: org.createdAt,
      },
    }
  })

  // POST /api/organizations/:orgId/billing/checkout — Create checkout session (placeholder)
  fastify.post('/organizations/:orgId/billing/checkout', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    return {
      data: {
        message: 'Payment integration coming soon.',
        checkoutUrl: null,
      },
    }
  })

  // POST /api/organizations/:orgId/billing/webhook — Handle payment webhook (placeholder)
  fastify.post('/organizations/:orgId/billing/webhook', {
    preHandler: [validate({ params: orgParamsSchema })],
  }, async () => {
    return { data: { received: true } }
  })

  // GET /api/organizations/:orgId/billing/invoices — List past invoices (placeholder)
  fastify.get('/organizations/:orgId/billing/invoices', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    return { data: [] }
  })
}
