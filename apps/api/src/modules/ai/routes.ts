import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { getProviderForModel, getProviderById, allProviders } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { retrieveContext } from '../../services/processor.js'
import { z } from 'zod'

const keyMap: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  kie: 'KIE_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  local: 'LOCAL_API_URL',
}

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/chat/stream', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { agentId, messages } = request.body as {
      agentId: string
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { providerKey: true },
    })
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' })
    }

    let provider
    try {
      provider = getProviderForModel(agent.model)
    } catch {
      return reply.code(400).send({ error: `No provider configured for model: ${agent.model}` })
    }

    const apiKey = agent.providerKey?.apiKey

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
            systemContext += '\n\nUse the following context to answer the user:\n\n' + context
          }
        } catch {
          request.log.warn('RAG retrieval failed')
        }
      }
    }

    const systemMessages = [
      { role: 'system' as const, content: systemContext },
      ...messages,
    ]

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: systemMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
      })

      for await (const chunk of stream) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Streaming error'
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
    const userKeyMap = new Map(userKeys.map(k => [k.provider, k.apiKey]))

    const models = await Promise.all(
      allProviders
        .filter((p) => p.id === 'local' || !!process.env[keyMap[p.id]] || userKeyMap.has(p.id))
        .map(async (p) => {
          try {
            return await p.listModels()
          } catch {
            return []
          }
        }),
    )

    const deduped = [...new Map(models.flat().map((m) => [m.id, m])).values()]
    return { data: deduped }
  })
}
