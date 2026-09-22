import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getPrisma } from '@convio/database'

declare module 'fastify' {
  interface FastifyInstance {
    requireFreshSession: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    authenticateSensitive: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

/**
 * Rejects tokens whose session has been revoked, whose user has been banned, or
 * whose account was deleted.
 *
 * Locally verified (JWKS) tokens stay cryptographically valid until they
 * expire, so revocation is not observed by signature verification alone. This
 * guard closes that window against the project's own database — no Supabase
 * Auth round-trip.
 *
 * Prefer `fastify.authenticateSensitive` on routes where a leaked-but-unrevoked
 * token could do lasting damage — it pairs this check with authentication in
 * one preHandler. Use `requireFreshSession` directly only when you need to
 * place it somewhere other than immediately after `authenticate`.
 */
export default fp(async function sessionGuardPlugin(fastify: FastifyInstance) {
  fastify.decorate('requireFreshSession', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired session' })
      return
    }

    // Legacy verification already round-trips to the Auth server, which rejects
    // revoked sessions and banned users. Nothing further to check.
    if (request.authMethod === 'legacy') return

    if (!request.sessionId) {
      // `session_id` is a required claim, so its absence means the token cannot
      // be tied to a revocable session at all.
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Session is missing' })
      return
    }

    let valid = false
    try {
      const rows = await getPrisma().$queryRaw<{ id: string }[]>`
        select s.id
        from auth.sessions s
        join auth.users u on u.id = s.user_id
        where s.id = ${request.sessionId}::uuid
          and s.user_id = ${request.userId}::uuid
          and (s.not_after is null or s.not_after > now())
          and (u.banned_until is null or u.banned_until < now())
          and u.deleted_at is null
        limit 1
      `
      valid = rows.length > 0
    } catch (err) {
      // Fail closed by leaving `valid` false. A database outage already fails
      // every request through the profile lookup, so this adds no new mode.
      request.log.error({ err }, 'Session validation failed')
    }

    if (!valid) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Session is no longer valid' })
    }
  })

  // Drop-in replacement for `fastify.authenticate` on routes that must observe
  // revocation immediately. Same contract, one extra check.
  fastify.decorate('authenticateSensitive', async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request, reply)
    // `authenticate` sets userId only on success; on any failure it has already
    // replied, so there is nothing left to guard.
    if (!request.userId) return
    await fastify.requireFreshSession(request, reply)
  })
}, {
  name: 'session-guard',
  dependencies: ['auth'],
})
