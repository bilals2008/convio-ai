import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import { uploadFile, deleteFile } from '../../lib/storage.js'
import { processDocument, processPdf, embedText } from '../../services/processor.js'
import { rerank } from '../../services/reranker.js'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { getKnowledgeTemplate, listKnowledgeTemplates } from './knowledge-templates.js'

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
  templateId: z.string().optional(),
})

const updateKbBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
})

const createDocBodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.enum(['txt', 'csv', 'md', 'json']),
    name: z.string().min(1).max(200),
    content: z.string().min(1).max(50000),
  }),
  z.object({ type: z.literal('pdf'), name: z.string().min(1).max(200) }),
  z.object({
    type: z.literal('url'),
    name: z.string().min(1).max(200),
    url: z.string().url(),
  }),
])

const updateDocBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional().nullable(),
  url: z.string().url().optional().nullable(),
})

function runIndexing(documentId: string, log: FastifyInstance['log'], pdfPath?: string) {
  const work = pdfPath
    ? processPdf(pdfPath, documentId)
    : processDocument(documentId)

  work.catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Indexing failed'
    log.error({ err, documentId }, `Document indexing failed: ${message}`)
  })
}

async function withChunkCount<T extends { id: string }>(
  docs: T[],
): Promise<Array<T & { chunkCount: number }>> {
  if (!docs.length) return []

  const ids = docs.map((d) => d.id)
  const counts = await prisma.documentChunk.groupBy({
    by: ['documentId'],
    where: { documentId: { in: ids } },
    _count: { _all: true },
  })

  const map = new Map(counts.map((c) => [c.documentId, c._count._all]))
  return docs.map((d) => ({ ...d, chunkCount: map.get(d.id) ?? 0 }))
}

export default async function knowledgeRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/knowledge-bases — Create knowledge base (member only)
  fastify.post('/organizations/:orgId/knowledge-bases', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, body: createKbBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { name, description, templateId } = request.body as { name: string; description?: string; templateId?: string }

    const kb = await prisma.knowledgeBase.create({
      data: { organizationId: orgId, name, description },
    })

    if (templateId) {
      const template = getKnowledgeTemplate(templateId)
      if (template) {
        await Promise.all(
          template.documents.map((doc) =>
            prisma.document.create({
              data: {
                knowledgeBaseId: kb.id,
                name: doc.name,
                type: doc.type,
                content: doc.content,
                status: 'pending',
              },
            })
          )
        )

        for (const doc of template.documents) {
          const created = await prisma.document.findFirst({
            where: { knowledgeBaseId: kb.id, name: doc.name, type: doc.type },
          })
          if (created) {
            runIndexing(created.id, request.log)
          }
        }
      }
    }

    return { data: kb }
  })

  // GET /api/organizations/:orgId/knowledge-bases — List knowledge bases (member only, paginated)
  fastify.get('/organizations/:orgId/knowledge-bases', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: kbListQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const kbs = await prisma.knowledgeBase.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { documents: true } },
        documents: {
          select: { status: true },
        },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = kbs.length > limit
    const items = hasNextPage ? kbs.slice(0, limit) : kbs

    return {
      data: items.map((kb) => {
        const readyCount = kb.documents.filter((d) => d.status === 'ready').length
        const processingCount = kb.documents.filter(
          (d) => d.status === 'processing' || d.status === 'pending',
        ).length
        const errorCount = kb.documents.filter((d) => d.status === 'error').length

        return {
          id: kb.id,
          name: kb.name,
          description: kb.description,
          documentCount: kb._count.documents,
          readyCount,
          processingCount,
          errorCount,
          organizationId: kb.organizationId,
          createdAt: kb.createdAt,
          updatedAt: kb.updatedAt,
        }
      }),
       nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/organizations/:orgId/knowledge-templates — List available KB templates
  fastify.get('/organizations/:orgId/knowledge-templates', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    return { data: listKnowledgeTemplates() }
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
      include: {
        _count: { select: { documents: true } },
        documents: { select: { status: true } },
      },
    })

    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await fastify.getMembership(request.userId!, kb.organizationId)

    const readyCount = kb.documents.filter((d) => d.status === 'ready').length
    const processingCount = kb.documents.filter(
      (d) => d.status === 'processing' || d.status === 'pending',
    ).length
    const errorCount = kb.documents.filter((d) => d.status === 'error').length

    return {
      data: {
        id: kb.id,
        name: kb.name,
        description: kb.description,
        documentCount: kb._count.documents,
        readyCount,
        processingCount,
        errorCount,
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

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const kb = await prisma.knowledgeBase.update({
      where: { id },
      data: request.body as { name?: string; description?: string | null },
    })

    return { data: kb }
  })

  // DELETE /api/knowledge-bases/:id — Delete knowledge base and all its documents/chunks (admin only)
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

    const docs = await prisma.document.findMany({ where: { knowledgeBaseId: id }, select: { id: true, fileKey: true } })
    for (const doc of docs) {
      if (doc.fileKey) deleteFile(doc.fileKey).catch(() => {})
    }
    await prisma.$executeRawUnsafe(`DELETE FROM "DocumentChunk" WHERE "documentId" IN (SELECT "id" FROM "Document" WHERE "knowledgeBaseId" = $1)`, id)
    await prisma.$executeRawUnsafe(`DELETE FROM "Document" WHERE "knowledgeBaseId" = $1`, id)
    await prisma.knowledgeBase.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/knowledge-bases/:id/documents — Add document from text/url (member only)
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

    if (type === 'pdf') {
      throw new AppError(400, 'Use the PDF upload endpoint for PDF files')
    }

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await fastify.getMembership(request.userId!, kb.organizationId)

    const doc = await prisma.document.create({
      data: {
        knowledgeBaseId: id,
        name,
        type,
        content: content ?? null,
        url: url ?? null,
        status: 'pending',
      },
    })

    runIndexing(doc.id, request.log)

    return { data: { ...doc, chunkCount: 0 } }
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

    const fileName = data.filename || 'document'
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    const isPdf = data.mimetype === 'application/pdf' || ext === 'pdf'

    const textTypes: Record<string, DocumentType> = {
      txt: 'txt',
      md: 'md',
      markdown: 'md',
      csv: 'csv',
      json: 'json',
    }

    const buffer = await data.toBuffer()

    if (isPdf) {
      const fileKey = await uploadFile(buffer, fileName, 'application/pdf')

      const doc = await prisma.document.create({
        data: {
          knowledgeBaseId: id,
          name: fileName.replace(/\.pdf$/i, ''),
          type: 'pdf',
          fileKey,
          status: 'pending',
        },
      })

      const tmpPath = join(tmpdir(), `convio-upload-${doc.id}.pdf`)
      await writeFile(tmpPath, buffer)
      processPdf(tmpPath, doc.id)
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'PDF indexing failed'
          request.log.error({ err, documentId: doc.id }, `PDF indexing failed: ${message}`)
        })
        .finally(() => unlink(tmpPath).catch(() => {}))

      return { data: { ...doc, chunkCount: 0 } }
    }

    const textType = textTypes[ext]
    if (!textType) {
      return reply
        .code(400)
        .send({ error: 'Unsupported file type. Allowed: pdf, txt, md, csv, json' })
    }

    const content = buffer.toString('utf-8')
    if (!content.trim()) {
      return reply.code(400).send({ error: 'File is empty' })
    }

    const doc = await prisma.document.create({
      data: {
        knowledgeBaseId: id,
        name: fileName.replace(/\.[^.]+$/, ''),
        type: textType,
        content,
        status: 'pending',
      },
    })

    runIndexing(doc.id, request.log)

    return { data: { ...doc, chunkCount: 0 } }
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

    const where: { knowledgeBaseId: string; status?: string } = { knowledgeBaseId: id }
    if (status) where.status = status

    const docs = await prisma.document.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = docs.length > limit
    const items = hasNextPage ? docs.slice(0, limit) : docs
    const withCounts = await withChunkCount(items)

    return {
      data: withCounts,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/knowledge-bases/:id/chunks — Search chunks in a knowledge base (member only)
  fastify.get('/knowledge-bases/:id/chunks', {
    preHandler: [
      fastify.authenticate,
      validate({ params: kbParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { q, rerank: useRerank } = request.query as { q?: string; rerank?: string }
    const limit = (request.query as { limit?: string }).limit
    const topK = limit ? Math.min(Math.max(Number(limit) || 10, 1), 50) : 10

    const kb = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!kb) throw new AppError(404, 'Knowledge base not found')

    await fastify.getMembership(request.userId!, kb.organizationId)

    if (!q || !q.trim()) {
      return { data: [] }
    }

    const embedding = await embedText(q)
    if (!embedding) return { data: [] }

    const vectorStr = `[${embedding.join(',')}]`
    const candidates = useRerank === 'true' ? 20 : topK
    const maxDist = useRerank === 'true' ? 0.85 : 0.75

    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string
        content: string
        documentId: string
        documentName: string
        distance: number
      }>
    >(
      `SELECT
        dc."id",
        dc."content",
        dc."documentId",
        d."name" AS "documentName",
        (dc."embedding" <=> $2::vector) AS distance
      FROM "DocumentChunk" dc
      JOIN "Document" d ON d."id" = dc."documentId"
      WHERE d."knowledgeBaseId" = $1
        AND d."status" = 'ready'
        AND dc."embedding" IS NOT NULL
        AND (dc."embedding" <=> $2::vector) <= $3
      ORDER BY dc."embedding" <=> $2::vector
      LIMIT $4`,
      id,
      vectorStr,
      maxDist,
      candidates,
    )

    let result = rows

    if (useRerank === 'true' && rows.length > topK) {
      result = await rerank(q, rows, topK)
    }

    return {
      data: result.map((r) => ({
        id: r.id,
        content: r.content,
        documentId: r.documentId,
        documentName: r.documentName,
        score: 1 - r.distance,
      })),
    }
  })

  // GET /api/documents/:id/chunks — List chunks of a document (member only)
  fastify.get('/documents/:id/chunks', {
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

    const chunks = await prisma.$queryRawUnsafe<
      Array<{ id: string; content: string; embedding: unknown; createdAt: Date }>
    >(
      `SELECT "id", "content", "embedding", "createdAt" FROM "DocumentChunk" WHERE "documentId" = $1 ORDER BY "createdAt" ASC LIMIT 100`,
      id,
    )

    return {
      data: chunks.map((c) => ({
        id: c.id,
        content: c.content,
        hasEmbedding: c.embedding != null,
        createdAt: c.createdAt,
      })),
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

    const [withCount] = await withChunkCount([doc])
    const { knowledgeBase: _, ...rest } = withCount

    return { data: rest }
  })

  // PATCH /api/documents/:id — Update document metadata/content (member only)
  fastify.patch('/documents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: docParamsSchema, body: updateDocBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as {
      name?: string
      content?: string | null
      url?: string | null
    }

    const existing = await prisma.document.findUnique({
      where: { id },
      include: { knowledgeBase: { select: { organizationId: true } } },
    })

    if (!existing) throw new AppError(404, 'Document not found')

    await fastify.ensureAdmin(request.userId!, existing.knowledgeBase.organizationId)

    const contentChanged =
      (body.content !== undefined && body.content !== existing.content) ||
      (body.url !== undefined && body.url !== existing.url)

    const doc = await prisma.document.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.url !== undefined ? { url: body.url } : {}),
        ...(contentChanged ? { status: 'pending' } : {}),
      },
    })

    if (contentChanged) {
      runIndexing(doc.id, request.log)
    }

    const [withCount] = await withChunkCount([doc])
    return { data: withCount }
  })

  // POST /api/documents/:id/reprocess — Re-index document chunks/embeddings (member only)
  fastify.post('/documents/:id/reprocess', {
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

    await fastify.ensureAdmin(request.userId!, doc.knowledgeBase.organizationId)

    if (doc.status === 'processing') {
      throw new AppError(409, 'Document is already being processed')
    }

    await prisma.document.update({
      where: { id },
      data: { status: 'pending' },
    })

    runIndexing(id, request.log)

    return {
      data: {
        id: doc.id,
        status: 'pending',
        message: 'Re-indexing started',
      },
    }
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

    await fastify.ensureAdmin(request.userId!, doc.knowledgeBase.organizationId)

    if (doc.fileKey) {
      deleteFile(doc.fileKey).catch(() => {})
    }

    await prisma.document.delete({ where: { id } })
    reply.code(204).send()
  })
}
