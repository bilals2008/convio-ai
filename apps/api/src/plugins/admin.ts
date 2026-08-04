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

export function isPlatformAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails()
  return adminEmails.size > 0 && adminEmails.has(email.toLowerCase())
}

export default fp(async function adminPlugin(fastify: FastifyInstance) {
  fastify.decorate('ensurePlatformAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!isPlatformAdminEmail(request.user.email)) {
      throw new AppError(403, 'Platform admin access required', 'FORBIDDEN')
    }
  })
}, {
  name: 'admin',
  dependencies: ['auth'],
})
