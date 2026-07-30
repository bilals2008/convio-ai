import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

import Fastify from 'fastify'
import configPlugin from './config/index.js'
import errorHandlerPlugin from './plugins/error.js'
import corsPlugin from './plugins/cors.js'
import authPlugin from './plugins/auth.js'
import validationPlugin from './plugins/validate.js'
import membershipPlugin from './plugins/membership.js'
import adminPlugin from './plugins/admin.js'
import billingLimitsPlugin from './plugins/billing-limits.js'
import auditLoggerPlugin from './plugins/audit-logger.js'
import swaggerPlugin from './plugins/swagger.js'
import rateLimitPlugin from './plugins/rate-limit.js'
import helmetPlugin from './plugins/helmet.js'
import multipart from '@fastify/multipart'
import formbody from '@fastify/formbody'

import authRoutes from './modules/auth/routes.js'
import usersRoutes from './modules/users/routes.js'
import organizationsRoutes from './modules/organizations/routes.js'
import agentsRoutes from './modules/agents/routes.js'
import toolsRoutes from './modules/tools/routes.js'
import deploymentsRoutes from './modules/deployments/routes.js'
import conversationsRoutes from './modules/conversations/routes.js'
import messagesRoutes from './modules/messages/routes.js'
import knowledgeRoutes from './modules/knowledge/routes.js'
import analyticsRoutes from './modules/analytics/routes.js'
import aiRoutes from './modules/ai/routes.js'
import billingRoutes from './modules/billing/routes.js'
import widgetsRoutes from './modules/widgets/routes.js'
import providerKeysRoutes from './modules/provider-keys/routes.js'
import dataManagementRoutes from './modules/data-management/routes.js'
import mcpRoutes from './modules/mcp/routes.js'
import contactRoutes from './modules/contact/routes.js'
import avatarPresetsRoutes from './modules/avatar-presets/routes.js'
import statusRoutes from './modules/status/routes.js'
import auditLogsRoutes from './modules/audit-logs/routes.js'
import adminRoutes from './modules/admin/routes.js'
import emailPlugin from './services/email.jsx'
import { initDiscordGateway, shutdownDiscordGateway } from './services/discord-gateway.js'


async function buildServer() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  })

  // Plugins
  await app.register(configPlugin)
  await app.register(helmetPlugin)
  await app.register(errorHandlerPlugin)
  await app.register(corsPlugin)
  await app.register(authPlugin)
  await app.register(membershipPlugin)
  await app.register(adminPlugin)
  await app.register(billingLimitsPlugin)
  await app.register(auditLoggerPlugin)
  await app.register(validationPlugin)
  await app.register(swaggerPlugin)
  await app.register(rateLimitPlugin)
  await app.register(emailPlugin)
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } })
  await app.register(formbody)

  // Health
  app.get('/', async () => ({ status: 'ok' }))
  app.get('/health', async () => ({ status: 'ok' }))

  // API Routes
  await app.register(authRoutes, { prefix: '/api' })
  await app.register(usersRoutes, { prefix: '/api' })
  await app.register(organizationsRoutes, { prefix: '/api' })
  await app.register(agentsRoutes, { prefix: '/api' })
  await app.register(toolsRoutes, { prefix: '/api' })
  await app.register(deploymentsRoutes, { prefix: '/api' })
  await app.register(conversationsRoutes, { prefix: '/api' })
  await app.register(messagesRoutes, { prefix: '/api' })
  await app.register(knowledgeRoutes, { prefix: '/api' })
  await app.register(analyticsRoutes, { prefix: '/api' })
  await app.register(aiRoutes, { prefix: '/api' })
  await app.register(billingRoutes, { prefix: '/api' })
  await app.register(widgetsRoutes, { prefix: '/api' })
  await app.register(providerKeysRoutes, { prefix: '/api' })
  await app.register(dataManagementRoutes, { prefix: '/api' })
  await app.register(mcpRoutes, { prefix: '/api' })
  await app.register(contactRoutes, { prefix: '/api' })
  await app.register(avatarPresetsRoutes, { prefix: '/api' })
  await app.register(statusRoutes, { prefix: '/api' })
  await app.register(auditLogsRoutes, { prefix: '/api' })
  await app.register(adminRoutes, { prefix: '/api' })

  // 404
  app.setNotFoundHandler(async (request, reply) => {
    reply.code(404)
    return {
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    }
  })

  return app
}

async function start() {
  const app = await buildServer()
  const { PORT, HOST } = app.config

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`)
      shutdownDiscordGateway()
      await app.close()
      process.exit(0)
    })
  }

  process.on('unhandledRejection', (reason) => {
    app.log.error({ err: reason }, 'Unhandled rejection')
  })

  process.on('uncaughtException', (error) => {
    app.log.error({ err: error }, 'Uncaught exception')
  })

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`Server listening on ${HOST}:${PORT}`)
    if (app.config.DISCORD_GATEWAY_ENABLED) {
      initDiscordGateway(app.config.DISCORD_BOT_TOKEN)
    } else {
      app.log.info('Discord gateway disabled via DISCORD_GATEWAY_ENABLED=false')
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
