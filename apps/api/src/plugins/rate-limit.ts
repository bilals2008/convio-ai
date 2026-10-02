import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

// ponytail: in-memory per-IP store — fine for a single instance. If you ever
// run multiple instances or need counters to survive restarts, pass a Redis
// client via @fastify/rate-limit's `redis` option.
export default fp(async function rateLimitPlugin(fastify: FastifyInstance) {
  try {
    const { default: rateLimit } = await import('@fastify/rate-limit')

    await fastify.register(rateLimit, {
      global: true,
      max: 100,
      timeWindow: '1 minute',
      // No allowList: exempting loopback made the limiter trivially bypassable,
      // because request.ip is only as trustworthy as the trustProxy hop count.
      // Internal callers (cron) authenticate with CRON_SECRET instead.
      keyGenerator: (request) => request.ip,
    })

    fastify.log.info('Rate limiting enabled: 100 req/min')
  } catch {
    fastify.log.warn('Rate limit plugin not installed, skipping')
  }
}, {
  name: 'rate-limit',
  dependencies: ['config'],
})
