import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import { uploadFile, deleteFile, downloadFile } from '../../lib/storage.js'
import { processPdf } from '../../services/processor.js'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

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

const createDocBodySchema = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['txt', 'csv', 'md', 'json']), name: z.string().min(1).max(200), content: z.string().min(1).max(50000) }),
  z.object({ type: z.literal('pdf'), name: z.string().min(1).max(200) }),
  z.object({ type: z.literal('url'), name: z.string().min(1).max(200), url: z.string().url() }),
])

const updateDocBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional().nullable(),
  url: z.string().url().optional().nullable(),
})

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

    await fastify.getMembership(request.userId!, orgId)

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

    await fastify.getMembership(request.userId!, orgId)

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

    await fastify.getMembership(request.userId!, kb.organizationId)

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

    await fastify.getMembership(request.userId!, existing.organizationId)

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

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    await prisma.knowledgeBase.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/knowledge-bases/:id/documents — Add document from text (member only)
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

    await fastify.getMembership(request.userId!, kb.organizationId)

    const doc = await prisma.document.create({
      data: { knowledgeBaseId: id, name, type, content, url, status: 'ready' },
    })

    return { data: doc }
  })

  // POST /api/knowledge-bases/:id/documents/upload — Upload PDF file (member only)
  fastify.post('/knowledge-bases/:id/documents/upload', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await fastify.getMembership(request.userId!, kb.organizationId)

    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' })
    }

    if (data.mimetype !== 'application/pdf') {
      return reply.code(400).send({ error: 'Only PDF files are supported' })
    }

    const buffer = await data.toBuffer()
    const fileName = data.filename || 'document.pdf'

    const fileKey = await uploadFile(buffer, fileName, 'application/pdf')

    const doc = await prisma.document.create({
      data: {
        knowledgeBaseId: id,
        name: fileName.replace(/\.pdf$/i, ''),
        type: 'pdf',
        fileKey,
        status: 'processing',
      },
    })

    const tmpPath = join(tmpdir(), `convio-upload-${doc.id}.pdf`)
    await writeFile(tmpPath, buffer)
    processPdf(tmpPath, doc.id).finally(() => unlink(tmpPath).catch(() => {}))

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

    await fastify.getMembership(request.userId!, kb.organizationId)

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

    await fastify.getMembership(request.userId!, doc.knowledgeBase.organizationId)

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

    await fastify.getMembership(request.userId!, doc.knowledgeBase.organizationId)

    if (doc.fileKey) {
      deleteFile(doc.fileKey).catch(() => {})
    }

    await prisma.document.delete({ where: { id } })
    reply.code(204).send()
  })
}
