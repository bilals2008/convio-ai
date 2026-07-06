import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { updateUserSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const paginationQuerySchema = z.object({
  orgId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const userByIdQuerySchema = z.object({
  orgId: z.string().uuid(),
})

const userByIdParamsSchema = z.object({
  id: z.string().uuid(),
})

async function requireAdmin(userId: string, orgId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN')
  }
}

export default async function usersRoutes(fastify: FastifyInstance) {
  // GET /api/users/me — Current user profile
  fastify.get('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await prisma.user.findUnique({ where: { id: request.userId } })
    if (!user) throw new AppError(404, 'User not found')
    return { data: user }
  })

  // PATCH /api/users/me — Update current user profile
  fastify.patch('/users/me', {
    preHandler: [fastify.authenticate, validate({ body: updateUserSchema })],
  }, async (request) => {
    const user = await prisma.user.update({
      where: { id: request.userId },
      data: request.body as any,
    })
    return { data: user }
  })

  // DELETE /api/users/me — Delete current user account
  fastify.delete('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    await prisma.user.delete({ where: { id: request.userId } })
    reply.code(204).send()
  })

  // GET /api/users — List org members (admin only, cursor-based pagination)
  fastify.get('/users', {
    preHandler: [
      fastify.authenticate,
      validate({ query: paginationQuerySchema }),
    ],
  }, async (request) => {
    const { orgId, cursor, limit } = request.query as {
      orgId: string
      cursor?: string
      limit: number
    }

    await requireAdmin(request.userId!, orgId)

    const memberships = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: true },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' },
    })

    const hasNextPage = memberships.length > limit
    const items = hasNextPage ? memberships.slice(0, limit) : memberships

    return {
      data: items.map((m) => ({
        ...m.user,
        role: m.role,
        joinedAt: m.createdAt,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/users/:id — Get user by ID (admin only)
  fastify.get('/users/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: userByIdParamsSchema, query: userByIdQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { orgId } = request.query as { orgId: string }

    await requireAdmin(request.userId!, orgId)

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: id, organizationId: orgId } },
      include: { user: true },
    })

    if (!membership) throw new AppError(404, 'User not found in this organization')

    return {
      data: {
        ...membership.user,
        role: membership.role,
        joinedAt: membership.createdAt,
      },
    }
  })
}
