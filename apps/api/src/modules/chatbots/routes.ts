import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const botStatuses = ['draft', 'active', 'paused', 'archived'] as const
type BotStatus = (typeof botStatuses)[number]

const validTransitions: Record<BotStatus, BotStatus[]> = {
  draft: ['active', 'archived'],
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
}

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const botParamsSchema = z.object({
  id: z.string().uuid(),
})

const botsQuerySchema = z.object({
  status: z.enum(botStatuses).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const createBotBodySchema = z.object({
  agentId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional().nullable().transform((v) => v || null),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  welcomeMessage: z.string().max(500).optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
})

const updateBotBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  status: z.enum(botStatuses).optional(),
  agentId: z.string().uuid().optional(),
})

const updateStatusBodySchema = z.object({
  status: z.enum(botStatuses),
})

export default async function chatbotsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/bots — Create bot (member only)
  fastify.post('/organizations/:orgId/bots', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createBotBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { agentId, name, description, avatar, widgetColor, welcomeMessage } = request.body as {
      agentId: string
      name: string
      description?: string
      avatar?: string
      widgetColor: string
      welcomeMessage?: string
    }

    await fastify.getMembership(request.userId!, orgId)

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent || agent.organizationId !== orgId) {
      throw new AppError(400, 'Agent not found in this organization')
    }

    const bot = await prisma.bot.create({
      data: {
        organizationId: orgId,
        agentId,
        createdById: request.userId,
        name,
        description,
        avatar,
        widgetColor,
        welcomeMessage,
        status: 'draft',
      },
      include: { agent: true },
    })

    return { data: bot }
  })

  // GET /api/organizations/:orgId/bots — List bots (member only, status filter, cursor pagination)
  fastify.get('/organizations/:orgId/bots', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: botsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { status, cursor, limit } = request.query as {
      status?: BotStatus
      cursor?: string
      limit: number
    }

    await fastify.getMembership(request.userId!, orgId)

    const where: Record<string, unknown> = { organizationId: orgId }
    if (status) where.status = status

    const bots = await prisma.bot.findMany({
      where: where as any,
      include: { agent: { select: { id: true, name: true, model: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = bots.length > limit
    const items = hasNextPage ? bots.slice(0, limit) : bots

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/bots/:id — Get bot by ID (member only, include agent + integrations)
  fastify.get('/bots/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const bot = await prisma.bot.findUnique({
      where: { id },
      include: {
        agent: true,
        integrations: true,
      },
    })

    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    return { data: bot }
  })

  // PATCH /api/bots/:id — Update bot metadata (member only)
  fastify.patch('/bots/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, body: updateBotBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const bot = await prisma.bot.update({
      where: { id },
      data: request.body as any,
    })

    return { data: bot }
  })

  // DELETE /api/bots/:id — Delete bot (admin only)
  fastify.delete('/bots/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Bot not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    await prisma.bot.delete({ where: { id } })
    reply.code(204).send()
  })

  // PATCH /api/bots/:id/status — Change bot status (admin only, validates transitions)
  fastify.patch('/bots/:id/status', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, body: updateStatusBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: BotStatus }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Bot not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const currentStatus = existing.status as BotStatus
    const allowed = validTransitions[currentStatus]

    if (!allowed.includes(status)) {
      throw new AppError(
        400,
        `Invalid status transition from '${currentStatus}' to '${status}'`,
        'INVALID_TRANSITION',
      )
    }

    const bot = await prisma.bot.update({
      where: { id },
      data: { status },
    })

    return { data: bot }
  })

  // GET /api/bots/:id/embed — Get embed snippet (member only)
  fastify.get('/bots/:id/embed', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'
    const snippet = `<script src="${baseUrl}/widget.js" data-bot-id="${id}"></script>\n<div id="convio-widget" data-bot-id="${id}"></div>`

    return { data: { snippet } }
  })
}
