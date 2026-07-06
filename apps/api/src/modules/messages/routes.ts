import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const convParamsSchema = z.object({
  id: z.string().uuid(),
})

const messageParamsSchema = z.object({
  id: z.string().uuid(),
})

const messagesQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const createMessageBodySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
})

const updateMessageBodySchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  metadata: z.record(z.unknown()).optional(),
})

const widgetMessageBodySchema = z.object({
  content: z.string().min(1).max(10000),
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

async function getConversationOrgId(conversationId: string): Promise<string> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { bot: { select: { organizationId: true } } },
  })

  if (!conversation) {
    throw new AppError(404, 'Conversation not found')
  }

  return conversation.bot.organizationId
}

export default async function messagesRoutes(fastify: FastifyInstance) {
  // POST /api/conversations/:id/messages — Add message (protected, member only)
  fastify.post('/conversations/:id/messages', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, body: createMessageBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { role, content } = request.body as { role: 'user' | 'assistant'; content: string }

    const orgId = await getConversationOrgId(id)
    await getMembership(request.userId!, orgId)

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: id, role, content, status: 'sent' },
      }),
      prisma.conversation.update({
        where: { id },
        data: { status: 'active' },
      }),
    ])

    return { data: message }
  })

  // GET /api/conversations/:id/messages — List messages (protected, member only, paginated, oldest-first)
  fastify.get('/conversations/:id/messages', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, query: messagesQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const orgId = await getConversationOrgId(id)
    await getMembership(request.userId!, orgId)

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
    })

    const hasNextPage = messages.length > limit
    const items = hasNextPage ? messages.slice(0, limit) : messages

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // PATCH /api/messages/:id — Edit message content or metadata (protected, admin only)
  fastify.patch('/messages/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: messageParamsSchema, body: updateMessageBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: { include: { bot: { select: { organizationId: true } } } },
      },
    })

    if (!message) throw new AppError(404, 'Message not found')

    await requireAdmin(request.userId!, message.conversation.bot.organizationId)

    const updated = await prisma.message.update({
      where: { id },
      data: request.body as any,
    })

    return { data: updated }
  })

  // DELETE /api/messages/:id — Delete message (protected, admin only)
  fastify.delete('/messages/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: messageParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: { include: { bot: { select: { organizationId: true } } } },
      },
    })

    if (!message) throw new AppError(404, 'Message not found')

    await requireAdmin(request.userId!, message.conversation.bot.organizationId)

    await prisma.message.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/widget/conversations/:id/messages — Widget message (public, rate-limited)
  fastify.post('/widget/conversations/:id/messages', {
    preHandler: [validate({ params: convParamsSchema, body: widgetMessageBodySchema })],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { content } = request.body as { content: string }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { bot: { select: { status: true } } },
    })

    if (!conversation || conversation.bot.status !== 'active') {
      throw new AppError(404, 'Conversation not found or bot is not active')
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: id, role: 'user', content, status: 'sent' },
      }),
      prisma.conversation.update({
        where: { id },
        data: { status: 'active' },
      }),
    ])

    return { data: message }
  })
}
