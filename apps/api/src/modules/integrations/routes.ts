import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import crypto from 'node:crypto'

const channels = ['web', 'whatsapp', 'slack', 'discord', 'telegram', 'api'] as const
type Channel = (typeof channels)[number]

const integrationStatuses = ['active', 'inactive', 'pending', 'error'] as const

const botParamsSchema = z.object({
  botId: z.string().uuid(),
})

const integrationParamsSchema = z.object({
  id: z.string().uuid(),
})

const webConfigSchema = z.object({
  allowedOrigins: z.array(z.string()).min(1).optional(),
  showBranding: z.boolean().optional(),
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional(),
  trigger: z.enum(['auto', 'manual', 'on-scroll']).optional(),
  triggerDelay: z.number().min(0).optional(),
}).passthrough()

const whatsappConfigSchema = z.object({
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
  verifyToken: z.string().min(1),
  webhookUrl: z.string().url().optional(),
}).passthrough()

const slackConfigSchema = z.object({
  botToken: z.string().min(1),
  appToken: z.string().min(1),
  signingSecret: z.string().min(1),
  teamId: z.string().optional(),
}).passthrough()

const discordConfigSchema = z.object({
  botToken: z.string().min(1),
  applicationId: z.string().min(1),
  guildId: z.string().optional(),
}).passthrough()

const telegramConfigSchema = z.object({
  botToken: z.string().min(1),
  webhookUrl: z.string().url().optional(),
}).passthrough()

const apiConfigSchema = z.object({
  allowedIpRanges: z.array(z.string()).optional(),
  webhookUrl: z.string().url().optional(),
}).passthrough()

function configSchemaForChannel(channel: Channel) {
  switch (channel) {
    case 'web': return webConfigSchema
    case 'whatsapp': return whatsappConfigSchema
    case 'slack': return slackConfigSchema
    case 'discord': return discordConfigSchema
    case 'telegram': return telegramConfigSchema
    case 'api': return apiConfigSchema
  }
}

const createIntegrationBodySchema = z.discriminatedUnion('channel', [
  z.object({ channel: z.literal('web'), config: webConfigSchema }),
  z.object({ channel: z.literal('whatsapp'), config: whatsappConfigSchema }),
  z.object({ channel: z.literal('slack'), config: slackConfigSchema }),
  z.object({ channel: z.literal('discord'), config: discordConfigSchema }),
  z.object({ channel: z.literal('telegram'), config: telegramConfigSchema }),
  z.object({ channel: z.literal('api'), config: apiConfigSchema }),
])

const updateIntegrationBodySchema = z.object({
  config: z.record(z.unknown()).optional(),
  status: z.enum(integrationStatuses).optional(),
})

const sensitiveKeys = new Set([
  'accessToken',
  'botToken',
  'appToken',
  'signingSecret',
  'apiKey',
  'verifyToken',
  'password',
  'secret',
  'token',
])

function maskSensitive(config: unknown): unknown {
  if (config === null || config === undefined) return config
  if (typeof config !== 'object') return config

  if (Array.isArray(config)) {
    return config.map(maskSensitive)
  }

  const masked: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(config as Record<string, unknown>)) {
    if (sensitiveKeys.has(key) && typeof value === 'string' && value.length > 4) {
      masked[key] = 'x' + value.slice(-4)
    } else {
      masked[key] = value
    }
  }
  return masked
}

export default async function integrationsRoutes(fastify: FastifyInstance) {
  // POST /api/bots/:botId/integrations — Create integration (member only)
  fastify.post('/bots/:botId/integrations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, body: createIntegrationBodySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { channel, config } = request.body as { channel: Channel; config: Record<string, unknown> }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    const existing = await prisma.integration.findFirst({
      where: { botId, channel },
    })

    if (existing) {
      throw new AppError(409, `Integration for channel '${channel}' already exists on this bot`, 'CONFLICT')
    }

    const finalConfig: Record<string, unknown> = { ...config }
    if (channel === 'api') {
      finalConfig.apiKey = crypto.randomUUID()
    }

    const integration = await prisma.integration.create({
      data: { botId, channel, config: finalConfig as any, status: 'pending' },
    })

    return { data: maskSensitive(integration) }
  })

  // GET /api/bots/:botId/integrations — List integrations for bot (member only)
  fastify.get('/bots/:botId/integrations', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    const integrations = await prisma.integration.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    })

    return { data: integrations.map(maskSensitive) }
  })

  // GET /api/integrations/:id — Get integration by ID (member only, masked)
  fastify.get('/integrations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: integrationParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true, name: true } } },
    })

    if (!integration) throw new AppError(404, 'Integration not found')

    await fastify.getMembership(request.userId!, integration.bot.organizationId)

    return { data: maskSensitive(integration) }
  })

  // PATCH /api/integrations/:id — Update integration config or status (member only)
  fastify.patch('/integrations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: integrationParamsSchema, body: updateIntegrationBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    })

    if (!integration) throw new AppError(404, 'Integration not found')

    await fastify.getMembership(request.userId!, integration.bot.organizationId)

    const updated = await prisma.integration.update({
      where: { id },
      data: request.body as any,
    })

    return { data: maskSensitive(updated) }
  })

  // DELETE /api/integrations/:id — Delete integration (admin only)
  fastify.delete('/integrations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: integrationParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    })

    if (!integration) throw new AppError(404, 'Integration not found')

    await fastify.ensureAdmin(request.userId!, integration.bot.organizationId)

    await prisma.integration.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/integrations/:id/test — Test integration connection (member only)
  fastify.post('/integrations/:id/test', {
    preHandler: [
      fastify.authenticate,
      validate({ params: integrationParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    })

    if (!integration) throw new AppError(404, 'Integration not found')

    await fastify.getMembership(request.userId!, integration.bot.organizationId)

    const channel = integration.channel as Channel
    const config = integration.config as Record<string, unknown>

    const requiredFields: Record<Channel, string[]> = {
      web: [],
      whatsapp: ['phoneNumberId', 'accessToken'],
      slack: ['botToken', 'signingSecret'],
      discord: ['botToken', 'applicationId'],
      telegram: ['botToken'],
      api: ['apiKey'],
    }

    const missing = requiredFields[channel].filter((f) => !config[f])

    if (missing.length > 0) {
      return {
        data: {
          success: false,
          status: 'error',
          message: `Missing required configuration: ${missing.join(', ')}`,
        },
      }
    }

    return {
      data: {
        success: true,
        status: 'configured',
        message: `Integration for ${channel} is properly configured`,
      },
    }
  })
}
