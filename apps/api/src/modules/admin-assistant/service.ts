import { prisma } from '@convio/database'
import type { Prisma } from '@convio/database'
import type { AIProvider, ToolCall } from '@convio/ai'
import { getProviderForModel } from '@convio/ai/providers'
import { getToolHandler } from './tools.js'

const keyMap: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  opencode: 'OPENCODE_API_KEY',
  local: 'LOCAL_API_URL',
}

const FALLBACK_MODELS = [
  'opencode/deepseek-v4-flash-free',
  'opencode/mimo-v2.5-free',
  'opencode/nemotron-3-ultra-free',
  'gpt-4o-mini',
  'claude-3-haiku',
  'gemini-1.5-flash',
]

export function resolveAssistantModel(): { provider: AIProvider; model: string; apiKey?: string } {
  const preferred = process.env.ADMIN_ASSISTANT_MODEL
  const candidates = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS

  for (const model of candidates) {
    try {
      const provider = getProviderForModel(model)
      const keyVar = keyMap[provider.id]
      if (keyVar) {
        if (process.env[keyVar]) return { provider, model, apiKey: process.env[keyVar] }
        continue
      }
      return { provider, model }
    } catch {
      // model not routable to a provider — try next
    }
  }
  throw new Error('No AI provider configured. Set an API key (e.g. OPENAI_API_KEY) or ADMIN_ASSISTANT_MODEL.')
}

const DEFAULT_DAILY_TOKEN_BUDGET = 500_000

export function getDailyTokenBudget(): number {
  const raw = Number(process.env.ADMIN_ASSISTANT_DAILY_TOKEN_BUDGET)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DAILY_TOKEN_BUDGET
}

/**
 * Daily tokens spent by one admin on assistant responses (usage is persisted
 * on each saved assistant message). ponytail: JS-side sum; switch to a native
 * Json aggregate once AdminMessage counts grow past ~10k/day.
 */
export async function getDailyTokenUsage(adminId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const rows = await prisma.adminMessage.findMany({
    where: { role: 'assistant', createdAt: { gte: startOfDay }, conversation: { adminId } },
    select: { usage: true },
  })
  let total = 0
  for (const row of rows) {
    const usage = row.usage as { totalTokens?: number } | null
    total += usage?.totalTokens ?? 0
  }
  return total
}

/**
 * Tool access control: platform admins get everything by default; ops can
 * hard-deny specific tools via ADMIN_ASSISTANT_DENY_TOOLS (comma-separated
 * tool names). ponytail: env-based policy — a real per-admin rule table if
 * restricted admin roles ever ship.
 */
export function isToolAllowed(requires: string[] = []): boolean {
  const denied = new Set(
    (process.env.ADMIN_ASSISTANT_DENY_TOOLS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
  return !requires.some((cap) => denied.has(cap))
}

export interface ExecutedTool {
  name: string
  args: Record<string, unknown>
  result?: unknown
  error?: string
}

export async function executeToolCalls(calls: ToolCall[]): Promise<ExecutedTool[]> {
  const executed: ExecutedTool[] = []
  for (const call of calls) {
    const handler = getToolHandler(call.name)
    if (!handler) {
      executed.push({ name: call.name, args: call.arguments, error: `Unknown tool: ${call.name}` })
      continue
    }
    try {
      const result = await handler.handler(call.arguments)
      executed.push({ name: call.name, args: call.arguments, result })
    } catch (err) {
      executed.push({
        name: call.name,
        args: call.arguments,
        error: err instanceof Error ? err.message : 'Tool execution failed',
      })
    }
  }
  return executed
}

export function toolResultsSummary(executed: ExecutedTool[]): string {
  return executed
    .map((t) => {
      if (t.error) return `${t.name} returned an error: ${t.error}`
      return `${t.name} returned:\n${JSON.stringify(t.result, null, 2)}`
    })
    .join('\n\n')
}

export interface SaveExchangeInput {
  conversationId?: string
  adminId: string
  userContent: string
  assistantContent: string
  toolCalls?: ToolCall[]
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  error?: string
}

export async function saveExchange(input: SaveExchangeInput): Promise<{ conversationId: string }> {
  let conversationId = input.conversationId
  if (!conversationId) {
    const created = await prisma.adminConversation.create({
      data: {
        adminId: input.adminId,
        title: input.userContent.slice(0, 60) || 'New conversation',
      },
    })
    conversationId = created.id
  } else {
    const owned = await prisma.adminConversation.findFirst({
      where: { id: conversationId, adminId: input.adminId },
    })
    if (!owned) throw new Error('Conversation not found')
    if (owned.title === 'New conversation' && input.userContent) {
      await prisma.adminConversation.update({
        where: { id: conversationId },
        data: { title: input.userContent.slice(0, 60) },
      })
    }
  }

  await prisma.adminMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: input.userContent,
    },
  })
  await prisma.adminMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: input.assistantContent || '',
      toolCalls:
        input.toolCalls && input.toolCalls.length > 0
          ? (input.toolCalls.map((t) => ({ id: t.id, name: t.name, arguments: t.arguments })) as Prisma.InputJsonValue)
          : undefined,
      usage: input.usage ? { ...input.usage } : undefined,
      error: input.error,
    },
  })

  return { conversationId }
}

export async function auditAssistantAction(input: {
  actorId: string
  action: string
  query?: string
  success: boolean
  latencyMs?: number
  metadata?: Record<string, unknown>
}): Promise<void> {
  await prisma.adminAssistantLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      query: input.query,
      success: input.success,
      latencyMs: input.latencyMs,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => {
    // audit failure must never break the chat flow
  })
}