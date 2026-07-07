import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from './error.js'

type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

declare module 'fastify' {
  interface FastifyRequest {
    membership?: { role: MembershipRole }
  }
  interface FastifyInstance {
    requireMembership: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireOwner: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    getMembership: (userId: string, orgId: string) => Promise<{ role: MembershipRole }>
    ensureAdmin: (userId: string, orgId: string) => Promise<void>
    ensureOwner: (userId: string, orgId: string) => Promise<void>
  }
}

async function getMembership(userId: string, orgId: string): Promise<{ role: MembershipRole }> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })
  if (!membership) {
    throw new AppError(403, 'You do not belong to this organization', 'FORBIDDEN')
  }
  return { role: membership.role as MembershipRole }
}

async function ensureAdmin(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'admin' && role !== 'owner') {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN')
  }
}

async function ensureOwner(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'owner') {
    throw new AppError(403, 'Owner access required', 'FORBIDDEN')
  }
}

export default fp(async function membershipPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('membership', undefined)

  fastify.decorate('requireMembership', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.params as { orgId?: string }
    if (!orgId || !request.userId) {
      throw new AppError(400, 'Missing orgId or authentication', 'BAD_REQUEST')
    }
    request.membership = await getMembership(request.userId, orgId)
  })

  fastify.decorate('requireAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.params as { orgId?: string }
    if (!orgId || !request.userId) {
      throw new AppError(400, 'Missing orgId or authentication', 'BAD_REQUEST')
    }
    const membership = await getMembership(request.userId, orgId)
    if (membership.role !== 'admin' && membership.role !== 'owner') {
      throw new AppError(403, 'Admin access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('requireOwner', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { orgId } = request.params as { orgId?: string }
    if (!orgId || !request.userId) {
      throw new AppError(400, 'Missing orgId or authentication', 'BAD_REQUEST')
    }
    const membership = await getMembership(request.userId, orgId)
    if (membership.role !== 'owner') {
      throw new AppError(403, 'Owner access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('getMembership', async (userId: string, orgId: string) => {
    return getMembership(userId, orgId)
  })

  fastify.decorate('ensureAdmin', async (userId: string, orgId: string) => {
    await ensureAdmin(userId, orgId)
  })

  fastify.decorate('ensureOwner', async (userId: string, orgId: string) => {
    await ensureOwner(userId, orgId)
  })
}, {
  name: 'membership',
  dependencies: ['auth'],
})
