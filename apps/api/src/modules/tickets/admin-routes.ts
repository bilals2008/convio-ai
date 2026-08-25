import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { validate } from '../../plugins/validate.js'

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const

const adminTicketsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
})

export default async function adminTicketRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/tickets/stats', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin],
  }, async () => {
    const [total, open, inProgress] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'in_progress' } }),
    ])
    return { data: { total, open, inProgress } }
  })

  fastify.get('/admin/tickets', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: adminTicketsQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search, status } = request.query as {
      cursor?: string; limit: number; search?: string; status?: string
    }

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reporter: { email: { contains: search, mode: 'insensitive' } } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { messages: true } },
      },
    })

    const hasNextPage = tickets.length > limit
    const items = hasNextPage ? tickets.slice(0, limit) : tickets

    return {
      data: items.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt,
        reporter: t.reporter,
        organization: t.organization,
        messageCount: t._count.messages,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })
}
