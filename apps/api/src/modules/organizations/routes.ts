import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createOrganizationSchema, updateOrganizationSchema, membershipRoleSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  id: z.string().uuid(),
})

const memberParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: membershipRoleSchema.refine((r) => r !== 'owner', {
    message: 'Cannot add a member as owner. Use transfer ownership instead.',
  }),
})

const updateRoleSchema = z.object({
  role: membershipRoleSchema,
})

const membersQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

async function getMembership(userId: string, orgId: string): Promise<{ role: MembershipRole }> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  if (!membership) {
    throw new AppError(403, 'You do not belong to this organization', 'FORBIDDEN')
  }

  return { role: membership.role as MembershipRole }
}

async function requireAdmin(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'admin' && role !== 'owner') {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN')
  }
}

async function requireOwner(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'owner') {
    throw new AppError(403, 'Owner access required', 'FORBIDDEN')
  }
}

export default async function organizationsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations — Create new organization (creator becomes owner)
  fastify.post('/organizations', {
    preHandler: [fastify.authenticate, validate({ body: createOrganizationSchema })],
  }, async (request) => {
    const { name, slug, logo, plan } = request.body as {
      name: string
      slug: string
      logo?: string
      plan?: string
    }

    const org = await prisma.organization.create({
      data: { name, slug, logo, plan: plan || 'free' },
    })

    await prisma.membership.create({
      data: { userId: request.userId!, organizationId: org.id, role: 'owner' },
    })

    return { data: org }
  })

  // GET /api/organizations — List user's organizations
  fastify.get('/organizations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: request.userId },
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    })

    const orgs = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }))

    return { data: orgs }
  })

  // GET /api/organizations/:id — Get organization by ID (member only)
  fastify.get('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    await getMembership(request.userId!, id)

    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) throw new AppError(404, 'Organization not found')

    return { data: org }
  })

  // PATCH /api/organizations/:id — Update organization (admin/owner only)
  fastify.patch('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: updateOrganizationSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    await requireAdmin(request.userId!, id)

    const org = await prisma.organization.update({
      where: { id },
      data: request.body as any,
    })

    return { data: org }
  })

  // DELETE /api/organizations/:id — Delete organization (owner only)
  fastify.delete('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await requireOwner(request.userId!, id)

    await prisma.organization.delete({ where: { id } })
    reply.code(204).send()
  })

  // GET /api/organizations/:id/members — List members (member only, cursor pagination)
  fastify.get('/organizations/:id/members', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: membersQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    await getMembership(request.userId!, id)

    const memberships = await prisma.membership.findMany({
      where: { organizationId: id },
      include: { user: true },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
    })

    const hasNextPage = memberships.length > limit
    const items = hasNextPage ? memberships.slice(0, limit) : memberships

    return {
      data: items.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
        },
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // POST /api/organizations/:id/members — Add member (admin only)
  fastify.post('/organizations/:id/members', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: addMemberSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { userId, role } = request.body as { userId: string; role: 'admin' | 'member' | 'viewer' }

    await requireAdmin(request.userId!, id)

    const existing = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (existing) {
      throw new AppError(409, 'User is already a member of this organization', 'CONFLICT')
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError(404, 'User not found')

    const membership = await prisma.membership.create({
      data: { userId, organizationId: id, role },
      include: { user: true },
    })

    return {
      data: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.createdAt,
        user: {
          id: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
          image: membership.user.image,
        },
      },
    }
  })

  // DELETE /api/organizations/:id/members/:userId — Remove member (admin or self-leave)
  fastify.delete('/organizations/:id/members/:userId', {
    preHandler: [
      fastify.authenticate,
      validate({ params: memberParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string }

    const targetMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (!targetMembership) {
      throw new AppError(404, 'Member not found in this organization')
    }

    const isSelf = request.userId === userId

    if (!isSelf) {
      await requireAdmin(request.userId!, id)
    }

    if (targetMembership.role === 'owner') {
      const ownerCount = await prisma.membership.count({
        where: { organizationId: id, role: 'owner' },
      })

      if (ownerCount <= 1) {
        throw new AppError(400, 'Cannot remove the last owner. Transfer ownership first.', 'LAST_OWNER')
      }
    }

    await prisma.membership.delete({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    reply.code(204).send()
  })

  // PATCH /api/organizations/:id/members/:userId/role — Update member role (owner only)
  fastify.patch('/organizations/:id/members/:userId/role', {
    preHandler: [
      fastify.authenticate,
      validate({ params: memberParamsSchema, body: updateRoleSchema }),
    ],
  }, async (request) => {
    const { id, userId } = request.params as { id: string; userId: string }
    const { role } = request.body as { role: MembershipRole }

    await requireOwner(request.userId!, id)

    const targetMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (!targetMembership) {
      throw new AppError(404, 'Member not found in this organization')
    }

    if (targetMembership.role === 'owner' && role !== 'owner') {
      const ownerCount = await prisma.membership.count({
        where: { organizationId: id, role: 'owner' },
      })

      if (ownerCount <= 1) {
        throw new AppError(400, 'Cannot demote the last owner. Transfer ownership first.', 'LAST_OWNER')
      }
    }

    if (role === 'owner') {
      await prisma.membership.update({
        where: { userId_organizationId: { userId: request.userId!, organizationId: id } },
        data: { role: 'admin' },
      })
    }

    const updated = await prisma.membership.update({
      where: { userId_organizationId: { userId, organizationId: id } },
      data: { role },
      include: { user: true },
    })

    return {
      data: {
        id: updated.id,
        role: updated.role,
        joinedAt: updated.createdAt,
        user: {
          id: updated.user.id,
          name: updated.user.name,
          email: updated.user.email,
          image: updated.user.image,
        },
      },
    }
  })
}
