import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import crypto from 'node:crypto'

const channels = ['web', 'whatsapp', 'slack', 'discord', 'telegram', 'api'] as const
type Channel = (typeof channels)[number]

const deploymentStatuses = ['active', 'inactive', 'pending', 'error'] as const

const agentParamsSchema = z.object({
  agentId: z.string().uuid(),
})

const deploymentParamsSchema = z.object({
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

const createDeploymentBodySchema = z.discriminatedUnion('channel', [
  z.object({ channel: z.literal('web'), config: webConfigSchema }),
  z.object({ channel: z.literal('whatsapp'), config: whatsappConfigSchema }),
  z.object({ channel: z.literal('slack'), config: slackConfigSchema }),
  z.object({ channel: z.literal('discord'), config: discordConfigSchema }),
  z.object({ channel: z.literal('telegram'), config: telegramConfigSchema }),
  z.object({ channel: z.literal('api'), config: apiConfigSchema }),
])

const updateDeploymentBodySchema = z.object({
  config: z.record(z.unknown()).optional(),
  status: z.enum(deploymentStatuses).optional(),
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

export default async function deploymentsRoutes(fastify: FastifyInstance) {
  // POST /api/agents/:agentId/deployments — Create deployment (member only)
  fastify.post('/agents/:agentId/deployments', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: createDeploymentBodySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { channel, config } = request.body as { channel: Channel; config: Record<string, unknown> }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const existing = await prisma.deployment.findFirst({
      where: { agentId, channel },
    })

    if (existing) {
      throw new AppError(409, `Deployment for channel '${channel}' already exists on this agent`, 'CONFLICT')
    }

    const finalConfig: Record<string, unknown> = { ...config }
    if (channel === 'api') {
      finalConfig.apiKey = crypto.randomUUID()
    }

    const deployment = await prisma.deployment.create({
      data: { agentId, channel, config: finalConfig as any, status: 'pending' },
    })

    return { data: maskSensitive(deployment) }
  })

  // GET /api/agents/:agentId/deployments — List deployments for agent (member only)
  fastify.get('/agents/:agentId/deployments', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const deployments = await prisma.deployment.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    })

    return { data: deployments.map(maskSensitive) }
  })

  // GET /api/deployments/:id — Get deployment by ID (member only, masked)
  fastify.get('/deployments/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: deploymentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true, name: true } } },
    })

    if (!deployment) throw new AppError(404, 'Deployment not found')

    await fastify.getMembership(request.userId!, deployment.agent.organizationId)

    return { data: maskSensitive(deployment) }
  })

  // PATCH /api/deployments/:id — Update deployment config or status (member only)
  fastify.patch('/deployments/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: deploymentParamsSchema, body: updateDeploymentBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })

    if (!deployment) throw new AppError(404, 'Deployment not found')

    await fastify.getMembership(request.userId!, deployment.agent.organizationId)

    const updated = await prisma.deployment.update({
      where: { id },
      data: request.body as any,
    })

    return { data: maskSensitive(updated) }
  })

  // DELETE /api/deployments/:id — Delete deployment (admin only)
  fastify.delete('/deployments/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: deploymentParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })

    if (!deployment) throw new AppError(404, 'Deployment not found')

    await fastify.ensureAdmin(request.userId!, deployment.agent.organizationId)

    await prisma.deployment.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/deployments/:id/test — Test deployment connection (member only)
  fastify.post('/deployments/:id/test', {
    preHandler: [
      fastify.authenticate,
      validate({ params: deploymentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })

    if (!deployment) throw new AppError(404, 'Deployment not found')

    await fastify.getMembership(request.userId!, deployment.agent.organizationId)

    const channel = deployment.channel as Channel
    const config = deployment.config as Record<string, unknown>

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
        message: `Deployment for ${channel} is properly configured`,
      },
    }
  })
}
