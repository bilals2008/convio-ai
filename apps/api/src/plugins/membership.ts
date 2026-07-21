import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from './error.js'

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
}

const PERMISSIONS: Record<string, MembershipRole[]> = {
  'org.read': ['viewer', 'member', 'admin', 'owner'],
  'org.update': ['admin', 'owner'],
  'org.delete': ['owner'],
  'member.read': ['viewer', 'member', 'admin', 'owner'],
  'member.invite': ['admin', 'owner'],
  'member.remove': ['admin', 'owner'],
  'member.role.change': ['owner'],
  'agent.create': ['member', 'admin', 'owner'],
  'agent.update': ['admin', 'owner'],
  'agent.delete': ['admin', 'owner'],
  'agent.test': ['member', 'admin', 'owner'],
  'tool.create': ['admin', 'owner'],
  'tool.update': ['admin', 'owner'],
  'tool.delete': ['admin', 'owner'],
  'widget.create': ['admin', 'owner'],
  'widget.update': ['admin', 'owner'],
  'widget.delete': ['admin', 'owner'],
  'knowledge.create': ['member', 'admin', 'owner'],
  'knowledge.update': ['admin', 'owner'],
  'knowledge.delete': ['admin', 'owner'],
  'document.create': ['member', 'admin', 'owner'],
  'document.update': ['admin', 'owner'],
  'document.delete': ['admin', 'owner'],
  'deployment.create': ['member', 'admin', 'owner'],
  'deployment.update': ['admin', 'owner'],
  'deployment.delete': ['admin', 'owner'],
  'provider-key.manage': ['admin', 'owner'],
  'mcp-server.manage': ['admin', 'owner'],
  'data.delete': ['admin', 'owner'],
  'data.wipe': ['owner'],
}

declare module 'fastify' {
  interface FastifyRequest {
    membership?: { role: MembershipRole }
  }
  interface FastifyInstance {
    requireMembership: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireOwner: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRoleAtLeast: (minimumRole: MembershipRole) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    getMembership: (userId: string, orgId: string) => Promise<{ role: MembershipRole }>
    ensureAdmin: (userId: string, orgId: string) => Promise<void>
    ensureOwner: (userId: string, orgId: string) => Promise<void>
    ensureRoleAtLeast: (userId: string, orgId: string, minimumRole: MembershipRole) => Promise<void>
    hasPermission: (role: MembershipRole, permission: string) => boolean
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

function hasPermission(role: MembershipRole, permission: string): boolean {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

export default fp(async function membershipPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('membership', undefined)

  const resolveOrgId = (request: FastifyRequest): string => {
    const { orgId } = request.params as { orgId?: string }
    if (orgId) return orgId
    throw new AppError(400, 'Missing orgId parameter', 'BAD_REQUEST')
  }

  fastify.decorate('requireMembership', async (request: FastifyRequest, _reply: FastifyReply) => {
    const orgId = resolveOrgId(request)
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    request.membership = await getMembership(request.userId, orgId)
  })

  fastify.decorate('requireAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    const orgId = resolveOrgId(request)
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    const membership = await getMembership(request.userId, orgId)
    if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY['admin']) {
      throw new AppError(403, 'Admin access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('requireOwner', async (request: FastifyRequest, _reply: FastifyReply) => {
    const orgId = resolveOrgId(request)
    if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    const membership = await getMembership(request.userId, orgId)
    if (membership.role !== 'owner') {
      throw new AppError(403, 'Owner access required', 'FORBIDDEN')
    }
    request.membership = membership
  })

  fastify.decorate('requireRoleAtLeast', (minimumRole: MembershipRole) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      const orgId = resolveOrgId(request)
      if (!request.userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
      const membership = await getMembership(request.userId, orgId)
      if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minimumRole]) {
        throw new AppError(403, `${minimumRole} access required`, 'FORBIDDEN')
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

  fastify.decorate('hasPermission', (role: MembershipRole, permission: string) => {
    return hasPermission(role, permission)
  })
}, {
  name: 'membership',
  dependencies: ['auth'],
})
