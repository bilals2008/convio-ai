import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const documentTypes = ['txt', 'pdf', 'csv', 'md', 'json', 'url'] as const
type DocumentType = (typeof documentTypes)[number]

const documentStatuses = ['pending', 'processing', 'ready', 'error', 'archived'] as const

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const kbParamsSchema = z.object({
  id: z.string().uuid(),
})

const docParamsSchema = z.object({
  id: z.string().uuid(),
})

const kbListQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const docListQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.enum(documentStatuses).optional(),
})

const createKbBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
})

const updateKbBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
})

const createDocBodySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(documentTypes),
  content: z.string().max(50000).optional(),
  url: z.string().url().optional(),
}).refine(
  (data) => {
    if (data.type === 'url') return !!data.url
    return !!data.content
  },
  { message: 'Content is required for file types; url is required for url type' },
)

const updateDocBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional().nullable(),
  url: z.string().url().optional().nullable(),
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

export default async function knowledgeRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/knowledge-bases — Create knowledge base (member only)
  fastify.post('/organizations/:orgId/knowledge-bases', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createKbBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { name, description } = request.body as { name: string; description?: string }

    await getMembership(request.userId!, orgId)

    const kb = await prisma.knowledgeBase.create({
      data: { organizationId: orgId, name, description },
    })

    return { data: kb }
  })

  // GET /api/organizations/:orgId/knowledge-bases — List knowledge bases (member only, paginated)
  fastify.get('/organizations/:orgId/knowledge-bases', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: kbListQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    await getMembership(request.userId!, orgId)

    const kbs = await prisma.knowledgeBase.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { documents: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = kbs.length > limit
    const items = hasNextPage ? kbs.slice(0, limit) : kbs

    return {
      data: items.map((kb) => ({
        id: kb.id,
        name: kb.name,
        description: kb.description,
        documentCount: kb._count.documents,
        organizationId: kb.organizationId,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/knowledge-bases/:id — Get knowledge base by ID (member only, include documents count)
  fastify.get('/knowledge-bases/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    })

    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await getMembership(request.userId!, kb.organizationId)

    return {
      data: {
        id: kb.id,
        name: kb.name,
        description: kb.description,
        documentCount: kb._count.documents,
        organizationId: kb.organizationId,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
      },
    }
  })

  // PATCH /api/knowledge-bases/:id — Update knowledge base (member only)
  fastify.patch('/knowledge-bases/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema, body: updateKbBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Knowledge base not found')

    await getMembership(request.userId!, existing.organizationId)

    const kb = await prisma.knowledgeBase.update({
      where: { id },
      data: request.body as any,
    })

    return { data: kb }
  })

  // DELETE /api/knowledge-bases/:id — Delete knowledge base and all its documents (admin only)
  fastify.delete('/knowledge-bases/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Knowledge base not found')

    await requireAdmin(request.userId!, existing.organizationId)

    await prisma.knowledgeBase.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/knowledge-bases/:id/documents — Add document (member only)
  fastify.post('/knowledge-bases/:id/documents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema, body: createDocBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { name, type, content, url } = request.body as {
      name: string
      type: DocumentType
      content?: string
      url?: string
    }

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await getMembership(request.userId!, kb.organizationId)

    const doc = await prisma.document.create({
      data: { knowledgeBaseId: id, name, type, content, url },
    })

    return { data: doc }
  })

  // GET /api/knowledge-bases/:id/documents — List documents (member only, paginated, optional status filter)
  fastify.get('/knowledge-bases/:id/documents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema, query: docListQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit, status } = request.query as {
      cursor?: string
      limit: number
      status?: string
    }

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await getMembership(request.userId!, kb.organizationId)

    const where: Record<string, unknown> = { knowledgeBaseId: id }
    if (status) where.status = status

    const docs = await prisma.document.findMany({
      where: where as any,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = docs.length > limit
    const items = hasNextPage ? docs.slice(0, limit) : docs

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/documents/:id — Get document by ID (member only)
  fastify.get('/documents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: docParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { knowledgeBase: { select: { organizationId: true } } },
    })

    if (!doc) throw new AppError(404, 'Document not found')

    await getMembership(request.userId!, doc.knowledgeBase.organizationId)

    return { data: doc }
  })

  // DELETE /api/documents/:id — Delete document (member only)
  fastify.delete('/documents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: docParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { knowledgeBase: { select: { organizationId: true } } },
    })

    if (!doc) throw new AppError(404, 'Document not found')

    await getMembership(request.userId!, doc.knowledgeBase.organizationId)

    await prisma.document.delete({ where: { id } })
    reply.code(204).send()
  })
}
