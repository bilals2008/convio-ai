import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@convio/database'
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

export async function isPlatformAdmin(email: string): Promise<boolean> {
  const adminEmails = getAdminEmails()
  if (adminEmails.size > 0 && adminEmails.has(email.toLowerCase())) return true

  const grant = await prisma.adminGrant.findFirst({
    where: { email: email.toLowerCase(), expiresAt: { gt: new Date() } },
  })
  return !!grant
}

export default fp(async function adminPlugin(fastify: FastifyInstance) {
  fastify.decorate('ensurePlatformAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!(await isPlatformAdmin(request.user.email))) {
      throw new AppError(403, 'Platform admin access required', 'FORBIDDEN')
    }
  })
}, {
  name: 'admin',
  dependencies: ['auth'],
})