import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { getProviderForModel, allProviders } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { resolveProviderKey } from '../../services/provider-key.js'
import { decryptSecret, getEncryptionKey } from '../../services/encryption.js'
import { retrieveContext } from '../../services/processor.js'
import { loadAgentToolHandlers } from '../../services/tools/index.js'
import type { AIProvider, Message } from '@convio/ai'
import { createRequestSignal } from '../../services/concurrency.js'
import { checkMessageLimit } from '../../services/billing.js'
import { validate } from '../../plugins/validate.js'
import { z } from 'zod'

const isDev = process.env.NODE_ENV !== 'production'

// Unvalidated, this endpoint accepted an unbounded number of unbounded messages
// and forwarded them straight to a paid provider — a cheap way to burn the
// org's tokens and the process's memory. Limits are generous but finite.
const chatStreamBodySchema = z.object({
  agentId: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(100_000),
  })).min(1).max(500),
  reasoningEffort: z.enum(['none', 'low', 'medium', 'high', 'xhigh']).optional(),
})

export async function chatWithAgent(
  agentId: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { providerKey: true },
  })
  if (!agent) throw new Error('Agent not found')

  let provider: AIProvider
  try {
    provider = getProviderForModel(agent.model, agent.providerKey?.provider)
  } catch {
    throw new Error(`No provider configured for model: ${agent.model}`)
  }

  const apiKey = agent.providerKey ? decryptSecret(agent.providerKey.apiKey, getEncryptionKey()) : undefined

  let systemContext = agent.systemPrompt

  if (agent.knowledgeBaseId) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      try {
        const context = await retrieveContext(lastUserMsg.content, agent.knowledgeBaseId)
        if (context) {
          systemContext +=
            '\n\n## Retrieved knowledge (RAG)\n' +
            'Use the following source excerpts to answer. Prefer this context over general knowledge when relevant. ' +
            'If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n' +
            context
        }
      } catch {}
    }
  }

  const sanitizedMessages: Message[] = messages
    .filter((m): m is { role: 'user' | 'assistant'; content: string } => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))

  const systemMessages: Message[] = [
    { role: 'system', content: systemContext },
    ...sanitizedMessages,
  ]

  const toolHandlers = await loadAgentToolHandlers(agentId, prisma)
  const toolDefs = toolHandlers.map((h) => ({
    name: h.schema.name,
    description: h.schema.description,
    parameters: h.schema.parameters,
  }))

  let firstResponseText = ''
  const toolCallsFromStream: { tool: string; args: Record<string, unknown> }[] = []

  try {
    const stream = provider.stream({
      model: agent.model,
      messages: systemMessages,
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 2048,
      apiKey,
      tools: toolDefs.length > 0 ? toolDefs : undefined,
    })

    for await (const chunk of stream) {
      if (chunk.type === 'text' && chunk.content) {
        firstResponseText += chunk.content
      } else if (chunk.type === 'tool_call' && chunk.toolCall) {
        toolCallsFromStream.push({ tool: chunk.toolCall.name, args: chunk.toolCall.arguments })
      }
      if (chunk.type === 'done') break
    }
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Generation failed'
    throw new Error(rawMessage)
  }

  if (toolCallsFromStream.length === 0) {
    return firstResponseText
  }

  const results: { tool: string; result: unknown }[] = []
  for (const tc of toolCallsFromStream) {
    const handler = toolHandlers.find((h) => h.schema.name === tc.tool)
    if (handler) {
      const result = await handler.execute(tc.args)
      results.push({ tool: tc.tool, result })
    }
  }

  const resultsSummary = results
    .map((r) => `${r.tool} returned:\n${JSON.stringify(r.result, null, 2)}`)
    .join('\n\n')

  let finalResponse = ''
  try {
    const finalStream = provider.stream({
      model: agent.model,
      messages: [
        ...systemMessages,
        { role: 'assistant', content: firstResponseText || 'I will look that up for you.' },
        { role: 'user', content: `The following tools returned these results:\n\n${resultsSummary}\n\nProvide a clear, helpful response in plain text. Do NOT use any tools or output JSON.` },
      ],
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 2048,
      apiKey,
    })

    for await (const chunk of finalStream) {
      if (chunk.type === 'text' && chunk.content) {
        finalResponse += chunk.content
      }
      if (chunk.type === 'done') break
    }
  } catch {
    return firstResponseText
  }

  return finalResponse || firstResponseText
}

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/chat/stream', {
    preHandler: [fastify.authenticate, validate({ body: chatStreamBodySchema })],
  }, async (request, reply) => {
    const { agentId, messages, reasoningEffort } = request.body as z.infer<typeof chatStreamBodySchema>

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { providerKey: true },
    })
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' })
    }

    await fastify.getMembership(request.userId!, agent.organizationId)

    // This route streams a model call but persists no Message rows, so without this check
    // it would be the one path that spends tokens without counting against the plan.
    const limitCheck = await checkMessageLimit(agent.organizationId)
    if (!limitCheck.allowed) {
      return reply.code(402).send({
        error: `Monthly message limit (${limitCheck.limit.toLocaleString()}) reached. Upgrade your plan to continue.`,
        code: 'PLAN_LIMIT_EXCEEDED',
      })
    }

    let provider
    try {
      provider = getProviderForModel(agent.model, agent.providerKey?.provider)
    } catch {
      return reply.code(400).send({ error: `No provider configured for model: ${agent.model}` })
    }

  let apiKey = agent.providerKey ? decryptSecret(agent.providerKey.apiKey, getEncryptionKey()) : undefined
  if (!apiKey) {
    const resolved = await resolveProviderKey({
      organizationId: agent.organizationId,
      model: agent.model,
      providerKeyId: agent.providerKeyId,
    })
    apiKey = resolved.apiKey
  }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...getCorsHeaders(fastify.config.CORS_ORIGIN, request),
    })

    let systemContext = agent.systemPrompt

    if (agent.knowledgeBaseId) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
      if (lastUserMsg) {
        try {
          const context = await retrieveContext(lastUserMsg.content, agent.knowledgeBaseId)
          if (context) {
            systemContext +=
              '\n\n## Retrieved knowledge (RAG)\n' +
              'Use the following source excerpts to answer. Prefer this context over general knowledge when relevant. ' +
              'If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n' +
              context
          }
        } catch {
          request.log.warn('RAG retrieval failed')
        }
      }
    }

    const sanitizedMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant')

    const systemMessages = [
      { role: 'system' as const, content: systemContext },
      ...sanitizedMessages,
    ]

    const signal = createRequestSignal((cb) => request.raw.once('close', cb))

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: systemMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
        signal,
        reasoningEffort: reasoningEffort || undefined,
      })

      for await (const chunk of stream) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Streaming error'
      const errorMessage = isDev ? rawMessage : 'Generation failed. Please check your API key and try again.'
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`)
    } finally {
      reply.raw.end()
    }
  })

  fastify.get('/chat/models', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await prisma.profile.findUnique({ where: { id: request.userId } })
    if (!user) return { data: [] }

    const membership = await prisma.membership.findFirst({
      where: { userId: request.userId },
      include: { organization: { include: { providerKeys: true } } },
    })

    const userKeys = membership?.organization?.providerKeys || []
    const userKeyMap = new Map(userKeys.map(k => [k.provider, decryptSecret(k.apiKey, getEncryptionKey())]))

    const models = await Promise.all(
      allProviders
        .filter((p) => {
          if (p.id === 'opencode') return true
          return userKeyMap.has(p.id)
        })
        .map(async (p) => {
          try {
            return await p.listModels(userKeyMap.get(p.id))
          } catch {
            return []
          }
        }),
    )

    const deduped = [...new Map(models.flat().map((m) => [m.id, m])).values()]
    return { data: deduped }
  })
}
