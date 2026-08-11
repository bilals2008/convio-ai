import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { AppError } from '../../plugins/error.js'
import { validate } from '../../plugins/validate.js'
import { emitDomainEvent, NOTIFICATION_EVENTS } from '../../services/notifications/events.js'

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const

const adminTicketsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
})

const adminTicketParamsSchema = z.object({
  ticketId: z.string().uuid(),
})

const adminTicketUpdateSchema = z.object({
  status: z.enum(TICKET_STATUSES),
})

const adminReplySchema = z.object({
  content: z.string().min(1).max(5000),
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

  fastify.get('/admin/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminTicketParamsSchema })],
  }, async (request) => {
    const { ticketId } = request.params as { ticketId: string }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true, slug: true, plan: true } },
      },
    })
    if (!ticket) throw new AppError(404, 'Ticket not found')

    const messages = await prisma.supportTicketMessage.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
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
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          author: m.author,
        })),
      },
    }
  })

  fastify.patch('/admin/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminTicketParamsSchema, body: adminTicketUpdateSchema })],
  }, async (request) => {
    const { ticketId } = request.params as { ticketId: string }
    const { status } = request.body as { status: string }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new AppError(404, 'Ticket not found')

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === 'resolved' || status === 'closed' ? { resolvedAt: new Date() } : {}),
      },
      include: { reporter: { select: { id: true, name: true, email: true, avatar: true } } },
    })

    if (status !== ticket.status) {
      emitDomainEvent(NOTIFICATION_EVENTS.TICKET_STATUS_CHANGED, {
        organizationId: ticket.organizationId,
        actorId: request.userId!,
        userId: ticket.reporterId,
        entityId: ticket.id,
        entityName: ticket.title,
        metadata: { status },
        actionUrl: `/support/${ticket.id}`,
      })
    }

    return { data: updated }
  })

  fastify.post('/admin/tickets/:ticketId/messages', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminTicketParamsSchema, body: adminReplySchema })],
  }, async (request) => {
    const { ticketId } = request.params as { ticketId: string }
    const { content } = request.body as { content: string }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new AppError(404, 'Ticket not found')

    const message = await prisma.supportTicketMessage.create({
      data: { ticketId, authorId: request.userId!, content },
    })

    if (ticket.status === 'open' || ticket.status === 'in_progress') {
      await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'in_progress' } })
    }

    emitDomainEvent(NOTIFICATION_EVENTS.TICKET_REPLIED, {
      organizationId: ticket.organizationId,
      actorId: request.userId!,
      userId: ticket.reporterId,
      entityId: ticket.id,
      entityName: ticket.title,
      metadata: { sender: 'org_admin' },
      actionUrl: `/support/${ticket.id}`,
    })

    return { data: message }
  })
}