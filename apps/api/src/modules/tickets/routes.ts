import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { emitDomainEvent, NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { validate } from '../../plugins/validate.js'

const TICKET_CATEGORIES = ['general', 'bug', 'billing', 'feature', 'account', 'other'] as const
const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const

const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1).max(10000),
  category: z.enum(TICKET_CATEGORIES).default('general'),
  priority: z.enum(TICKET_PRIORITIES).default('normal'),
})

const ticketQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
})

const createMessageSchema = z.object({
  content: z.string().min(1).max(10000),
})

const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
}).refine((d) => d.status !== undefined || d.priority !== undefined, {
  message: 'Nothing to update',
})

const ticketMessageSelect = {
  id: true,
  authorId: true,
  content: true,
  isInternalNote: true,
  createdAt: true,
  author: { select: { id: true, name: true, email: true, avatar: true } },
} as const

export default async function ticketRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/tickets', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ query: ticketQuerySchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { status } = request.query as { status?: string }
    const membership = await fastify.getMembership(request.userId!, orgId)
    const isAdmin = membership.role === 'owner' || membership.role === 'admin'

    const tickets = await prisma.supportTicket.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(isAdmin ? {} : { reporterId: request.userId }),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })

    return {
      data: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        reporter: t.reporter,
        messageCount: t._count.messages,
      })),
    }
  })

  fastify.post('/organizations/:orgId/tickets', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ body: createTicketSchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const body = request.body as z.infer<typeof createTicketSchema>

    const ticket = await prisma.supportTicket.create({
      data: {
        organizationId: orgId,
        reporterId: request.userId!,
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority,
      },
      include: { reporter: { select: { id: true, name: true, email: true, avatar: true } } },
    })

    emitDomainEvent(NOTIFICATION_EVENTS.TICKET_CREATED, {
      organizationId: orgId,
      actorId: request.userId!,
      entityId: ticket.id,
      entityName: ticket.title,
      actionUrl: `/support/${ticket.id}`,
    })

    return { data: ticket }
  })

  fastify.get('/organizations/:orgId/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.requireMembership],
  }, async (request, reply) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const membership = await fastify.getMembership(request.userId!, orgId)
    const isAdmin = membership.role === 'owner' || membership.role === 'admin'

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, organizationId: orgId, deletedAt: null },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        messages: {
          where: isAdmin ? {} : { isInternalNote: false },
          orderBy: { createdAt: 'asc' },
          select: ticketMessageSelect,
        },
      },
    })

    if (!ticket) return reply.code(404).send({ error: 'Ticket not found' })
    if (ticket.reporterId !== request.userId && !isAdmin) return reply.code(403).send({ error: 'Forbidden' })

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
        isReporter: ticket.reporterId === request.userId,
        messages: ticket.messages,
      },
    }
  })

  fastify.post('/organizations/:orgId/tickets/:ticketId/messages', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ body: createMessageSchema })],
  }, async (request, reply) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const body = request.body as z.infer<typeof createMessageSchema>
    const membership = await fastify.getMembership(request.userId!, orgId)
    const isAdmin = membership.role === 'owner' || membership.role === 'admin'

    const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, organizationId: orgId, deletedAt: null } })
    if (!ticket) return reply.code(404).send({ error: 'Ticket not found' })
    if (ticket.reporterId !== request.userId && !isAdmin) return reply.code(403).send({ error: 'Forbidden' })

    // ponytail: internal notes don't touch ticket.updatedAt so list order stays customer-driven
    const message = await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: { ticketId, authorId: request.userId!, content: body.content },
        select: ticketMessageSelect,
      }),
      prisma.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } }),
    ])

    return { data: message[0] }
  })

  fastify.patch('/organizations/:orgId/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ body: updateTicketSchema })],
  }, async (request, reply) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const body = request.body as z.infer<typeof updateTicketSchema>
    const membership = await fastify.getMembership(request.userId!, orgId)
    const isAdmin = membership.role === 'owner' || membership.role === 'admin'

    const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, organizationId: orgId, deletedAt: null } })
    if (!ticket) return reply.code(404).send({ error: 'Ticket not found' })

    // ponytail: reporters may only open/close their own tickets; priority and
    // everything else stays staff-side (platform admin routes)
    const isReporter = ticket.reporterId === request.userId
    if (isAdmin) {
      if (body.priority && !TICKET_PRIORITIES.includes(body.priority as typeof TICKET_PRIORITIES[number])) {
        return reply.code(400).send({ error: 'Invalid priority' })
      }
    } else if (!isReporter || body.priority || (body.status !== undefined && body.status !== 'closed' && body.status !== 'open')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(isAdmin && body.priority ? { priority: body.priority } : {}),
        ...(body.status === 'resolved' ? { resolvedAt: new Date() } : {}),
        ...(body.status && body.status !== 'resolved' && ticket.resolvedAt ? { resolvedAt: null } : {}),
      },
    })

    return { data: { id: updated.id, status: updated.status, priority: updated.priority } }
  })
}
