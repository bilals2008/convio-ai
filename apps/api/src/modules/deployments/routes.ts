import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import crypto from 'node:crypto'
import {
  processIncomingMessage as processKapsoIncomingMessage,
  handleMessageStatus,
  createBroadcast,
  executeBroadcast,
  processScheduledBroadcasts,
} from '../../services/whatsapp.js'
import { processTelegramUpdate, setTelegramWebhook, setTelegramCommands, executeTelegramBroadcast, type TelegramUpdate } from '../../services/telegram.js'
import {
  processDiscordInteraction,
  verifyDiscordSignature,
  registerDiscordCommands,
  setBotNickname,
  sendFollowupMessage,
  type DiscordInteraction,
} from '../../services/discord.js'
import { processSlackEvent } from '../../services/slack.js'
import { processIncomingMessage, verifyTwilioSignature } from '../../services/twilio.js'
import {
  createKapsoCustomer,
  generateSetupLink,
  registerMessageWebhook,
  listPhoneNumbers,
  verifyWebhookSignature,
} from '../../services/kapso-platform.js'


const channels = ['whatsapp', 'slack', 'discord', 'telegram', 'api'] as const
type Channel = (typeof channels)[number]

const deploymentStatuses = ['active', 'inactive', 'pending', 'error'] as const

const agentParamsSchema = z.object({
  agentId: z.string().uuid(),
})

const deploymentParamsSchema = z.object({
  id: z.string().uuid(),
})

const whatsappConfigSchema = z.object({
  phoneNumberId: z.string().optional(),
  provider: z.enum(['kapso', 'twilio']).optional().default('kapso'),
  webhookUrl: z.string().optional(),
  kapsoCustomerId: z.string().optional(),
  kapsoSetupLink: z.string().optional(),
  kapsoSetupLinkUrl: z.string().optional(),
  kapsoDisplayPhone: z.string().optional(),
  kapsoApiKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  phoneNumber: z.string().optional(),
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
  publicKey: z.string().min(1),
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
    case 'whatsapp': return whatsappConfigSchema
    case 'slack': return slackConfigSchema
    case 'discord': return discordConfigSchema
    case 'telegram': return telegramConfigSchema
    case 'api': return apiConfigSchema
  }
}

const createDeploymentBodySchema = z.discriminatedUnion('channel', [
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
  'accountSid',
  'authToken',
  'kapsoApiKey',
  'kapsoWebhookSecret',
  'telegramWebhookSecret',
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
  // Preserve the raw request body (scoped to this plugin) so channel webhooks
  // can verify signatures (Discord Ed25519, Slack HMAC) against the exact bytes.
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      ;(req as unknown as { rawBody: string }).rawBody = body as string
      if (!body || (body as string).length === 0) {
        done(null, {})
        return
      }
      try {
        done(null, JSON.parse(body as string))
      } catch (err) {
        done(err as Error, undefined)
      }
    }
  )

  // GET /api/kapso/phone-numbers — List WhatsApp numbers already connected to Kapso
  // Lets the client reuse an existing number instead of running the setup link
  // flow again (Kapso free plan allows only one connected number).
  fastify.get('/kapso/phone-numbers', {
    preHandler: [fastify.authenticate],
  }, async () => {
    const numbers = await listPhoneNumbers()
    const usedIds = new Set(
      (await prisma.deployment.findMany({
        where: { channel: 'whatsapp', status: 'active' },
        select: { config: true },
      }))
        .map((d) => (d.config as Record<string, unknown>)?.phoneNumberId as string | undefined)
        .filter(Boolean)
    )
    const data = numbers
      .filter((n) => n.kind !== 'sandbox')
      .map((n) => ({
        phoneNumberId: n.id,
        displayName: n.display_name ?? null,
        displayPhone: n.display_phone_number ?? null,
        kind: n.kind ?? null,
        inUse: usedIds.has(n.id),
      }))
    return { data }
  })

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

    if (channel === 'whatsapp' && config.provider === 'twilio') {
      if (!config.accountSid || !config.authToken || !config.phoneNumber) {
        throw new AppError(400, 'Twilio credentials required: provide Account SID, Auth Token, and Phone Number. Each deployment needs its own Twilio credentials.')
      }

      const sameNumber = await prisma.deployment.findFirst({
        where: {
          channel: 'whatsapp',
          status: 'active',
          config: { path: ['phoneNumber'], equals: config.phoneNumber as string },
        },
        select: { id: true, agentId: true },
      })
      if (sameNumber) {
        throw new AppError(409, `Phone number ${config.phoneNumber} is already in use by another deployment`, 'CONFLICT')
      }

      finalConfig.accountSid = config.accountSid as string
      finalConfig.authToken = config.authToken as string
      finalConfig.phoneNumber = config.phoneNumber as string

      const deployment = await prisma.deployment.create({
        data: { agentId, channel, config: finalConfig as any, status: 'active' },
      })
      return { data: maskSensitive(deployment) }
    }

    if (channel === 'whatsapp' && (!config.provider || config.provider === 'kapso')) {
      const webhookBaseUrl = (config.webhookUrl as string) || fastify.config.PUBLIC_URL

      // Use own Kapso API key — skip the org-level setup link flow
      if (config.kapsoApiKey) {
        const phoneNumberId = config.phoneNumberId as string | undefined
        if (!phoneNumberId) {
          throw new AppError(400, 'phoneNumberId is required when using your own Kapso API key')
        }

        const existing = await prisma.deployment.findFirst({
          where: {
            channel: 'whatsapp',
            status: 'active',
            config: { path: ['phoneNumberId'], equals: phoneNumberId },
          },
          select: { id: true, agentId: true },
        })
        if (existing) {
          throw new AppError(409, `This WhatsApp number is already used by deployment ${existing.agentId}`, 'CONFLICT')
        }

        finalConfig.kapsoApiKey = config.kapsoApiKey

        const messageWebhookUrl = `${webhookBaseUrl}/api/deployments/PLACEHOLDER/kapso-webhook`

        const deployment = await prisma.deployment.create({
          data: { agentId, channel, config: finalConfig as any, status: 'pending' },
        })

        try {
          const wh = await registerMessageWebhook(
            phoneNumberId,
            messageWebhookUrl.replace('PLACEHOLDER', deployment.id),
            config.webhookSecret as string | undefined,
            config.kapsoApiKey as string
          )
          finalConfig.kapsoWebhookSecret = wh.secretKey
        } catch (err) {
          await prisma.deployment.delete({ where: { id: deployment.id } }).catch(() => {})
          throw new AppError(502, `Failed to register Kapso webhook: ${(err as Error).message}`)
        }

        const updated = await prisma.deployment.update({
          where: { id: deployment.id },
          data: { config: finalConfig as any, status: 'active' },
        })

        return { data: maskSensitive(updated) }
      }

      // Reuse an already-connected number instead of running the setup link
      // flow again. Kapso's free plan allows only one connected number, so a
      // second setup link fails with "Phone number limit reached". If the
      // client picks an existing phoneNumberId, wire it up directly.
      if (config.phoneNumberId) {
        const existing = await prisma.deployment.findFirst({
          where: {
            channel: 'whatsapp',
            status: 'active',
            config: { path: ['phoneNumberId'], equals: config.phoneNumberId as string },
          },
          select: { id: true, agentId: true },
        })
        if (existing) {
          throw new AppError(409, `This WhatsApp number is already used by deployment ${existing.agentId}`, 'CONFLICT')
        }

        const messageWebhookUrl = `${webhookBaseUrl}/api/deployments/PLACEHOLDER/kapso-webhook`

        const deployment = await prisma.deployment.create({
          data: { agentId, channel, config: finalConfig as any, status: 'pending' },
        })

        try {
          const wh = await registerMessageWebhook(
            config.phoneNumberId as string,
            messageWebhookUrl.replace('PLACEHOLDER', deployment.id)
          )
          finalConfig.kapsoWebhookSecret = wh.secretKey
        } catch (err) {
          await prisma.deployment.delete({ where: { id: deployment.id } }).catch(() => {})
          throw new AppError(502, `Failed to register Kapso webhook: ${(err as Error).message}`)
        }

        const updated = await prisma.deployment.update({
          where: { id: deployment.id },
          data: { config: finalConfig as any, status: 'active' },
        })

        return { data: maskSensitive(updated) }
      }

      const customer = await createKapsoCustomer(
        agent.name,
        `${agent.organizationId}:${agentId}`
      )
      finalConfig.kapsoCustomerId = customer.id

      const successUrl = `${webhookBaseUrl}/api/deployments/PLACEHOLDER/kapso-callback`
      const failureUrl = `${webhookBaseUrl}/api/deployments/PLACEHOLDER/kapso-callback`

      const deployment = await prisma.deployment.create({
        data: { agentId, channel, config: finalConfig as any, status: 'pending' },
      })

      const actualSuccessUrl = successUrl.replace('PLACEHOLDER', deployment.id)
      const actualFailureUrl = failureUrl.replace('PLACEHOLDER', deployment.id)

      const setupLink = await generateSetupLink(customer.id, actualSuccessUrl, actualFailureUrl)
      finalConfig.kapsoSetupLink = setupLink.id
      finalConfig.kapsoSetupLinkUrl = setupLink.url

      const updated = await prisma.deployment.update({
        where: { id: deployment.id },
        data: { config: finalConfig as any },
      })

      return { data: maskSensitive(updated) }
    }

    const deployment = await prisma.deployment.create({
      data: { agentId, channel, config: finalConfig as any, status: 'active' },
    })

    // Auto-register Discord slash commands
    if (channel === 'discord') {
      const botToken = finalConfig.botToken as string | undefined
      const applicationId = finalConfig.applicationId as string | undefined
      const guildId = finalConfig.guildId as string | undefined
      if (botToken && applicationId) {
        const result = await registerDiscordCommands(botToken, applicationId, guildId || undefined)
        if (!result.success) {
          request.log.warn({ deploymentId: deployment.id, error: result.error }, 'Failed to register Discord commands')
        }
      }
    }

    // Auto-register Telegram webhook + bot commands
    if (channel === 'telegram') {
      const botToken = finalConfig.botToken as string | undefined
      const webhookBaseUrl = (finalConfig.webhookUrl as string) || fastify.config.PUBLIC_URL
      if (botToken && webhookBaseUrl) {
        const webhookUrl = `${webhookBaseUrl}/api/deployments/${deployment.id}/telegram-webhook`
        const secretToken = crypto.randomUUID().replace(/-/g, '')
        const result = await setTelegramWebhook(botToken, webhookUrl, secretToken)
        if (result.success) {
          finalConfig.telegramWebhookSecret = secretToken
          await prisma.deployment.update({ where: { id: deployment.id }, data: { config: finalConfig as any } })
          request.log.info({ deploymentId: deployment.id, webhookUrl }, 'Telegram webhook registered')
          await setTelegramCommands(botToken).catch(() => {})
        } else {
          request.log.warn({ deploymentId: deployment.id, error: result.error }, 'Failed to register Telegram webhook')
        }
      }
    }

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
      include: { agent: { select: { name: true } } },
    })

    return {
      data: deployments.map((d) => ({
        ...(maskSensitive(d) as Record<string, unknown>),
        agentName: d.agent.name,
      })),
    }
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

    await fastify.ensureAdmin(request.userId!, deployment.agent.organizationId)

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
      whatsapp: ['phoneNumberId'],
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

  // GET /api/deployments/:id/kapso-callback — Kapso setup success redirect (no auth, browser redirect from Kapso)
  fastify.get('/deployments/:id/kapso-callback', async (request, reply) => {
    const { id } = request.params as { id: string }
    const query = request.query as Record<string, string>

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    })

    if (!deployment || deployment.channel !== 'whatsapp') {
      return reply.code(302).redirect('/')
    }

    const config = deployment.config as Record<string, unknown>
    if (config.provider !== 'kapso') {
      return reply.code(302).redirect('/')
    }

    const status = query.status
    if (status === 'completed') {
      const phoneNumberId = query.phone_number_id
      const displayPhone = query.display_phone_number

      if (phoneNumberId) {
        // Kapso deployments don't collect a webhookUrl in the UI, so fall back
        // to the server's PUBLIC_URL — matching the create flow above.
        const webhookBaseUrl = (config.webhookUrl as string) || fastify.config.PUBLIC_URL
        const messageWebhookUrl = `${webhookBaseUrl}/api/deployments/${id}/kapso-webhook`

        try {
          const wh = await registerMessageWebhook(phoneNumberId, messageWebhookUrl)
          config.kapsoWebhookSecret = wh.secretKey
          request.log.info({ deploymentId: id, phoneNumberId }, 'Kapso message webhook registered')
        } catch (err) {
          request.log.error({ deploymentId: id, error: (err as Error).message }, 'Failed to register Kapso webhook')
        }

        config.phoneNumberId = phoneNumberId
        config.kapsoDisplayPhone = displayPhone ? decodeURIComponent(displayPhone) : undefined
        delete config.kapsoSetupLinkUrl

        await prisma.deployment.update({
          where: { id },
          data: { config: config as any, status: 'active' },
        })

        request.log.info({ deploymentId: id, phoneNumberId }, 'Kapso WhatsApp connected')

        const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'
        return reply.code(302).redirect(`${frontendUrl}/settings?tab=deployments&connected=true`)
      }
    }

    const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'
    const errorCode = query.error_code || 'setup_failed'
    return reply.code(302).redirect(`${frontendUrl}/settings?tab=deployments&error=${errorCode}`)
  })

  // GET /api/discord/invite-url — Generate Discord bot invite URL (no callback needed)
  fastify.get('/discord/invite-url', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { agentId } = request.query as { agentId?: string }
    if (!agentId) {
      throw new AppError(400, 'agentId is required')
    }

    const botToken = fastify.config.DISCORD_BOT_TOKEN
    const applicationId = fastify.config.DISCORD_APPLICATION_ID

    if (!botToken || !applicationId) {
      throw new AppError(503, 'Discord one-click setup is not configured. Contact the admin.')
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)

    // Permissions: Send Messages, Use Slash Commands, Read Message History, Embed Links, View Channels
    const permissions = '274877976576'
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${applicationId}&scope=bot%20applications.commands&permissions=${permissions}`

    return { data: { inviteUrl, applicationId } }
  })

  // GET /api/discord/guilds — List Discord servers the bot is in (member only)
  fastify.get('/discord/guilds', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const botToken = fastify.config.DISCORD_BOT_TOKEN
    const applicationId = fastify.config.DISCORD_APPLICATION_ID

    if (!botToken || !applicationId) {
      throw new AppError(503, 'Discord one-click setup is not configured')
    }

    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bot ${botToken}` },
    })

    if (!res.ok) {
      throw new AppError(502, 'Failed to fetch guilds from Discord')
    }

    const guilds = (await res.json()) as Array<{ id: string; name: string; icon: string | null }>

    // Get guilds that already have a deployment
    const deployedGuildIds = new Set(
      (await prisma.deployment.findMany({
        where: { channel: 'discord' },
        select: { config: true },
      }))
        .map((d) => (d.config as Record<string, unknown>)?.guildId as string | undefined)
        .filter(Boolean)
    )

    const data = guilds.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      deployed: deployedGuildIds.has(g.id),
    }))

    return { data }
  })

  // POST /api/discord/connect — Create deployment for a selected guild (member only)
  fastify.post('/discord/connect', {
    preHandler: [
      fastify.authenticate,
      validate({
        body: z.object({
          agentId: z.string().uuid(),
          guildId: z.string().min(1),
          guildName: z.string().optional(),
        }),
      }),
    ],
  }, async (request) => {
    const { agentId, guildId, guildName } = request.body as {
      agentId: string
      guildId: string
      guildName?: string
    }

    const botToken = fastify.config.DISCORD_BOT_TOKEN
    const applicationId = fastify.config.DISCORD_APPLICATION_ID
    const publicKey = fastify.config.DISCORD_PUBLIC_KEY

    if (!botToken || !applicationId || !publicKey) {
      throw new AppError(503, 'Discord one-click setup is not configured')
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)

    const existing = await prisma.deployment.findFirst({
      where: { agentId, channel: 'discord', config: { path: ['guildId'], equals: guildId } },
    })
    if (existing) {
      throw new AppError(409, 'This agent already has a deployment in this Discord server', 'CONFLICT')
    }

    const config = {
      botToken,
      applicationId,
      publicKey,
      guildId,
      setupMode: 'oauth2',
      guildName: guildName || null,
    }

    const deployment = await prisma.deployment.create({
      data: { agentId, channel: 'discord', config: config as any, status: 'pending' },
    })

    const result = await registerDiscordCommands(botToken, applicationId, guildId)
    if (result.success) {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: 'active' },
      })
    }

    return { data: { id: deployment.id, status: result.success ? 'active' : 'pending' } }
  })

  // PATCH /api/deployments/:id/discord-nickname — Set the bot's nickname in the Discord guild (member only)
  fastify.patch('/deployments/:id/discord-nickname', {
    preHandler: [
      fastify.authenticate,
      validate({
        params: deploymentParamsSchema,
        body: z.object({ nickname: z.string().min(1).max(100) }),
      }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { nickname } = request.body as { nickname: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: { select: { organizationId: true } } },
    })
    if (!deployment) throw new AppError(404, 'Deployment not found')
    if (deployment.channel !== 'discord') throw new AppError(400, 'Not a Discord deployment')

    await fastify.getMembership(request.userId!, deployment.agent.organizationId)

    const config = deployment.config as Record<string, unknown>
    const botToken = config.botToken as string | undefined
    const guildId = config.guildId as string | undefined
    const applicationId = config.applicationId as string | undefined

    if (!botToken || !guildId || !applicationId) {
      throw new AppError(400, 'Discord deployment is missing bot credentials or guild ID')
    }

    const result = await setBotNickname(botToken, guildId, applicationId, nickname)
    if (!result.success) {
      throw new AppError(502, result.error || 'Failed to set nickname')
    }

    // Store nickname in config for reference
    const updatedConfig = { ...config, botNickname: nickname }
    await prisma.deployment.update({
      where: { id },
      data: { config: updatedConfig as any },
    })

    return { data: { success: true, nickname } }
  })

  // POST /api/deployments/:id/kapso-webhook — Kapso incoming message webhook
  fastify.post('/deployments/:id/kapso-webhook', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const body = request.body as any
    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    }).catch(() => null)

    if (!deployment || deployment.channel !== 'whatsapp') {
      request.log.warn({ deploymentId: id }, 'Kapso webhook: deployment not found or not whatsapp')
      return reply.code(200).send('OK')
    }

    const config = deployment.config as Record<string, unknown>
    if (config.provider !== 'kapso') {
      return reply.code(200).send('OK')
    }

    // Verify HMAC-SHA256 signature over the raw body (timing-safe)
    const secret = config.kapsoWebhookSecret as string | undefined
    const signature = request.headers['x-webhook-signature'] as string | undefined
    if (!secret || !signature || !verifyWebhookSignature((request as unknown as { rawBody: string }).rawBody, signature, secret)) {
      return reply.code(401).send('Invalid signature')
    }

    const phoneNumberId = config.phoneNumberId as string
    const event = request.headers['x-webhook-event'] as string

    // Handle message status callbacks
    if (event === 'whatsapp.message.status' || body?.statuses) {
      const statuses = body?.statuses || (body?.entry?.[0]?.changes?.[0]?.value?.statuses)
      if (statuses && Array.isArray(statuses)) {
        for (const s of statuses) {
          void handleMessageStatus(s).catch((err) =>
            request.log.error({ err, statusId: s.id }, 'Failed to handle message status')
          )
        }
      }
      return reply.code(200).send('OK')
    }

    if (event !== 'whatsapp.message.received') {
      return reply.code(200).send('OK')
    }

    // Handle Meta Cloud API format (entry[].changes[].value.messages[])
    const metaMessages = body?.entry?.[0]?.changes?.[0]?.value?.messages
    const messages = metaMessages || (body?.message ? [body.message] : [])

    for (const message of messages) {
      if (!message) continue
      const from = message.from || body.conversation?.phone_number || ''
      if (!from) continue

      const messageId = message.id
      const contactName = message.kapso?.contact_name || body.conversation?.kapso?.contact_name || undefined

      // Extract text body (or empty for interactive messages)
      let text = message.text?.body || ''

      // Handle interactive replies (buttons / lists)
      const interactive = message.interactive
      if (!text && interactive) {
        text = ''
      }

      // Handle group context
      let groupMetadata: { groupId: string; groupSubject?: string; author: string; authorName?: string } | undefined
      if (message.context?.group_id || body.conversation?.type === 'group') {
        groupMetadata = {
          groupId: message.context?.group_id || body.conversation?.phone_number || '',
          groupSubject: message.context?.group_subject || undefined,
          author: from,
          authorName: contactName,
        }
      }

      // Skip messages with only text or interactive — no media handling here
      // ponytail: media messages (image/video/audio/document) not yet handled, add when needed
      const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker']
      if (!text && !interactive && !mediaTypes.includes(message.type)) continue

      request.log.info({ from, deploymentId: id, messageId, type: message.type }, 'Kapso webhook: received incoming message')

      void processKapsoIncomingMessage(id, {
        from,
        body: text,
        messageId,
        contactName,
        phoneNumberId,
        interactive,
        groupMetadata,
      }).then((result) => {
        if (result.error) {
          request.log.error({ error: result.error, from, deploymentId: id }, 'Kapso webhook: processing failed')
        }
      }).catch((err) => {
        request.log.error({ err, from, deploymentId: id }, 'Kapso webhook: processing threw')
      })
    }

    return reply.code(200).send('OK')
  })

  // POST /api/deployments/:id/telegram-webhook — Receive Telegram updates
  fastify.post('/deployments/:id/telegram-webhook', async (request, reply) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    }).catch(() => null)

    if (!deployment || deployment.channel !== 'telegram') {
      request.log.warn({ deploymentId: id }, 'Telegram webhook: deployment not found or wrong channel')
      return reply.code(200).send('OK')
    }

    const config = deployment.config as Record<string, unknown>
    const botToken = config.botToken as string
    if (!botToken) {
      request.log.warn({ deploymentId: id }, 'Telegram webhook: missing bot token')
      return reply.code(200).send('OK')
    }

    // Verify X-Telegram-Bot-Api-Secret-Token (set only for deployments registered after this secret feature)
    const secretToken = config.telegramWebhookSecret as string | undefined
    const receivedToken = request.headers['x-telegram-bot-api-secret-token'] as string | undefined
    if (secretToken && (!receivedToken || receivedToken !== secretToken)) {
      request.log.warn({ deploymentId: id }, 'Telegram webhook: invalid secret token')
      return reply.code(401).send('Unauthorized')
    }

    const update = request.body as TelegramUpdate

    const result = await processTelegramUpdate(id, botToken, update)
    if (result.error) {
      request.log.error({ error: result.error, deploymentId: id }, 'Telegram webhook: processing failed')
    }

    return reply.code(200).send('OK')
  })

  // POST /api/deployments/:id/whatsapp-status — WhatsApp message status callbacks
  fastify.post('/deployments/:id/whatsapp-status', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as any

    const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses || body?.statuses
    if (statuses && Array.isArray(statuses)) {
      for (const s of statuses) {
        void handleMessageStatus(s).catch((err) =>
          request.log.error({ err, statusId: s.id }, 'Status callback handler failed')
        )
      }
    }

    return reply.code(200).send('OK')
  })

  // POST /api/twilio-webhook — Receive Twilio WhatsApp messages (generic, routes by To number)
  // Users configure this single URL in Twilio console. We look up the deployment
  // by matching the To phone number against deployment configs.
  fastify.post('/twilio-webhook', async (request, reply) => {
    const payload = request.body as Record<string, string>
    const toNumber = (payload.To || '').replace('whatsapp:', '')
    const fromNumber = (payload.From || '').replace('whatsapp:', '')
    request.log.info({ to: toNumber, from: fromNumber, messageSid: payload.MessageSid, messageStatus: payload.MessageStatus }, 'Twilio webhook: received')

    if (!toNumber) {
      request.log.warn({ payload: Object.keys(payload) }, 'Twilio webhook: missing To number')
      return reply.code(200).send('<Response></Response>')
    }

    let deployment = await prisma.deployment.findFirst({
      where: {
        channel: 'whatsapp',
        config: { path: ['phoneNumber'], equals: toNumber },
        status: 'active',
      },
      include: { agent: true },
    }).catch(() => null)

    if (!deployment) {
      deployment = await prisma.deployment.findFirst({
        where: {
          channel: 'whatsapp',
          config: { path: ['phoneNumber'], equals: `whatsapp:${toNumber}` },
          status: 'active',
        },
        include: { agent: true },
      }).catch(() => null)
    }

    if (!deployment) {
      request.log.warn({ toNumber }, 'Twilio webhook: no active deployment found for this number')
      return reply.code(200).send('<Response></Response>')
    }

    const config = deployment.config as Record<string, unknown>
    const deploymentId = deployment.id

    if (config.provider !== 'twilio') {
      request.log.warn({ deploymentId }, 'Twilio webhook: deployment provider is not twilio')
      return reply.code(200).send('<Response></Response>')
    }

    const authToken = config.authToken as string

    if (!authToken) {
      request.log.warn({ deploymentId }, 'Twilio webhook: missing auth token')
      return reply.code(200).send('<Response></Response>')
    }

    const signature = request.headers['x-twilio-signature'] as string | undefined
    const webhookUrl = `${fastify.config.PUBLIC_URL}/api/twilio-webhook`

    if (signature) {
      const valid = verifyTwilioSignature(authToken, webhookUrl, payload, signature)
      if (!valid) {
        request.log.warn({ deploymentId }, 'Twilio webhook: invalid signature')
        return reply.code(401).send('<Response></Response>')
      }
    }

    if (payload.MessageStatus) {
      request.log.info({ deploymentId, messageSid: payload.MessageSid, status: payload.MessageStatus }, 'Twilio webhook: message status callback')
      return reply.code(200).send('<Response></Response>')
    }

    const from = payload.From
    const text = payload.Body

    if (!from) {
      request.log.warn({ deploymentId }, 'Twilio webhook: missing From number')
      return reply.code(200).send('<Response></Response>')
    }

    request.log.info({ from, deploymentId, messageSid: payload.MessageSid, textLength: text?.length }, 'Twilio webhook: processing incoming message')

    void processIncomingMessage(deploymentId, config, {
      MessageSid: payload.MessageSid || '',
      From: from,
      To: payload.To || '',
      Body: text || '',
      NumMedia: payload.NumMedia,
      MediaUrl0: payload.MediaUrl0,
      MediaContentType0: payload.MediaContentType0,
      ProfileName: payload.ProfileName,
      SmsStatus: payload.SmsStatus,
    })
      .then((result) => {
        if (result.error) {
          request.log.error({ error: result.error, from, deploymentId }, 'Twilio webhook: processing failed')
        } else {
          request.log.info({ from, deploymentId }, 'Twilio webhook: processing succeeded')
        }
      })
      .catch((err) => {
        request.log.error({ err, from, deploymentId }, 'Twilio webhook: processing threw')
      })

    return reply.code(200).send('<Response></Response>')
  })

  // POST /api/discord/interactions — Generic Discord interactions endpoint (one-click OAuth2 flow)
  // Discord's Interactions Endpoint URL points here once. This endpoint looks up
  // the deployment by guild_id so users don't have to configure per-deployment URLs.
  fastify.post('/discord/interactions', async (request, reply) => {
    const publicKey = fastify.config.DISCORD_PUBLIC_KEY
    if (!publicKey) {
      return reply.code(503).send({ error: 'Discord integration not configured' })
    }

    const signature = request.headers['x-signature-ed25519'] as string | undefined
    const timestamp = request.headers['x-signature-timestamp'] as string | undefined
    const rawBody = (request as unknown as { rawBody?: string }).rawBody ?? ''

    if (!signature || !timestamp) {
      return reply.code(401).send({ error: 'Missing signature headers' })
    }

    if (!verifyDiscordSignature(publicKey, signature, timestamp, rawBody)) {
      return reply.code(401).send({ error: 'Invalid request signature' })
    }

    const interaction = request.body as DiscordInteraction

    // PING — always respond with PONG
    if (interaction.type === 1) {
      return reply.code(200).send({ type: 1 })
    }

    // ACK immediately (deferred) to avoid Discord's 3-second timeout.
    // DB lookups and processing happen in background.
    void processInteractionAsync(interaction)
    return reply.code(200).send({ type: 5 })
  })

  async function processInteractionAsync(interaction: DiscordInteraction) {
    try {
      const guildId = interaction.guild_id
      if (!guildId) return

      const deployment = await prisma.deployment.findFirst({
        where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
        include: { agent: true },
      })

      if (!deployment) return

      // processDiscordInteraction returns the interaction response to send back,
      // but since we already ACKed with type 5, we send follow-ups via webhook
      const response = await processDiscordInteraction(deployment.id, interaction)
      if (response.type === 4 && response.data) {
        await sendFollowupMessage(interaction.application_id, interaction.token!, response.data).catch(() => {})
      }
    } catch (err) {
      console.error('[Discord] Background processing failed:', err)
    }
  }

  // POST /api/deployments/:id/discord-webhook — Receive Discord interactions
  fastify.post('/deployments/:id/discord-webhook', async (request, reply) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    }).catch(() => null)

    if (!deployment || deployment.channel !== 'discord') {
      return reply.code(401).send({ error: 'Unknown deployment' })
    }

    const config = deployment.config as Record<string, unknown>
    const publicKey = config.publicKey as string | undefined

    const signature = request.headers['x-signature-ed25519'] as string | undefined
    const timestamp = request.headers['x-signature-timestamp'] as string | undefined
    const rawBody = (request as unknown as { rawBody?: string }).rawBody ?? ''

    if (!publicKey || !signature || !timestamp) {
      return reply.code(401).send({ error: 'Missing signature headers' })
    }

    if (!verifyDiscordSignature(publicKey, signature, timestamp, rawBody)) {
      return reply.code(401).send({ error: 'Invalid request signature' })
    }

    const interaction = request.body as DiscordInteraction

    const response = await processDiscordInteraction(id, interaction)
    return reply.code(200).send(response)
  })

  // POST /api/deployments/:id/slack-webhook — Receive Slack events (URL verification + events)
  fastify.post('/deployments/:id/slack-webhook', async (request, reply) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    }).catch(() => null)

    if (!deployment || deployment.channel !== 'slack') {
      return reply.code(404).send({ error: 'Unknown deployment' })
    }

    const config = deployment.config as Record<string, unknown>
    const signingSecret = config.signingSecret as string
    const rawBody = (request as unknown as { rawBody?: string }).rawBody ?? JSON.stringify(request.body ?? {})

    const result = await processSlackEvent(id, signingSecret, rawBody, request.headers)

    // URL verification handshake — echo the challenge back
    if (result.challenge) {
      return reply.code(200).send({ challenge: result.challenge })
    }

    if (result.error) {
      if (result.error === 'Invalid signature') {
        return reply.code(401).send({ error: result.error })
      }
      request.log.error({ error: result.error, deploymentId: id }, 'Slack webhook: processing failed')
    }

    return reply.code(200).send('OK')
  })

  // Broadcast management endpoints
  // POST /api/broadcasts — Create a new broadcast (member of the target org only)
  fastify.post('/broadcasts', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const body = request.body as {
      organizationId: string
      agentId: string
      name: string
      templateName: string
      templateLanguage?: string
      templateParams?: Record<string, string>[]
      contactFilter?: Record<string, unknown>
      scheduleCron?: string
      scheduleAt?: string
    }
    await fastify.getMembership(request.userId!, body.organizationId)
    const agent = await prisma.agent.findFirst({
      where: { id: body.agentId, organizationId: body.organizationId },
      select: { id: true },
    })
    if (!agent) throw new AppError(404, 'Agent not found in this organization')
    const result = await createBroadcast(body)
    return { data: result }
  })

  // POST /api/broadcasts/:id/execute — Execute a broadcast immediately (member of the org only)
  fastify.post('/broadcasts/:id/execute', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const broadcast = await prisma.broadcast.findUnique({ where: { id }, select: { organizationId: true } })
    if (!broadcast) throw new AppError(404, 'Broadcast not found')
    await fastify.getMembership(request.userId!, broadcast.organizationId)
    const result = await executeBroadcast(id)
    return { data: result }
  })

  // POST /api/broadcasts/process — Process all scheduled broadcasts (called by cron, guarded by CRON_SECRET when set)
  fastify.post('/broadcasts/process', async (request) => {
    const secret = process.env.CRON_SECRET
    if (secret && request.headers['x-cron-secret'] !== secret) {
      throw new AppError(403, 'Unauthorized', 'FORBIDDEN')
    }
    await processScheduledBroadcasts()
    return { data: { processed: true } }
  })

  // POST /api/telegram-broadcasts/:id/execute — Execute a Telegram broadcast (member of the org only)
  fastify.post('/telegram-broadcasts/:id/execute', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const broadcast = await prisma.broadcast.findUnique({ where: { id }, select: { organizationId: true } })
    if (!broadcast) throw new AppError(404, 'Broadcast not found')
    await fastify.getMembership(request.userId!, broadcast.organizationId)
    const result = await executeTelegramBroadcast(id)
    return { data: result }
  })
}

