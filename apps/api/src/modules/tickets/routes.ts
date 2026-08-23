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
}
