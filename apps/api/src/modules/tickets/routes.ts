import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { AppError } from '../../plugins/error.js'
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

const ticketParamsSchema = z.object({
  orgId: z.string().uuid(),
  ticketId: z.string().uuid(),
})

const ticketQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
})

const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
})

const ticketMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        size: z.number().int().positive().max(10 * 1024 * 1024),
        type: z.string().max(100),
        path: z.string().min(1).max(1024),
      })
    )
    .max(5)
    .default([]),
})

const AUTHOR_SELECT = { id: true, name: true, email: true, avatar: true } as const

interface Attachment {
  name: string
  size: number
  type: string
  path: string
}

function serializeAttachments(value: unknown): Attachment[] {
  return Array.isArray(value) ? (value as Attachment[]) : []
}

async function getTicketForRole(fastify: FastifyInstance, userId: string, orgId: string, ticketId: string) {
  const membership = await fastify.getMembership(userId, orgId)
  const isAdmin = membership.role === 'owner' || membership.role === 'admin'

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      organizationId: orgId,
      ...(isAdmin ? {} : { reporterId: userId }),
    },
  })
  if (!ticket) throw new AppError(404, 'Ticket not found')
  return { ticket, isAdmin }
}

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

  fastify.get('/organizations/:orgId/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: ticketParamsSchema })],
  }, async (request) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const { ticket } = await getTicketForRole(fastify, request.userId!, orgId, ticketId)

    const [messages, reporter, reads] = await Promise.all([
      prisma.supportTicketMessage.findMany({
        where: { ticketId },
        include: { author: { select: AUTHOR_SELECT } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.profile.findUnique({
        where: { id: ticket.reporterId },
        select: AUTHOR_SELECT,
      }),
      prisma.supportTicketRead.findMany({ where: { ticketId } }),
    ])

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
        reporter: reporter ?? { id: ticket.reporterId, name: null, email: '', avatar: null },
        reads: reads.map((r) => ({ userId: r.userId, lastReadAt: r.lastReadAt })),
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          attachments: serializeAttachments(m.attachments),
          createdAt: m.createdAt,
          author: m.author,
        })),
      },
    }
  })

  fastify.post('/organizations/:orgId/tickets/:ticketId/messages', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: ticketParamsSchema, body: ticketMessageSchema })],
  }, async (request) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const { content, attachments } = request.body as z.infer<typeof ticketMessageSchema>
    const { ticket, isAdmin } = await getTicketForRole(fastify, request.userId!, orgId, ticketId)

    const message = await prisma.supportTicketMessage.create({
      data: { ticketId, authorId: request.userId!, content, attachments },
      include: { author: { select: AUTHOR_SELECT } },
    })

    if (isAdmin) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      })
      emitDomainEvent(NOTIFICATION_EVENTS.TICKET_REPLIED, {
        organizationId: orgId,
        actorId: request.userId!,
        userId: ticket.reporterId,
        entityId: ticket.id,
        entityName: ticket.title,
        actionUrl: `/support/${ticket.id}`,
      })
    } else {
      emitDomainEvent(NOTIFICATION_EVENTS.TICKET_REPLIED, {
        organizationId: orgId,
        actorId: request.userId!,
        entityId: ticket.id,
        entityName: ticket.title,
        actionUrl: `/support/${ticket.id}`,
      })
    }

    return { data: message }
  })

  fastify.post('/organizations/:orgId/tickets/:ticketId/read', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: ticketParamsSchema })],
  }, async (request) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    await getTicketForRole(fastify, request.userId!, orgId, ticketId)

    const read = await prisma.supportTicketRead.upsert({
      where: { ticketId_userId: { ticketId, userId: request.userId! } },
      create: { ticketId, userId: request.userId! },
      update: { lastReadAt: new Date() },
    })

    return { data: read }
  })

  fastify.patch('/organizations/:orgId/tickets/:ticketId', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: ticketParamsSchema, body: updateTicketSchema })],
  }, async (request) => {
    const { orgId, ticketId } = request.params as { orgId: string; ticketId: string }
    const body = request.body as { status?: string }
    const { ticket } = await getTicketForRole(fastify, request.userId!, orgId, ticketId)

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.status === 'resolved' || body.status === 'closed' ? { resolvedAt: new Date() } : {}),
      },
      include: { reporter: { select: { id: true, name: true, email: true, avatar: true } } },
    })

    if (body.status && body.status !== ticket.status) {
      emitDomainEvent(NOTIFICATION_EVENTS.TICKET_STATUS_CHANGED, {
        organizationId: orgId,
        actorId: request.userId!,
        userId: ticket.reporterId,
        entityId: ticket.id,
        entityName: ticket.title,
        metadata: { status: body.status },
        actionUrl: `/support/${ticket.id}`,
      })
    }

    return { data: updated }
  })
}