import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import crypto from 'node:crypto'
import { processIncomingMessage } from '../../services/whatsapp.js'
import { processTelegramUpdate, type TelegramUpdate } from '../../services/telegram.js'
import {
  processDiscordInteraction,
  verifyDiscordSignature,
  registerDiscordCommands,
  setBotNickname,
  type DiscordInteraction,
} from '../../services/discord.js'
import { processSlackEvent } from '../../services/slack.js'
import {
  createKapsoCustomer,
  generateSetupLink,
  registerMessageWebhook,
  listPhoneNumbers,
} from '../../services/kapso-platform.js'


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
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
  verifyToken: z.string().optional(),
  provider: z.enum(['meta', 'twilio', 'kapso']).optional().default('meta'),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioNumber: z.string().optional(),
  webhookUrl: z.string().optional(),
  kapsoCustomerId: z.string().optional(),
  kapsoSetupLink: z.string().optional(),
  kapsoSetupLinkUrl: z.string().optional(),
  kapsoDisplayPhone: z.string().optional(),
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
  'kapsoWebhookSecret',
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

    if (channel === 'whatsapp' && config.provider === 'kapso') {
      const webhookBaseUrl = (config.webhookUrl as string) || fastify.config.PUBLIC_URL

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
      data: { agentId, channel, config: finalConfig as any, status: 'pending' },
    })

    // Auto-register Discord slash commands
    if (channel === 'discord') {
      const botToken = finalConfig.botToken as string | undefined
      const applicationId = finalConfig.applicationId as string | undefined
      const guildId = finalConfig.guildId as string | undefined
      if (botToken && applicationId) {
        const result = await registerDiscordCommands(botToken, applicationId, guildId || undefined)
        if (result.success) {
          await prisma.deployment.update({
            where: { id: deployment.id },
            data: { status: 'active' },
          })
          request.log.info({ deploymentId: deployment.id }, 'Discord slash commands registered')
        } else {
          request.log.warn({ deploymentId: deployment.id, error: result.error }, 'Failed to register Discord commands')
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
      whatsapp: (config.provider === 'twilio') ? ['twilioAccountSid', 'twilioAuthToken', 'twilioNumber']
        : (config.provider === 'kapso') ? ['phoneNumberId']
        : ['phoneNumberId', 'accessToken'],
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

  // POST /api/deployments/:id/whatsapp-webhook — Twilio incoming message webhook
  fastify.post('/deployments/:id/whatsapp-webhook', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { agent: true },
    })
    if (!deployment || deployment.channel !== 'whatsapp') {
      reply.header('Content-Type', 'text/xml')
      return reply.code(200).send('<Response></Response>')
    }

    const config = deployment.config as Record<string, unknown>
    if (config.provider !== 'twilio') {
      reply.header('Content-Type', 'text/xml')
      return reply.code(200).send('<Response></Response>')
    }

    const body = request.body as any
    const from = body.From || ''
    const text = body.Body || ''

    if (!from || !text) {
      reply.header('Content-Type', 'text/xml')
      return reply.code(200).send('<Response></Response>')
    }

    const result = await processIncomingMessage(id, from, text)

    reply.header('Content-Type', 'text/xml')
    if (result.error) {
      return reply.code(200).send(`<Response><Message>Sorry, an error occurred: ${result.error}</Message></Response>`)
    }

    return reply.code(200).send('<Response></Response>')
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

    const event = request.headers['x-webhook-event'] as string
    if (event !== 'whatsapp.message.received') {
      return reply.code(200).send('OK')
    }

    const message = body?.message
    if (!message || !message.text?.body) {
      return reply.code(200).send('OK')
    }

    const from = message.from || body.conversation?.phone_number || ''
    const text = message.text.body
    const contactName = message.kapso?.contact_name || body.conversation?.kapso?.contact_name || undefined
    const messageId = (message.id as string | undefined) || undefined

    if (!from || !text) {
      return reply.code(200).send('OK')
    }

    request.log.info({ from, deploymentId: id, messageId }, 'Kapso webhook: received incoming message')

    // Ack Kapso immediately. Generating the agent reply can take longer than
    // Kapso's delivery timeout (~5s); if we wait for it, Kapso marks the
    // delivery failed and retries up to 3 times, producing duplicate replies.
    // Process the message after responding instead.
    void processIncomingMessage(id, from, text, contactName, messageId)
      .then((result) => {
        if (result.error) {
          request.log.error({ error: result.error, from, deploymentId: id }, 'Kapso webhook: processing failed')
        } else {
          request.log.info({ from, deploymentId: id }, 'Kapso webhook: processing succeeded')
        }
      })
      .catch((err) => {
        request.log.error({ err, from, deploymentId: id }, 'Kapso webhook: processing threw')
      })

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

    const update = request.body as TelegramUpdate

    const result = await processTelegramUpdate(id, botToken, update)
    if (result.error) {
      request.log.error({ error: result.error, deploymentId: id }, 'Telegram webhook: processing failed')
    }

    return reply.code(200).send('OK')
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

    // Look up deployment by guild_id
    const guildId = interaction.guild_id
    if (!guildId) {
      return reply.code(400).send({ error: 'Missing guild_id' })
    }

    const deployment = await prisma.deployment.findFirst({
      where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
      select: { id: true },
    })

    if (!deployment) {
      request.log.warn({ guildId }, 'No Discord deployment found for guild')
      return reply.code(200).send({ type: 4, data: { content: 'This bot is not configured for this server.', flags: 64 } })
    }

    const response = await processDiscordInteraction(deployment.id, interaction)
    return reply.code(200).send(response)
  })

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
}

