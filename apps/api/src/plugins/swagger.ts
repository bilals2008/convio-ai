import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

export default fp(async function swaggerPlugin(fastify: FastifyInstance) {
  // Swagger UI at /docs
  try {
    const { default: swagger } = await import('@fastify/swagger')
    const { default: swaggerUi } = await import('@fastify/swagger-ui')

    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Convio API',
          description: 'AI Chatbot & Agent Management Platform',
          version: '1.0.0',
        },
        servers: [{ url: 'http://localhost:3000', description: 'Development' }],
        tags: [
          { name: 'auth', description: 'Authentication' },
          { name: 'users', description: 'User management' },
          { name: 'organizations', description: 'Organization management' },
          { name: 'agents', description: 'AI agent management' },
          { name: 'bots', description: 'Chatbot management' },
          { name: 'conversations', description: 'Conversation management' },
          { name: 'messages', description: 'Message management' },
          { name: 'knowledge', description: 'Knowledge base management' },
          { name: 'analytics', description: 'Analytics and reports' },
          { name: 'integrations', description: 'Channel integrations' },
        ],
      },
    })

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list' },
    })

    fastify.log.info('Swagger docs available at /docs')
  } catch {
    fastify.log.warn('Swagger plugins not installed, skipping')
  }
}, {
  name: 'swagger',
  dependencies: ['config'],
})
