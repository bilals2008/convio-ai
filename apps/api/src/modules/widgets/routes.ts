import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const widgetParamsSchema = z.object({
  id: z.string().uuid(),
})

const widgetQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const widgetConfigSchema = z.object({
  position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#fb923c'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ffffff'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  greeting: z.string().max(200).default('Hello! How can I help you?'),
  quickReplies: z.array(z.string().max(60)).max(10).default([]),
  botName: z.string().min(1).max(50).default('Assistant'),
  botAvatar: z.string().url().optional(),
})

const createWidgetBodySchema = z.object({
  name: z.string().min(1).max(100),
  agentId: z.string().uuid(),
  config: widgetConfigSchema.default({}),
})

const updateWidgetBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: widgetConfigSchema.partial().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
})

export default async function widgetsRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/widgets — List all widgets
  fastify.get('/organizations/:orgId/widgets', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: widgetQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    await fastify.getMembership(request.userId!, orgId)

    const widgets = await prisma.bot.findMany({
      where: { organizationId: orgId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = widgets.length > limit
    const items = hasNextPage ? widgets.slice(0, limit) : widgets

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // POST /api/organizations/:orgId/widgets — Create widget (creates bot + widget config)
  fastify.post('/organizations/:orgId/widgets', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createWidgetBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { name, agentId, config } = request.body as {
      name: string
      agentId: string
      config: {
        position: string
        primaryColor: string
        backgroundColor: string
        textColor: string
        greeting: string
        quickReplies: string[]
        botName: string
        botAvatar?: string
      }
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
        widgetColor: config.primaryColor,
        welcomeMessage: config.greeting,
        widgetConfig: config as any,
        status: 'draft',
      },
    })

    return { data: bot }
  })

  // GET /api/widgets/:id — Get widget config (public, for embed)
  fastify.get('/widgets/:id', {
    preHandler: [validate({ params: widgetParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const bot = await prisma.bot.findUnique({ where: { id } })

    if (!bot || !bot.widgetConfig || bot.status !== 'active') {
      throw new AppError(404, 'Widget not found or is not active')
    }

    return {
      data: {
        id: bot.id,
        name: bot.name,
        welcomeMessage: bot.welcomeMessage,
        widgetConfig: bot.widgetConfig,
      },
    }
  })

  // PATCH /api/widgets/:id — Update widget config
  fastify.patch('/widgets/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: widgetParamsSchema, body: updateWidgetBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as {
      name?: string
      config?: Record<string, unknown>
      status?: string
    }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Widget not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const data: Record<string, unknown> = {}
    if (body.name) data.name = body.name
    if (body.status) data.status = body.status
    if (body.config) {
      const currentConfig = (existing.widgetConfig as Record<string, unknown>) || {}
      data.widgetConfig = { ...currentConfig, ...body.config }
      if (body.config.primaryColor) data.widgetColor = body.config.primaryColor
      if (body.config.greeting) data.welcomeMessage = body.config.greeting
    }

    const updated = await prisma.bot.update({
      where: { id },
      data: data as any,
    })

    return { data: updated }
  })

  // DELETE /api/widgets/:id — Delete widget
  fastify.delete('/widgets/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: widgetParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Widget not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    await prisma.bot.delete({ where: { id } })
    reply.code(204).send()
  })

  // GET /api/widgets/:id/embed — Get embed code snippet
  fastify.get('/widgets/:id/embed', {
    preHandler: [
      fastify.authenticate,
      validate({ params: widgetParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.bot.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Widget not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'
    const snippet = `<script src="${baseUrl}/widget.js" data-bot-id="${id}"></script>\n<div id="convio-widget" data-bot-id="${id}"></div>`

    return { data: { snippet } }
  })
}
