import { prisma } from '@convio/database'

function esc(val: unknown): string {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = rows.map((r) => headers.map((h) => esc(r[h])).join(','))
  return headers.join(',') + '\n' + lines.join('\n')
}

export async function exportAgents(orgId: string, format: string) {
  const rows = await prisma.agent.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, model: true, status: true, temperature: true, systemPrompt: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })
  if (format === 'csv') return toCsv(rows)
  return JSON.stringify(rows, null, 2)
}

export async function exportConversations(orgId: string, format: string) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) return format === 'csv' ? '' : '[]'

  const convos = await prisma.conversation.findMany({
    where: { agentId: { in: agentIds } },
    include: {
      agent: { select: { name: true } },
      messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true, createdAt: true, inputTokens: true, outputTokens: true, cost: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = convos.flatMap((c) =>
    c.messages.length > 0
      ? c.messages.map((m) => ({
          conversationId: c.id,
          channel: c.channel,
          contactName: c.contactName ?? '',
          agentName: c.agent.name,
          messageId: m.id,
          role: m.role,
          content: m.content,
          inputTokens: m.inputTokens ?? '',
          outputTokens: m.outputTokens ?? '',
          cost: m.cost ?? '',
          createdAt: m.createdAt.toISOString(),
        }))
      : [{
          conversationId: c.id,
          channel: c.channel,
          contactName: c.contactName ?? '',
          agentName: c.agent.name,
          messageId: '',
          role: '',
          content: '',
          inputTokens: '',
          outputTokens: '',
          cost: '',
          createdAt: c.createdAt.toISOString(),
        }]
  )

  if (format === 'csv') return toCsv(rows)
  return JSON.stringify(convos, null, 2)
}

export async function exportAnalytics(orgId: string, format: string) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) return format === 'csv' ? '' : '[]'

  const rows = await prisma.analytics.findMany({
    where: { agentId: { in: agentIds } },
    include: { agent: { select: { name: true } } },
    orderBy: { date: 'desc' },
  })

  const flat = rows.map((r) => ({
    date: r.date.toISOString().split('T')[0],
    agentName: r.agent.name,
    totalConversations: r.totalConversations,
    totalMessages: r.totalMessages,
    uniqueUsers: r.uniqueUsers,
    avgResponseTime: r.avgResponseTime,
    satisfactionScore: r.satisfactionScore ?? '',
    resolvedConversations: r.resolvedConversations,
    escalatedConversations: r.escalatedConversations,
    totalCost: r.totalCost,
    totalInputTokens: r.totalInputTokens,
    totalOutputTokens: r.totalOutputTokens,
    returningUsers: r.returningUsers,
  }))

  if (format === 'csv') return toCsv(flat)
  return JSON.stringify(flat, null, 2)
}

export async function exportKnowledgeBases(orgId: string, format: string) {
  const kbs = await prisma.knowledgeBase.findMany({
    where: { organizationId: orgId },
    include: {
      documents: { select: { id: true, name: true, type: true, status: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = kbs.flatMap((kb) =>
    kb.documents.length > 0
      ? kb.documents.map((d) => ({
          knowledgeBaseId: kb.id,
          knowledgeBaseName: kb.name,
          documentId: d.id,
          documentName: d.name,
          type: d.type,
          status: d.status,
          createdAt: d.createdAt.toISOString(),
        }))
      : [{
          knowledgeBaseId: kb.id,
          knowledgeBaseName: kb.name,
          documentId: '',
          documentName: '',
          type: '',
          status: '',
          createdAt: kb.createdAt.toISOString(),
        }]
  )

  if (format === 'csv') return toCsv(rows)
  return JSON.stringify(kbs, null, 2)
}

export async function exportDeployments(orgId: string, format: string) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) return format === 'csv' ? '' : '[]'

  const rows = await prisma.deployment.findMany({
    where: { agentId: { in: agentIds } },
    include: { agent: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const flat = rows.map((r) => ({
    id: r.id,
    agentName: r.agent.name,
    channel: r.channel,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }))

  if (format === 'csv') return toCsv(flat)
  return JSON.stringify(flat, null, 2)
}

export type ExportScope = 'agents' | 'conversations' | 'analytics' | 'knowledge-bases' | 'deployments'

const exportFns: Record<ExportScope, (orgId: string, format: string) => Promise<string>> = {
  agents: exportAgents,
  conversations: exportConversations,
  analytics: exportAnalytics,
  'knowledge-bases': exportKnowledgeBases,
  deployments: exportDeployments,
}

export async function exportOrgData(orgId: string, format: string, scope: ExportScope | 'all'): Promise<{ content: string; filename: string }> {
  if (scope === 'all') {
    const parts: string[] = []
    const scopes: ExportScope[] = ['agents', 'conversations', 'analytics', 'knowledge-bases', 'deployments']
    for (const s of scopes) {
      const data = await exportFns[s](orgId, format)
      parts.push(`=== ${s} ===\n${data}`)
    }
    return { content: parts.join('\n\n'), filename: `convio-export-all.${format === 'csv' ? 'csv' : 'json'}` }
  }

  const data = await exportFns[scope](orgId, format)
  return { content: data, filename: `convio-export-${scope}.${format === 'csv' ? 'csv' : 'json'}` }
}
