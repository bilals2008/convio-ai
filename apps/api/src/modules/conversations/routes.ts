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

const botParamsSchema = z.object({
  botId: z.string().uuid(),
})

const convParamsSchema = z.object({
  id: z.string().uuid(),
})

const conversationsQuerySchema = z.object({
  status: z.enum(conversationStatuses).optional(),
  botId: z.string().uuid().optional(),
  channel: z.enum(channels).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const botConversationsQuerySchema = z.object({
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

type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

async function getMembership(userId: string, orgId: string): Promise<{ role: MembershipRole }> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })
  if (!membership) {
    throw new AppError(403, 'You do not belong to this organization', 'FORBIDDEN')
  }
  return { role: membership.role as MembershipRole }
}

async function requireAdmin(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'admin' && role !== 'owner') {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN')
  }
}

export default async function conversationsRoutes(fastify: FastifyInstance) {
  // POST /api/bots/:botId/conversations — Create conversation (protected, member only)
  fastify.post('/bots/:botId/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, body: createConversationBodySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { userId, channel } = request.body as { userId?: string; channel: string }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await getMembership(request.userId!, bot.organizationId)

    const conversation = await prisma.conversation.create({
      data: { botId, userId: userId || request.userId, channel },
    })

    return { data: conversation }
  })

  // GET /api/conversations — List conversations across user's orgs (protected, with filters)
  fastify.get('/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ query: conversationsQuerySchema }),
    ],
  }, async (request) => {
    const { status, botId, channel, cursor, limit } = request.query as {
      status?: ConversationStatus
      botId?: string
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
      bot: { organizationId: { in: orgIds } },
    }
    if (status) where.status = status
    if (botId) where.botId = botId
    if (channel) where.channel = channel

    const conversations = await prisma.conversation.findMany({
      where: where as any,
      include: {
        bot: { select: { id: true, name: true, avatar: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
    })

    const hasNextPage = conversations.length > limit
    const items = hasNextPage ? conversations.slice(0, limit) : conversations

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/bots/:botId/conversations — List conversations for a specific bot (protected, member only)
  fastify.get('/bots/:botId/conversations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, query: botConversationsQuerySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { status, cursor, limit } = request.query as {
      status?: ConversationStatus
      cursor?: string
      limit: number
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await getMembership(request.userId!, bot.organizationId)

    const where: Record<string, unknown> = { botId }
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

    return {
      data: items,
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
        bot: { select: { id: true, name: true, avatar: true, organizationId: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await getMembership(request.userId!, conversation.bot.organizationId)

    return { data: conversation }
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
      include: { bot: { select: { organizationId: true } } },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await getMembership(request.userId!, conversation.bot.organizationId)

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
      include: { bot: { select: { organizationId: true } } },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    await requireAdmin(request.userId!, conversation.bot.organizationId)

    await prisma.conversation.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/widget/bots/:botId/conversations — Public widget endpoint (rate-limited)
  fastify.post('/widget/bots/:botId/conversations', {
    preHandler: [validate({ params: botParamsSchema, body: widgetConversationBodySchema })],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { visitorId } = request.body as { visitorId?: string }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot || bot.status !== 'active') {
      throw new AppError(404, 'Bot not found or is not active')
    }

    const conversation = await prisma.conversation.create({
      data: {
        botId,
        userId: visitorId || null,
        channel: 'web',
      },
    })

    return { data: conversation }
  })
}
