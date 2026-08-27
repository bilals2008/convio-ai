import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const
const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

const adminTicketsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  deleted: z.enum(['true', 'false']).optional(),
})

const adminMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  isInternalNote: z.boolean().default(false),
})

const adminUpdateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
}).refine((d) => d.status !== undefined || d.priority !== undefined, {
  message: 'Nothing to update',
})

const adminBulkTicketSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  action: z.enum(['delete', 'restore']),
})

const ticketMessageSelect = {
  id: true,
  authorId: true,
  content: true,
  isInternalNote: true,
  createdAt: true,
  author: { select: { id: true, name: true, email: true, avatar: true } },
} as const

export default async function adminTicketRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/tickets/stats', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin],
  }, async () => {
    const [total, open, inProgress] = await Promise.all([
      prisma.supportTicket.count({ where: { deletedAt: null } }),
      prisma.supportTicket.count({ where: { deletedAt: null, status: 'open' } }),
      prisma.supportTicket.count({ where: { deletedAt: null, status: 'in_progress' } }),
    ])
    return { data: { total, open, inProgress } }
  })

  fastify.get('/admin/tickets', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: adminTicketsQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search, status, deleted } = request.query as {
      cursor?: string; limit: number; search?: string; status?: string; deleted?: 'true' | 'false'
    }

    const where: Record<string, unknown> = {}
    where.deletedAt = deleted === 'true' ? { not: null } : null
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

  fastify.get('/admin/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin],
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true, slug: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: ticketMessageSelect,
        },
      },
    })
    if (!ticket) return reply.code(404).send({ error: 'Ticket not found' })

    await prisma.supportTicketRead.upsert({
      where: { ticketId_userId: { ticketId, userId: request.userId! } },
      create: { ticketId, userId: request.userId! },
      update: { lastReadAt: new Date() },
    })

    return {
      data: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
        reporter: ticket.reporter,
        organization: ticket.organization,
        messages: ticket.messages,
      },
    }
  })

  fastify.post('/admin/tickets/:ticketId/messages', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: adminMessageSchema })],
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string }
    const body = request.body as z.infer<typeof adminMessageSchema>

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return reply.code(404).send({ error: 'Ticket not found' })

    // ponytail: internal notes don't touch ticket.updatedAt so list order stays customer-driven
    const message = await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId,
          authorId: request.userId!,
          content: body.content,
          isInternalNote: body.isInternalNote,
        },
        select: ticketMessageSelect,
      }),
      ...(body.isInternalNote ? [] : [prisma.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } })]),
    ])

    return { data: message[0] }
  })

  fastify.patch('/admin/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: adminUpdateTicketSchema })],
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string }
    const body = request.body as z.infer<typeof adminUpdateTicketSchema>

    const existing = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!existing) return reply.code(404).send({ error: 'Ticket not found' })

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
        ...(body.status === 'resolved' && !existing.resolvedAt ? { resolvedAt: new Date() } : {}),
        ...(body.status && body.status !== 'resolved' && existing.resolvedAt ? { resolvedAt: null } : {}),
      },
    })

    return { data: { id: updated.id, status: updated.status, priority: updated.priority } }
  })

  fastify.delete('/admin/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin],
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string }
    const existing = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!existing) return reply.code(404).send({ error: 'Ticket not found' })
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { deletedAt: new Date() } })
    return { data: { id: ticketId, deleted: true } }
  })

  fastify.post('/admin/tickets/:ticketId/restore', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin],
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string }
    const existing = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!existing) return reply.code(404).send({ error: 'Ticket not found' })
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { deletedAt: null } })
    return { data: { id: ticketId, deleted: false } }
  })

  fastify.post('/admin/tickets/bulk', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: adminBulkTicketSchema })],
  }, async (request) => {
    const { ids, action } = request.body as z.infer<typeof adminBulkTicketSchema>
    const result = await prisma.supportTicket.updateMany({
      where: { id: { in: ids } },
      data: action === 'delete' ? { deletedAt: new Date() } : { deletedAt: null },
    })
    return { data: { processed: result.count, action } }
  })

  // ponytail: soft-delete closed or unreplied tickets older than 7 days. Cron-guarded; call from a scheduler.
  fastify.post('/admin/tickets/cleanup', async (request, reply) => {
    const secret = process.env.CRON_SECRET
    if (secret && request.headers['x-cron-secret'] !== secret) {
      throw new AppError(403, 'Unauthorized', 'FORBIDDEN')
    }
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const closed = await prisma.$executeRaw`
      UPDATE support_tickets
      SET "deletedAt" = NOW()
      WHERE "deletedAt" IS NULL
        AND "status" = 'closed'
        AND "updatedAt" < ${cutoff}
    `
    const noReply = await prisma.$executeRaw`
      UPDATE support_tickets
      SET "deletedAt" = NOW()
      WHERE "deletedAt" IS NULL
        AND "status" IN ('open', 'in_progress')
        AND "updatedAt" < ${cutoff}
        AND NOT EXISTS (
          SELECT 1 FROM support_ticket_messages m
          WHERE m."ticketId" = support_tickets.id
            AND m."authorId" <> support_tickets."reporterId"
        )
    `
    return { data: { closed, noReply } }
  })
}
