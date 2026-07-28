import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { exportOrgData } from './export.js'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const deleteCategorySchema = z.object({
  category: z.enum([
    'agents',
    'conversations',
    'knowledge-bases',
    'documents',
    'integrations',
    'provider-keys',
    'analytics',
  ]),
})

const listCategoryQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
})

async function getAgentIds(orgId: string): Promise<string[]> {
  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  })
  return agents.map((a) => a.id)
}

async function getConversationIds(agentIds: string[]): Promise<string[]> {
  if (agentIds.length === 0) return []
  const convos = await prisma.conversation.findMany({
    where: { agentId: { in: agentIds } },
    select: { id: true },
  })
  return convos.map((c) => c.id)
}

async function getKnowledgeBaseIds(orgId: string): Promise<string[]> {
  const kbs = await prisma.knowledgeBase.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  })
  return kbs.map((k) => k.id)
}

async function getDocumentIds(kbIds: string[]): Promise<string[]> {
  if (kbIds.length === 0) return []
  const docs = await prisma.document.findMany({
    where: { knowledgeBaseId: { in: kbIds } },
    select: { id: true },
  })
  return docs.map((d) => d.id)
}

export default async function dataManagementRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/data-summary — Count of all data categories
  fastify.get('/organizations/:orgId/data-summary', {
    preHandler: [fastify.authenticate, validate({ params: orgParamsSchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.getMembership(request.userId!, orgId)

    const agentIds = await getAgentIds(orgId)
    const kbIds = await getKnowledgeBaseIds(orgId)

    const [
      agentsCount,
      conversationsCount,
      knowledgeBasesCount,
      documentsCount,
      deploymentsCount,
      providerKeysCount,
      analyticsCount,
      lastAgent,
      lastConversation,
      lastDocument,
      lastDeployment,
      lastKb,
      lastProviderKey,
    ] = await Promise.all([
      prisma.agent.count({ where: { organizationId: orgId } }),
      agentIds.length > 0
        ? prisma.conversation.count({ where: { agentId: { in: agentIds } } })
        : Promise.resolve(0),
      prisma.knowledgeBase.count({ where: { organizationId: orgId } }),
      kbIds.length > 0
        ? prisma.document.count({ where: { knowledgeBaseId: { in: kbIds } } })
        : Promise.resolve(0),
      agentIds.length > 0
        ? prisma.deployment.count({ where: { agentId: { in: agentIds } } })
        : Promise.resolve(0),
      prisma.providerKey.count({ where: { organizationId: orgId } }),
      agentIds.length > 0
        ? prisma.analytics.count({ where: { agentId: { in: agentIds } } })
        : Promise.resolve(0),
      prisma.agent.findFirst({ where: { organizationId: orgId }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      agentIds.length > 0
        ? prisma.conversation.findFirst({ where: { agentId: { in: agentIds } }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } })
        : Promise.resolve(null),
      kbIds.length > 0
        ?       prisma.document.findFirst({ where: { knowledgeBaseId: { in: kbIds } }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
        : Promise.resolve(null),
      agentIds.length > 0
        ? prisma.deployment.findFirst({ where: { agentId: { in: agentIds } }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
        : Promise.resolve(null),
      prisma.knowledgeBase.findFirst({ where: { organizationId: orgId }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.providerKey.findFirst({ where: { organizationId: orgId }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    ])

    const timestamps = [
      lastAgent?.updatedAt,
      lastConversation?.updatedAt,
      lastDocument?.createdAt,
      lastDeployment?.createdAt,
      lastKb?.updatedAt,
      lastProviderKey?.updatedAt,
    ].filter((d): d is Date => d instanceof Date)
    const lastUpdated = timestamps.length > 0 ? new Date(Math.max(...timestamps.map((d) => d.getTime()))).toISOString() : null

    const totalItems = agentsCount + conversationsCount + knowledgeBasesCount + documentsCount + deploymentsCount + providerKeysCount + analyticsCount
    const storageBytes = agentsCount * 2048 + conversationsCount * 5120 + documentsCount * 3072 + knowledgeBasesCount * 1024 + analyticsCount * 256

    return {
      data: {
        items: [
          { label: 'agents', count: agentsCount },
          { label: 'conversations', count: conversationsCount },
          { label: 'knowledge-bases', count: knowledgeBasesCount },
          { label: 'documents', count: documentsCount },
          { label: 'integrations', count: deploymentsCount },
          { label: 'provider-keys', count: providerKeysCount },
          { label: 'analytics', count: analyticsCount },
        ],
        total: totalItems,
        storageBytes,
        lastUpdated,
      },
    }
  })

  // GET /api/organizations/:orgId/data/:category — List items in a category
  fastify.get('/organizations/:orgId/data/:category', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ orgId: z.string().uuid(), category: deleteCategorySchema.shape.category }), query: listCategoryQuerySchema })],
  }, async (request) => {
    const { orgId, category } = request.params as { orgId: string; category: string }
    const { search, status, limit, offset } = request.query as z.infer<typeof listCategoryQuerySchema>
    await fastify.getMembership(request.userId!, orgId)

    const agentIds = await getAgentIds(orgId)
    const kbIds = await getKnowledgeBaseIds(orgId)

    const take = limit
    const skip = offset

    switch (category) {
      case 'agents': {
        const where: Record<string, unknown> = { organizationId: orgId }
        if (search) where.name = { contains: search, mode: 'insensitive' }
        if (status) where.status = status
        const [items, total] = await Promise.all([
          prisma.agent.findMany({ where, select: { id: true, name: true, model: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.agent.count({ where }),
        ])
        return { data: items, total }
      }
      case 'conversations': {
        if (agentIds.length === 0) return { data: [], total: 0 }
        const where: Record<string, unknown> = { agentId: { in: agentIds } }
        if (search) where.OR = [{ contactName: { contains: search, mode: 'insensitive' } }, { channel: { contains: search, mode: 'insensitive' } }]
        if (status) where.status = status
        const [items, total] = await Promise.all([
          prisma.conversation.findMany({ where, select: { id: true, channel: true, status: true, contactName: true, createdAt: true, agent: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.conversation.count({ where }),
        ])
        return { data: items, total }
      }
      case 'knowledge-bases': {
        const where: Record<string, unknown> = { organizationId: orgId }
        if (search) where.name = { contains: search, mode: 'insensitive' }
        const [items, total] = await Promise.all([
          prisma.knowledgeBase.findMany({ where, select: { id: true, name: true, description: true, createdAt: true, _count: { select: { documents: true } } }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.knowledgeBase.count({ where }),
        ])
        return { data: items, total }
      }
      case 'documents': {
        if (kbIds.length === 0) return { data: [], total: 0 }
        const where: Record<string, unknown> = { knowledgeBaseId: { in: kbIds } }
        if (search) where.name = { contains: search, mode: 'insensitive' }
        if (status) where.status = status
        const [items, total] = await Promise.all([
          prisma.document.findMany({ where, select: { id: true, name: true, type: true, status: true, createdAt: true, knowledgeBase: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.document.count({ where }),
        ])
        return { data: items, total }
      }
      case 'integrations': {
        if (agentIds.length === 0) return { data: [], total: 0 }
        const where: Record<string, unknown> = { agentId: { in: agentIds } }
        if (search) where.channel = { contains: search, mode: 'insensitive' }
        if (status) where.status = status
        const [items, total] = await Promise.all([
          prisma.deployment.findMany({ where, select: { id: true, channel: true, status: true, createdAt: true, agent: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.deployment.count({ where }),
        ])
        return { data: items, total }
      }
      case 'provider-keys': {
        const where: Record<string, unknown> = { organizationId: orgId }
        if (search) where.OR = [{ provider: { contains: search, mode: 'insensitive' } }, { label: { contains: search, mode: 'insensitive' } }]
        const [items, total] = await Promise.all([
          prisma.providerKey.findMany({ where, select: { id: true, provider: true, keyPreview: true, label: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take, skip }),
          prisma.providerKey.count({ where }),
        ])
        return { data: items, total }
      }
      case 'analytics': {
        if (agentIds.length === 0) return { data: [], total: 0 }
        const where: Record<string, unknown> = { agentId: { in: agentIds } }
        const [items, total] = await Promise.all([
          prisma.analytics.findMany({ where, select: { id: true, date: true, totalConversations: true, totalMessages: true, uniqueUsers: true, agent: { select: { name: true } } }, orderBy: { date: 'desc' }, take, skip }),
          prisma.analytics.count({ where }),
        ])
        return { data: items, total }
      }
      default:
        throw new AppError(400, `Unknown category: ${category}`)
    }
  })

  // GET /api/organizations/:orgId/data/:category/cascade — What will be deleted
  fastify.get('/organizations/:orgId/data/:category/cascade', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ orgId: z.string().uuid(), category: deleteCategorySchema.shape.category }) })],
  }, async (request) => {
    const { orgId, category } = request.params as { orgId: string; category: string }
    await fastify.getMembership(request.userId!, orgId)

    const agentIds = await getAgentIds(orgId)
    const kbIds = await getKnowledgeBaseIds(orgId)

    const items: { label: string; count: number }[] = []

    switch (category) {
      case 'agents': {
        const count = await prisma.agent.count({ where: { organizationId: orgId } })
        items.push({ label: 'agents', count })
        if (agentIds.length > 0) {
          const [convCount, deployCount, analyticsCount] = await Promise.all([
            prisma.conversation.count({ where: { agentId: { in: agentIds } } }),
            prisma.deployment.count({ where: { agentId: { in: agentIds } } }),
            prisma.analytics.count({ where: { agentId: { in: agentIds } } }),
          ])
          if (convCount > 0) items.push({ label: 'conversations', count: convCount })
          if (deployCount > 0) items.push({ label: 'deployments', count: deployCount })
          if (analyticsCount > 0) items.push({ label: 'analytics records', count: analyticsCount })
        }
        break
      }
      case 'conversations': {
        if (agentIds.length === 0) break
        const convIds = await getConversationIds(agentIds)
        if (convIds.length > 0) {
          const msgCount = await prisma.message.count({ where: { conversationId: { in: convIds } } })
          items.push({ label: 'conversations', count: convIds.length })
          if (msgCount > 0) items.push({ label: 'messages', count: msgCount })
        }
        break
      }
      case 'knowledge-bases': {
        const count = await prisma.knowledgeBase.count({ where: { organizationId: orgId } })
        items.push({ label: 'knowledge bases', count })
        if (kbIds.length > 0) {
          const docCount = await prisma.document.count({ where: { knowledgeBaseId: { in: kbIds } } })
          if (docCount > 0) items.push({ label: 'documents', count: docCount })
        }
        break
      }
      case 'documents': {
        if (kbIds.length === 0) break
        const docIds = await getDocumentIds(kbIds)
        if (docIds.length > 0) {
          items.push({ label: 'documents', count: docIds.length })
          const chunkCount = await prisma.documentChunk.count({ where: { documentId: { in: docIds } } })
          if (chunkCount > 0) items.push({ label: 'vector chunks', count: chunkCount })
        }
        break
      }
      case 'integrations': {
        if (agentIds.length === 0) break
        const count = await prisma.deployment.count({ where: { agentId: { in: agentIds } } })
        items.push({ label: 'deployments', count })
        break
      }
      case 'provider-keys': {
        const count = await prisma.providerKey.count({ where: { organizationId: orgId } })
        items.push({ label: 'provider keys', count })
        break
      }
      case 'analytics': {
        if (agentIds.length === 0) break
        const count = await prisma.analytics.count({ where: { agentId: { in: agentIds } } })
        items.push({ label: 'analytics records', count })
        break
      }
    }

    return { data: items }
  })

  // DELETE /api/organizations/:orgId/data/:category — Delete all data in a category
  fastify.delete('/organizations/:orgId/data/:category', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ orgId: z.string().uuid(), category: deleteCategorySchema.shape.category }) })],
  }, async (request) => {
    const { orgId, category } = request.params as { orgId: string; category: string }
    await fastify.ensureAdmin(request.userId!, orgId)

    const agentIds = await getAgentIds(orgId)
    const kbIds = await getKnowledgeBaseIds(orgId)
    let deletedCount = 0

    switch (category) {
      case 'agents': {
        if (agentIds.length === 0) return { data: { deleted: 0 } }
        // Delete in correct order to respect FKs
        const convIds = await getConversationIds(agentIds)
        if (convIds.length > 0) {
          await prisma.message.deleteMany({ where: { conversationId: { in: convIds } } })
          await prisma.conversation.deleteMany({ where: { id: { in: convIds } } })
        }
        await prisma.analytics.deleteMany({ where: { agentId: { in: agentIds } } })
        await prisma.deployment.deleteMany({ where: { agentId: { in: agentIds } } })
        const agentToolCount = await prisma.agentTool.deleteMany({ where: { agentId: { in: agentIds } } })
        const result = await prisma.agent.deleteMany({ where: { id: { in: agentIds } } })
        deletedCount = result.count
        break
      }
      case 'conversations': {
        if (agentIds.length === 0) return { data: { deleted: 0 } }
        const convIds = await getConversationIds(agentIds)
        if (convIds.length === 0) return { data: { deleted: 0 } }
        await prisma.message.deleteMany({ where: { conversationId: { in: convIds } } })
        const result = await prisma.conversation.deleteMany({ where: { id: { in: convIds } } })
        deletedCount = result.count
        break
      }
      case 'knowledge-bases': {
        if (kbIds.length === 0) return { data: { deleted: 0 } }
        // Clear references from agents first
        await prisma.agent.updateMany({
          where: { knowledgeBaseId: { in: kbIds } },
          data: { knowledgeBaseId: null },
        })
        const docIds = await getDocumentIds(kbIds)
        if (docIds.length > 0) {
          await prisma.documentChunk.deleteMany({ where: { documentId: { in: docIds } } })
          await prisma.document.deleteMany({ where: { id: { in: docIds } } })
        }
        const result = await prisma.knowledgeBase.deleteMany({ where: { id: { in: kbIds } } })
        deletedCount = result.count
        break
      }
      case 'documents': {
        if (kbIds.length === 0) return { data: { deleted: 0 } }
        const docIds = await getDocumentIds(kbIds)
        if (docIds.length === 0) return { data: { deleted: 0 } }
        await prisma.documentChunk.deleteMany({ where: { documentId: { in: docIds } } })
        const result = await prisma.document.deleteMany({ where: { id: { in: docIds } } })
        deletedCount = result.count
        break
      }
      case 'integrations': {
        if (agentIds.length === 0) return { data: { deleted: 0 } }
        const result = await prisma.deployment.deleteMany({ where: { agentId: { in: agentIds } } })
        deletedCount = result.count
        break
      }
      case 'provider-keys': {
        const result = await prisma.providerKey.deleteMany({ where: { organizationId: orgId } })
        deletedCount = result.count
        break
      }
      case 'analytics': {
        if (agentIds.length === 0) return { data: { deleted: 0 } }
        const result = await prisma.analytics.deleteMany({ where: { agentId: { in: agentIds } } })
        deletedCount = result.count
        break
      }
      default:
        throw new AppError(400, `Unknown category: ${category}`)
    }

    await fastify.auditLog({
      organizationId: orgId,
      actorId: request.userId!,
      action: 'agent.deleted',
      entityType: 'data_category',
      entityId: category,
      metadata: { category, deletedCount },
    })

    return { data: { deleted: deletedCount } }
  })

  // DELETE /api/organizations/:orgId/data/wipe — Delete ALL org data
  fastify.delete('/organizations/:orgId/data/wipe', {
    preHandler: [fastify.authenticate, validate({ params: orgParamsSchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.ensureOwner(request.userId!, orgId)

    const agentIds = await getAgentIds(orgId)
    const kbIds = await getKnowledgeBaseIds(orgId)

    const counts: Record<string, number> = {}

    // 1. Messages → Conversations
    const convIds = await getConversationIds(agentIds)
    if (convIds.length > 0) {
      const msgResult = await prisma.message.deleteMany({ where: { conversationId: { in: convIds } } })
      counts.messages = msgResult.count
      const convResult = await prisma.conversation.deleteMany({ where: { id: { in: convIds } } })
      counts.conversations = convResult.count
    } else {
      counts.messages = 0
      counts.conversations = 0
    }

    // 2. Analytics
    const analyticsResult = await prisma.analytics.deleteMany({ where: { agentId: { in: agentIds } } })
    counts.analytics = analyticsResult.count

    // 3. Deployments
    const deployResult = await prisma.deployment.deleteMany({ where: { agentId: { in: agentIds } } })
    counts.integrations = deployResult.count

    // 4. Agent tools
    await prisma.agentTool.deleteMany({ where: { agentId: { in: agentIds } } })

    // 5. Agents
    const agentResult = await prisma.agent.deleteMany({ where: { id: { in: agentIds } } })
    counts.agents = agentResult.count

    // 6. Documents → Chunks → Knowledge bases
    if (kbIds.length > 0) {
      const docIds = await getDocumentIds(kbIds)
      if (docIds.length > 0) {
        await prisma.documentChunk.deleteMany({ where: { documentId: { in: docIds } } })
        const docResult = await prisma.document.deleteMany({ where: { id: { in: docIds } } })
        counts.documents = docResult.count
      } else {
        counts.documents = 0
      }
      await prisma.agent.updateMany({
        where: { knowledgeBaseId: { in: kbIds } },
        data: { knowledgeBaseId: null },
      })
      const kbResult = await prisma.knowledgeBase.deleteMany({ where: { id: { in: kbIds } } })
      counts['knowledge-bases'] = kbResult.count
    } else {
      counts.documents = 0
      counts['knowledge-bases'] = 0
    }

    // 7. Provider keys
    const pkResult = await prisma.providerKey.deleteMany({ where: { organizationId: orgId } })
    counts['provider-keys'] = pkResult.count

    // 8. Widgets
    const widgetResult = await prisma.widget.deleteMany({ where: { organizationId: orgId } })
    counts.widgets = widgetResult.count

    // 9. Tools
    const toolResult = await prisma.tool.deleteMany({ where: { organizationId: orgId } })
    counts.tools = toolResult.count

    await fastify.auditLog({
      organizationId: orgId,
      actorId: request.userId!,
      action: 'organization.updated',
      entityType: 'data_wipe',
      metadata: counts,
    })

    return { data: counts }
  })

  // GET /api/organizations/:orgId/export — Export data as CSV/JSON
  fastify.get('/organizations/:orgId/export', {
    preHandler: [fastify.authenticate, validate({ params: orgParamsSchema, query: z.object({ format: z.enum(['csv', 'json']).default('csv'), scope: z.enum(['agents', 'conversations', 'analytics', 'knowledge-bases', 'deployments', 'all']).default('all') }) })],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string }
    const { format, scope } = request.query as { format: 'csv' | 'json'; scope: 'agents' | 'conversations' | 'analytics' | 'knowledge-bases' | 'deployments' | 'all' }
    await fastify.getMembership(request.userId!, orgId)

    const { content, filename } = await exportOrgData(orgId, format, scope)
    const contentType = format === 'csv' ? 'text/csv' : 'application/json'
    reply.header('Content-Type', `${contentType}; charset=utf-8`)
    reply.header('Content-Disposition', `attachment; filename="${filename}"`)
    return reply.send(content)
  })
}
