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
import auditLoggerPlugin from './plugins/audit-logger.js'
import swaggerPlugin from './plugins/swagger.js'
import rateLimitPlugin from './plugins/rate-limit.js'
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
import playgroundRoutes from './modules/playground/routes.js'
import billingRoutes from './modules/billing/routes.js'
import widgetsRoutes from './modules/widgets/routes.js'
import providerKeysRoutes from './modules/provider-keys/routes.js'
import apiKeysRoutes from './modules/api-keys/routes.js'
import auditLogRoutes from './modules/audit-logs/routes.js'
import ssoRoutes from './modules/sso/routes.js'
import moderationRoutes from './modules/moderation/routes.js'

async function buildServer() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  })

  // Plugins
  await app.register(configPlugin)
  await app.register(errorHandlerPlugin)
  await app.register(corsPlugin)
  await app.register(authPlugin)
  await app.register(membershipPlugin)
  await app.register(auditLoggerPlugin)
  await app.register(validationPlugin)
  await app.register(swaggerPlugin)
  await app.register(rateLimitPlugin)
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } })
  await app.register(formbody)

  // Health
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
  await app.register(playgroundRoutes, { prefix: '/api' })
  await app.register(billingRoutes, { prefix: '/api' })
  await app.register(widgetsRoutes, { prefix: '/api' })
  await app.register(providerKeysRoutes, { prefix: '/api' })
  await app.register(apiKeysRoutes, { prefix: '/api' })
  await app.register(auditLogRoutes, { prefix: '/api' })
  await app.register(ssoRoutes, { prefix: '/api' })
  await app.register(moderationRoutes, { prefix: '/api' })

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
      await app.close()
      process.exit(0)
    })
  }

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`Server listening on ${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
