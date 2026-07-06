import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '@convio/auth'

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    session?: {
      user: { id: string; name: string; email: string; avatar?: string }
      session: { id: string }
    }
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('userId', undefined)
  fastify.decorateRequest('session', undefined)

  async function getSessionFromRequest(request: FastifyRequest) {
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(request.headers)) {
      if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : v
    }
    const session = await auth.api.getSession({ headers })
    return session
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await getSessionFromRequest(request)
    if (!session) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired session' })
      return
    }
    request.userId = session.user.id
    request.session = session
  })

  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    const session = await getSessionFromRequest(request)
    if (session) {
      request.userId = session.user.id
      request.session = session
    }
  })
}, {
  name: 'auth',
})
