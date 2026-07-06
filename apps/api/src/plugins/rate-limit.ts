import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

export default fp(async function rateLimitPlugin(fastify: FastifyInstance) {
  try {
    const { default: rateLimit } = await import('@fastify/rate-limit')

    await fastify.register(rateLimit, {
      global: true,
      max: 100,
      timeWindow: '1 minute',
      allowList: ['127.0.0.1', 'localhost'],
      keyGenerator: (request) => {
        return request.ip
      },
    })

    fastify.log.info('Rate limiting enabled: 100 req/min')
  } catch {
    fastify.log.warn('Rate limit plugin not installed, skipping')
  }
}, {
  name: 'rate-limit',
  dependencies: ['config'],
})
