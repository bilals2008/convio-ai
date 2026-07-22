import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

/**
 * Security headers plugin using @fastify/helmet.
 * Protects against common web vulnerabilities by setting secure HTTP headers.
 */
export default fp(async function helmetPlugin(fastify: FastifyInstance) {
  try {
    const { default: helmet } = await import('@fastify/helmet')
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Disabled to allow swagger UI and widget embedding
      crossOriginEmbedderPolicy: false,
    })
    fastify.log.info('Security headers (helmet) enabled')
  } catch {
    fastify.log.warn('@fastify/helmet not installed — security headers disabled')
  }
}, {
  name: 'helmet',
  dependencies: ['config'],
})
