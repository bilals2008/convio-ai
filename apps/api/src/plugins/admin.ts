import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from './error.js'

declare module 'fastify' {
  interface FastifyInstance {
    ensurePlatformAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

function getAdminEmails(): Set<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS || ''
  return new Set(raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))
}

export default fp(async function adminPlugin(fastify: FastifyInstance) {
  fastify.decorate('ensurePlatformAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    const adminEmails = getAdminEmails()
    if (adminEmails.size === 0) {
      fastify.log.warn('PLATFORM_ADMIN_EMAILS not configured — admin routes disabled')
      throw new AppError(403, 'Admin access not configured', 'FORBIDDEN')
    }

    if (!adminEmails.has(request.user.email.toLowerCase())) {
      throw new AppError(403, 'Platform admin access required', 'FORBIDDEN')
    }
  })
}, {
  name: 'admin',
  dependencies: ['auth'],
})
