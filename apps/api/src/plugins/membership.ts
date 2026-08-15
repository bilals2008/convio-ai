import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from './error.js'
import { ROLE_HIERARCHY, canAccess, type Permission } from '@convio/types'

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

declare module 'fastify' {
  interface FastifyRequest {
    membership?: { role: MembershipRole }
  }
  interface FastifyInstance {
    requireMembership: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireOwner: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRoleAtLeast: (minimumRole: MembershipRole) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requirePermission: (permission: Permission) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    getMembership: (userId: string, orgId: string) => Promise<{ role: MembershipRole }>
    ensureAdmin: (userId: string, orgId: string) => Promise<void>
    ensureOwner: (userId: string, orgId: string) => Promise<void>
    ensureRoleAtLeast: (userId: string, orgId: string, minimumRole: MembershipRole) => Promise<void>
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

async function ensureRoleAtLeast(userId: string, orgId: string, minimumRole: MembershipRole) {
  const { role } = await getMembership(userId, orgId)
  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minimumRole]) {
    throw new AppError(403, `${minimumRole} access required`, 'FORBIDDEN')
  }
}

// preHandler guards resolve the org from `:orgId` params or `orgId` query.
// Some org-scoped routes (organizations module) name the param `:id` — fall back to it.
// Entity-scoped routes (e.g. /agents/:id -> org) keep inline getMembership/ensure* calls.
function resolveOrgId(request: FastifyRequest): string {
  const params = request.params as { orgId?: string; id?: string }
  const query = request.query as { orgId?: string }
  const orgId = params.orgId ?? query.orgId ?? params.id
  if (!orgId) throw new AppError(400, 'Missing orgId parameter', 'BAD_REQUEST')
  return orgId
}

export default fp(async function membershipPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('membership', undefined)

  fastify.decorate('requireMembership', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    request.membership = await getMembership(request.userId, resolveOrgId(request))
  })

  fastify.decorate('requireAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    const orgId = resolveOrgId(request)
    const membership = await getMembership(request.userId, orgId)
    if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY['admin']) {
      throw new AppError(403, 'Admin access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('requireOwner', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    const orgId = resolveOrgId(request)
    const membership = await getMembership(request.userId, orgId)
    if (membership.role !== 'owner') {
      throw new AppError(403, 'Owner access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('requireRoleAtLeast', (minimumRole: MembershipRole) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
      const orgId = resolveOrgId(request)
      const membership = await getMembership(request.userId, orgId)
      if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minimumRole]) {
        throw new AppError(403, `${minimumRole} access required`, 'FORBIDDEN')
      }
      request.membership = membership
    }
  })

  fastify.decorate('requirePermission', (permission: Permission) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
      const orgId = resolveOrgId(request)
      const membership = await getMembership(request.userId, orgId)
      if (!canAccess(membership.role, permission)) {
        throw new AppError(403, `You do not have permission: ${permission}`, 'FORBIDDEN')
      }
      request.membership = membership
    }
  })

  fastify.decorate('getMembership', async (userId: string, orgId: string) => {
    return getMembership(userId, orgId)
  })

  fastify.decorate('ensureAdmin', async (userId: string, orgId: string) => {
    await ensureRoleAtLeast(userId, orgId, 'admin')
  })

  fastify.decorate('ensureOwner', async (userId: string, orgId: string) => {
    const { role } = await getMembership(userId, orgId)
    if (role !== 'owner') {
      throw new AppError(403, 'Owner access required', 'FORBIDDEN')
    }
  })

  fastify.decorate('ensureRoleAtLeast', async (userId: string, orgId: string, minimumRole: MembershipRole) => {
    await ensureRoleAtLeast(userId, orgId, minimumRole)
  })
}, {
  name: 'membership',
  dependencies: ['auth'],
})
