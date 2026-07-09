import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const conversationStatuses = ['active', 'waiting', 'resolved', 'closed', 'archived'] as const
type ConversationStatus = (typeof conversationStatuses)[number]

const validTransitions: Record<ConversationStatus, ConversationStatus[]> = {
  active: ['waiting', 'resolved', 'closed', 'archived'],
  waiting: ['active', 'resolved', 'closed', 'archived'],
  resolved: ['closed', 'archived'],
  closed: ['active', 'archived'],
  archived: [],
}

const channels = ['web', 'api', 'whatsapp', 'slack', 'discord', 'telegram'] as const

const agentParamsSchema = z.object({
  agentId: z.string().uuid(),
})

const convParamsSchema = z.object({
  id: z.string().uuid(),
})

const conversationsQuerySchema = z.object({
  status: z.enum(conversationStatuses).optional(),
  agentId: z.string().uuid().optional(),
  channel: z.enum(channels).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const agentConversationsQuerySchema = z.object({
  status: z.enum(conversationStatuses).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const createConversationBodySchema = z.object({
  userId: z.string().optional(),
  channel: z.enum(channels).default('web'),
})

const updateConversationBodySchema = z.object({
  status: z.enum(conversationStatuses).optional(),
})

const widgetConversationBodySchema = z.object({
  visitorId: z.string().min(1).max(100).optional(),
  channel: z.enum(channels).default('web'),
})

export default async function conversationsRoutes(fastify: FastifyInstance) {
  // POST /api/agents/:agentId/conversations — Create conversation (protected, member only)
  fastify.post('/agents/:agentId/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: createConversationBodySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { userId, channel } = request.body as { userId?: string; channel: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const conversation = await prisma.conversation.create({
      data: { agentId, userId: userId || request.userId, channel },
    })

    let userName: string | undefined
    if (conversation.userId) {
      const profile = await prisma.profile.findUnique({ where: { id: conversation.userId }, select: { name: true } })
      userName = profile?.name || undefined
    }

    return { data: { ...conversation, userName } }
  })

  // GET /api/conversations — List conversations across user's orgs (protected, with filters)
  fastify.get('/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ query: conversationsQuerySchema }),
    ],
  }, async (request) => {
    const { status, agentId, channel, cursor, limit } = request.query as {
      status?: ConversationStatus
      agentId?: string
      channel?: string
      cursor?: string
      limit: number
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: request.userId },
      select: { organizationId: true },
    })

    const orgIds = memberships.map((m) => m.organizationId)

    const where: Record<string, unknown> = {
      agent: { organizationId: { in: orgIds } },
    }
    if (status) where.status = status
    if (agentId) where.agentId = agentId
    if (channel) where.channel = channel

    const conversations = await prisma.conversation.findMany({
      where: where as any,
      include: {
        agent: { select: { id: true, name: true, avatar: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
    })

    const hasNextPage = conversations.length > limit
    const items = hasNextPage ? conversations.slice(0, limit) : conversations

    // Enrich with user names
    const userIds = [...new Set(items.map((c) => c.userId).filter(Boolean))] as string[]
    const profiles = userIds.length > 0
      ? await prisma.profile.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const profileMap = new Map(profiles.map((p) => [p.id, p.name]))

    const enriched = items.map((c) => ({
      ...c,
      userName: c.userId ? (profileMap.get(c.userId) || undefined) : undefined,
    }))

    return {
      data: enriched,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/agents/:agentId/conversations — List conversations for a specific agent (protected, member only)
  fastify.get('/agents/:agentId/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, query: agentConversationsQuerySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { status, cursor, limit } = request.query as {
      status?: ConversationStatus
      cursor?: string
      limit: number
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const where: Record<string, unknown> = { agentId }
    if (status) where.status = status

    const conversations = await prisma.conversation.findMany({
      where: where as any,
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
    })

    const hasNextPage = conversations.length > limit
    const items = hasNextPage ? conversations.slice(0, limit) : conversations

    const userIds = [...new Set(items.map((c) => c.userId).filter(Boolean))] as string[]
    const profiles = userIds.length > 0
      ? await prisma.profile.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const profileMap = new Map(profiles.map((p) => [p.id, p.name]))

    const enriched = items.map((c) => ({
      ...c,
      userName: c.userId ? (profileMap.get(c.userId) || undefined) : undefined,
    }))

    return {
      data: enriched,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/conversations/:id — Get conversation by ID (protected, member only, include messages)
  fastify.get('/conversations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, avatar: true, organizationId: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await fastify.getMembership(request.userId!, conversation.agent.organizationId)

    let userName: string | undefined
    if (conversation.userId) {
      const profile = await prisma.profile.findUnique({ where: { id: conversation.userId }, select: { name: true } })
      userName = profile?.name || undefined
    }

    return { data: { ...conversation, userName } }
  })

  // PATCH /api/conversations/:id — Update conversation (protected, member only)
  fastify.patch('/conversations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, body: updateConversationBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status?: ConversationStatus }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await fastify.getMembership(request.userId!, conversation.agent.organizationId)

    if (status) {
      const currentStatus = conversation.status as ConversationStatus
      const allowed = validTransitions[currentStatus]

      if (!allowed.includes(status)) {
        throw new AppError(
          400,
          `Invalid status transition from '${currentStatus}' to '${status}'`,
          'INVALID_TRANSITION',
        )
      }
    }

    const data: Record<string, unknown> = {}
    if (status) data.status = status

    const updated = await prisma.conversation.update({
      where: { id },
      data,
    })

    return { data: updated }
  })

  // DELETE /api/conversations/:id — Delete conversation (protected, admin only)
  fastify.delete('/conversations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await fastify.ensureAdmin(request.userId!, conversation.agent.organizationId)

    await prisma.conversation.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/widget/agents/:agentId/conversations — Public widget endpoint (rate-limited)
  fastify.post('/widget/agents/:agentId/conversations', {
    preHandler: [validate({ params: agentParamsSchema, body: widgetConversationBodySchema })],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { visitorId } = request.body as { visitorId?: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent || agent.status !== 'active') {
      throw new AppError(404, 'Agent not found or is not active')
    }

    const conversation = await prisma.conversation.create({
      data: {
        agentId,
        userId: visitorId || null,
        channel: 'web',
      },
    })

    return { data: conversation }
  })
}
