import type { FastifyInstance, FastifyRequest } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { getWidgetCorsHeaders } from '../../plugins/cors.js'
import { resolveGenerationProvider } from '../agents/agent-generator.js'
import { WIDGET_GENERATION_PROMPT, parseWidgetDraft } from './generator.js'
import { z } from 'zod'

const widgetStatuses = ['draft', 'active', 'paused', 'archived'] as const

const orgParamsSchema = z.object({ orgId: z.string().uuid() })
const widgetParamsSchema = z.object({ id: z.string().uuid() })
const publicWidgetParamsSchema = z.object({ publicKey: z.string().min(1) })
const publicWidgetQuerySchema = z.object({ preview: z.coerce.boolean().optional() })
const widgetQuerySchema = z.object({ cursor: z.string().uuid().optional(), limit: z.coerce.number().min(1).max(100).default(20) })
const domainSchema = z.string().trim().min(1).max(253).regex(/^(localhost(?::\d+)?|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/i, 'Enter a domain without a protocol')
const widgetConfigFields = {
  position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#fb923c'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#111113'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#fafafa'),
  greeting: z.string().trim().min(1).max(200).default('Hello! How can I help you?'),
  quickReplies: z.array(z.string().trim().min(1).max(60)).max(4).default([]),
  agentName: z.string().trim().min(1).max(50).default('Assistant'),
  agentAvatar: z.string().url().optional(),
  headerTitle: z.string().trim().max(100).optional(),
  headerSubtitle: z.string().trim().max(100).optional(),
  showOnlineIndicator: z.boolean().optional(),
  launcherIcon: z.enum(['chat', 'sparkle', 'message', 'headphones', 'bot', 'help']).optional(),
  launcherLabel: z.string().trim().max(50).optional(),
  placeholderText: z.string().trim().max(120).optional(),
  showPoweredBy: z.boolean().optional(),
  themeMode: z.enum(['auto', 'light', 'dark']).optional(),
  headerGradient: z.boolean().optional(),
  headerGradientStart: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  headerGradientEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  headerGradientDirection: z.number().min(0).max(360).optional(),
  promptBgColor: z.string().optional(),
  borderColor: z.string().optional(),
  inputBgColor: z.string().optional(),
  sendBtnColor: z.string().optional(),
  widgetHeight: z.number().min(300).max(900).optional(),
  widgetWidth: z.enum(['narrow', 'default', 'wide']).optional(),
  launcherSize: z.enum(['small', 'default', 'large']).optional(),
  borderRadius: z.enum(['none', 'default', 'full']).optional(),
} as const

const widgetConfigSchema = z.object(widgetConfigFields)
const createWidgetBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  agentId: z.string().uuid(),
  config: widgetConfigSchema.optional(),
})
const generateWidgetBodySchema = z.object({
  description: z.string().trim().min(3).max(2000),
  model: z.string().min(1).optional(),
})
const updateWidgetBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  agentId: z.string().uuid().optional(),
  config: widgetConfigSchema.partial().optional(),
  allowedDomains: z.array(domainSchema).max(20).optional(),
  status: z.enum(widgetStatuses).optional(),
})
const publicConversationBodySchema = z.object({ visitorId: z.string().trim().min(1).max(100).optional() })

const defaultWidgetConfig = widgetConfigSchema.parse({})

function normalizeDomains(domains: string[]) {
  return [...new Set(domains.map((domain) => domain.toLowerCase()))]
}

function getRequestDomain(request: FastifyRequest) {
  const origin = request.headers.origin
  if (!origin) return null
  try {
    return new URL(origin).host.toLowerCase()
  } catch {
    return null
  }
}

function assertPublicAccess(request: FastifyRequest, allowedDomains: string[]) {
  const domain = getRequestDomain(request)
  if (allowedDomains.length === 0 || !domain || allowedDomains.includes(domain)) return
  throw new AppError(403, 'This widget is not allowed on this domain')
}

export default async function widgetsRoutes(fastify: FastifyInstance) {
  fastify.post('/widgets/generate', {
    preHandler: [fastify.authenticate, validate({ body: generateWidgetBodySchema })],
  }, async (request) => {
    const { description, model } = request.body as z.infer<typeof generateWidgetBodySchema>

    const { provider, apiKey, model: genModel } = await resolveGenerationProvider(request.userId!, model)

    let result
    try {
      result = await provider.generate({
        model: genModel,
        messages: [
          { role: 'system', content: WIDGET_GENERATION_PROMPT },
          { role: 'user', content: description },
        ],
        temperature: 0.7,
        maxTokens: 2048,
        apiKey,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed'
      throw new AppError(502, `AI generation failed: ${msg}`)
    }

    return { data: parseWidgetDraft(result.content) }
  })

  fastify.get('/organizations/:orgId/widgets', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: orgParamsSchema, query: widgetQuerySchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as z.infer<typeof widgetQuerySchema>
    const widgets = await prisma.widget.findMany({
      where: { organizationId: orgId, status: { not: 'archived' } },
      select: {
        id: true, name: true, publicKey: true, status: true, allowedDomains: true, updatedAt: true, createdAt: true,
        agent: { select: { id: true, name: true, avatar: true } },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
    })
    const hasNextPage = widgets.length > limit
    const items = hasNextPage ? widgets.slice(0, limit) : widgets
    return { data: items, nextCursor: hasNextPage ? items.at(-1)?.id ?? null : null }
  })

  fastify.post('/organizations/:orgId/widgets', {
    preHandler: [fastify.authenticate, fastify.requireAdmin, validate({ params: orgParamsSchema, body: createWidgetBodySchema })],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string }
    const { name, agentId, config } = request.body as z.infer<typeof createWidgetBodySchema>
    const agent = await prisma.agent.findFirst({ where: { id: agentId, organizationId: orgId }, select: { id: true, name: true, avatar: true } })
    if (!agent) throw new AppError(404, 'Agent not found in this organization')

    const widget = await prisma.widget.create({
      data: { organizationId: orgId, agentId, name, config: { ...defaultWidgetConfig, agentName: agent.name, ...(config ?? {}) } },
      select: { id: true, name: true, publicKey: true, status: true, config: true, allowedDomains: true, agent: { select: { id: true, name: true, avatar: true } } },
    })
    reply.code(201)
    return { data: widget }
  })

  fastify.get('/widgets/:id', {
    preHandler: [fastify.authenticate, validate({ params: widgetParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const widget = await prisma.widget.findUnique({
      where: { id },
      select: { id: true, name: true, publicKey: true, status: true, config: true, allowedDomains: true, updatedAt: true, agent: { select: { id: true, name: true, avatar: true, model: true } }, organizationId: true },
    })
    if (!widget) throw new AppError(404, 'Widget not found')
    await fastify.getMembership(request.userId!, widget.organizationId)
    return { data: widget }
  })

  fastify.patch('/widgets/:id', {
    preHandler: [fastify.authenticate, validate({ params: widgetParamsSchema, body: updateWidgetBodySchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as z.infer<typeof updateWidgetBodySchema>
    const existing = await prisma.widget.findUnique({ where: { id }, select: { organizationId: true, config: true, allowedDomains: true } })
    if (!existing) throw new AppError(404, 'Widget not found')
    await fastify.ensureAdmin(request.userId!, existing.organizationId)
    if (body.agentId) {
      const agent = await prisma.agent.findFirst({ where: { id: body.agentId, organizationId: existing.organizationId }, select: { id: true } })
      if (!agent) throw new AppError(404, 'Agent not found in this organization')
    }
    const allowedDomains = body.allowedDomains ? normalizeDomains(body.allowedDomains) : existing.allowedDomains
    if (body.status === 'active' && allowedDomains.length === 0) throw new AppError(400, 'Add at least one allowed domain before publishing')
    const config = body.config ? { ...defaultWidgetConfig, ...(existing.config as object), ...body.config } : undefined
    const widget = await prisma.widget.update({
      where: { id },
      data: { name: body.name, agentId: body.agentId, status: body.status, allowedDomains: body.allowedDomains ? allowedDomains : undefined, config },
      select: { id: true, name: true, publicKey: true, status: true, config: true, allowedDomains: true, updatedAt: true, agent: { select: { id: true, name: true, avatar: true } } },
    })
    return { data: widget }
  })

  fastify.delete('/widgets/:id', {
    preHandler: [fastify.authenticate, validate({ params: widgetParamsSchema })],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const widget = await prisma.widget.findUnique({ where: { id }, select: { organizationId: true } })
    if (!widget) throw new AppError(404, 'Widget not found')
    await fastify.ensureAdmin(request.userId!, widget.organizationId)
    await prisma.widget.update({ where: { id }, data: { status: 'archived' } })
    reply.code(204).send()
  })

  fastify.get('/widgets/:id/embed', {
    preHandler: [fastify.authenticate, validate({ params: widgetParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const widget = await prisma.widget.findUnique({ where: { id }, select: { publicKey: true, organizationId: true } })
    if (!widget) throw new AppError(404, 'Widget not found')
    await fastify.getMembership(request.userId!, widget.organizationId)
    const baseUrl = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim()
    return { data: { snippet: `<script async src="${baseUrl}/widget.js" data-widget-key="${widget.publicKey}"></script>` } }
  })

  fastify.get('/public/widgets/:publicKey', { preHandler: [validate({ params: publicWidgetParamsSchema, query: publicWidgetQuerySchema })] }, async (request, reply) => {
    const { publicKey } = request.params as { publicKey: string }
    const { preview } = request.query as z.infer<typeof publicWidgetQuerySchema>
    const widget = await prisma.widget.findFirst({
      where: { publicKey, ...(preview ? {} : { status: 'active' }) },
      select: { publicKey: true, name: true, config: true, allowedDomains: true, agent: { select: { id: true, name: true, avatar: true } } },
    })
    if (!widget) throw new AppError(404, 'Widget not found')
    assertPublicAccess(request, widget.allowedDomains)
    reply.headers(getWidgetCorsHeaders(widget.allowedDomains, request))
    return { data: widget }
  })

  fastify.post('/public/widgets/:publicKey/conversations', {
    preHandler: [validate({ params: publicWidgetParamsSchema, body: publicConversationBodySchema, query: publicWidgetQuerySchema })],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { publicKey } = request.params as { publicKey: string }
    const { visitorId } = request.body as z.infer<typeof publicConversationBodySchema>
    const { preview } = request.query as z.infer<typeof publicWidgetQuerySchema>
    const widget = await prisma.widget.findFirst({ where: { publicKey, ...(preview ? {} : { status: 'active' }) }, select: { id: true, agentId: true, allowedDomains: true } })
    if (!widget) throw new AppError(404, 'Widget not found')
    assertPublicAccess(request, widget.allowedDomains)
    const conversation = await prisma.conversation.create({
      data: {
        agentId: widget.agentId,
        userId: visitorId ?? null,
        channel: 'web',
      },
    })
    reply.headers(getWidgetCorsHeaders(widget.allowedDomains, request))
    reply.code(201)
    return { data: conversation }
  })
}
