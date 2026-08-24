import { prisma } from '@convio/database'

type Write = (chunk: string) => void

const CONVO_BATCH = 200

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

function csvLine(headers: string[], r: Record<string, unknown>): string {
  return headers.map((h) => esc(r[h])).join(',')
}

// ponytail: conversations export is cursor-batched because it's the only unbounded table;
// the other scopes are org-bounded and small enough to build in one shot.
export async function exportAgents(orgId: string, format: string, write: Write) {
  const rows = await prisma.agent.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, model: true, status: true, temperature: true, systemPrompt: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })
  write(format === 'csv' ? toCsv(rows) : JSON.stringify(rows, null, 2))
}

const CONVERSATION_HEADERS = [
  'conversationId', 'channel', 'contactName', 'agentName',
  'messageId', 'role', 'content', 'inputTokens', 'outputTokens', 'cost', 'createdAt',
]

function conversationRows(
  c: {
    id: string
    channel: string
    contactName: string | null
    createdAt: Date
    agent: { name: string }
    messages: Array<{ id: string; role: string; content: string; inputTokens: number | null; outputTokens: number | null; cost: number | null; createdAt: Date }>
  },
): Record<string, unknown>[] {
  if (c.messages.length === 0) {
    return [{
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
  }
  return c.messages.map((m) => ({
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
}

export async function exportConversations(orgId: string, format: string, write: Write) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) {
    write(format === 'csv' ? '' : '[]')
    return
  }

  let cursor: string | undefined
  let wroteHeader = false
  let wroteRow = false

  while (true) {
    const convos = await prisma.conversation.findMany({
      where: { agentId: { in: agentIds } },
      include: {
        agent: { select: { name: true } },
        messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true, createdAt: true, inputTokens: true, outputTokens: true, cost: true } },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: CONVO_BATCH,
      ...(cursor ? { cursor: { id: cursor } } : {}),
    })

    if (format === 'json') write(wroteRow ? ',\n' : '[\n')
    else if (format === 'csv' && !wroteHeader) {
      write(CONVERSATION_HEADERS.join(',') + '\n')
      wroteHeader = true
    }

    for (let i = 0; i < convos.length; i++) {
      const c = convos[i]
      if (format === 'csv') {
        for (const row of conversationRows(c)) {
          write(csvLine(CONVERSATION_HEADERS, row) + '\n')
        }
        continue
      }
      write((i > 0 || wroteRow ? ',' : '') + JSON.stringify(c, null, 2))
    }

    wroteRow = wroteRow || convos.length > 0
    if (convos.length < CONVO_BATCH) break
    cursor = convos[convos.length - 1].id
    wroteRow = true
  }

  if (format === 'json' && !wroteRow) write('[]')
  else if (format === 'json') write('\n]')
}

export async function exportAnalytics(orgId: string, format: string, write: Write) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) return void write(format === 'csv' ? '' : '[]')

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

  write(format === 'csv' ? toCsv(flat) : JSON.stringify(flat, null, 2))
}

export async function exportKnowledgeBases(orgId: string, format: string, write: Write) {
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

  write(format === 'csv' ? toCsv(rows) : JSON.stringify(kbs, null, 2))
}

export async function exportDeployments(orgId: string, format: string, write: Write) {
  const agents = await prisma.agent.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } })
  const agentIds = agents.map((a) => a.id)
  if (agentIds.length === 0) return void write(format === 'csv' ? '' : '[]')

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

  write(format === 'csv' ? toCsv(flat) : JSON.stringify(flat, null, 2))
}

export type ExportScope = 'agents' | 'conversations' | 'analytics' | 'knowledge-bases' | 'deployments'

const exportFns: Record<ExportScope, (orgId: string, format: string, write: Write) => Promise<void>> = {
  agents: exportAgents,
  conversations: exportConversations,
  analytics: exportAnalytics,
  'knowledge-bases': exportKnowledgeBases,
  deployments: exportDeployments,
}

export async function exportOrgData(
  orgId: string,
  format: string,
  scope: ExportScope | 'all',
  write: Write,
): Promise<{ filename: string }> {
  const ext = format === 'csv' ? 'csv' : 'json'
  if (scope !== 'all') {
    await exportFns[scope](orgId, format, write)
    return { filename: `convio-export-${scope}.${ext}` }
  }

  const scopes: ExportScope[] = ['agents', 'conversations', 'analytics', 'knowledge-bases', 'deployments']
  for (const s of scopes) {
    write(`=== ${s} ===\n`)
    await exportFns[s](orgId, format, write)
    write('\n\n')
  }
  return { filename: `convio-export-all.${ext}` }
}
