import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createAgentSchema, updateAgentSchema, agentGuardrailsSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { getProviderForModel } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { retrieveContext } from '../../services/processor.js'
import { resolveProviderKey } from '../../services/provider-key.js'
import { decryptSecret, getEncryptionKey } from '../../services/encryption.js'
import { getTemplate, listTemplates } from './templates.js'
import { AGENT_GENERATION_PROMPT, resolveGenerationProvider, parseAgentDraft } from './agent-generator.js'
import { getToolHandler, loadAgentToolHandlers, loadDbToolHandlers, loadAgentComposioHandlers, ASK_USER_TOOL } from '../../services/tools/index.js'
import { loadComposioToolHandlers } from '../../services/composio/session-loader.js'
import { getOrgPlan } from '../../services/billing.js'
import { guardrailInputRefusal, guardrailPrompt } from '../../services/guardrails.js'
import { NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { z } from 'zod'

// Tools that consume server-side resources (e.g. Tavily web search) are Pro+ only.
const GATED_TOOLS = new Set(['web-search'])

// ponytail: resolve the caller's org for plan checks — prefers the org that owns
// the selected provider key, falling back to the user's first membership.
async function resolveCallerOrgId(userId: string, providerKeyId?: string): Promise<string | null> {
  if (providerKeyId) {
    const key = await prisma.providerKey.findFirst({
      where: {
        id: providerKeyId,
        organization: { memberships: { some: { userId } } },
      },
      select: { organizationId: true },
    })
    if (key) return key.organizationId
  }
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { organizationId: true },
  })
  return membership?.organizationId ?? null
}

async function getCallerPlanName(userId: string, providerKeyId?: string): Promise<string | null> {
  const orgId = await resolveCallerOrgId(userId, providerKeyId)
  if (!orgId) return null
  try {
    return (await getOrgPlan(orgId)).name
  } catch {
    return null
  }
}

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const agentParamsSchema = z.object({
  id: z.string().uuid(),
})

const agentToolParamsSchema = z.object({
  id: z.string().uuid(),
  toolId: z.string().uuid(),
})

const agentsQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const addToolSchema = z.object({
  toolId: z.string().uuid(),
})

const testAgentSchema = z.object({
  message: z.string().min(1).max(12000),
})

const testStreamSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  message: z.string().min(1).max(12000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(512000).default(2048),
  reasoningEffort: z.enum(['none', 'low', 'medium', 'high', 'xhigh']).optional(),
  providerKeyId: z.string().uuid().optional(),
  knowledgeBaseId: z.string().uuid().optional().nullable(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(12000) })).max(30).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  toolIds: z.array(z.string().uuid()).optional().default([]),
  mcpServerIds: z.array(z.string().uuid()).optional().default([]),
  composioToolkits: z.array(z.string()).optional().default([]),
  guardrails: agentGuardrailsSchema.nullish(),
})

// ponytail: resume schema for ask_user tool output
const testStreamResumeSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  message: z.string().min(1).max(12000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(512000).default(2048),
  reasoningEffort: z.enum(['none', 'low', 'medium', 'high', 'xhigh']).optional(),
  providerKeyId: z.string().uuid().optional(),
  knowledgeBaseId: z.string().uuid().optional().nullable(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(12000) })).max(30).optional().default([]),
  guardrails: agentGuardrailsSchema.nullish(),
  toolCallId: z.string().min(1),
  toolName: z.string().min(1),
  toolOutput: z.array(z.object({ question: z.string(), answer: z.string() })),
  assistantText: z.string().optional().default(''),
})

const createAgentBodySchema = createAgentSchema.extend({
  knowledgeBaseId: z.string().uuid().optional().nullable(),
  tools: z.array(z.string()).optional(),
  composioToolkits: z.array(z.string()).optional(),
})

const fromTemplateBodySchema = z.object({
  organizationId: z.string().uuid(),
  template: z.string().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  model: z.string().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().max(10000).optional(),
  knowledgeBaseId: z.string().uuid().optional().nullable(),
  providerKeyId: z.string().uuid().optional(),
})

const updateAgentBodySchema = updateAgentSchema.extend({
  knowledgeBaseId: z.string().uuid().optional().nullable(),
  tools: z.array(z.string()).optional(),
  composioToolkits: z.array(z.string()).optional(),
})

const generateAgentBodySchema = z.object({
  description: z.string().trim().min(3).max(2000),
  model: z.string().min(1).optional(),
})

export default async function agentsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/agents — Create agent (member only)
  fastify.post('/organizations/:orgId/agents', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      fastify.checkAgentLimit,
      validate({ params: orgParamsSchema, body: createAgentBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const body = request.body as Record<string, unknown>
    const { knowledgeBaseId, reasoningEffort, tools, composioToolkits, ...rest } = body

    const createData: Record<string, unknown> = { ...rest }
    if (tools !== undefined || composioToolkits !== undefined) {
      const widgetConfig: Record<string, unknown> = {}
      if (tools !== undefined) widgetConfig.tools = tools
      if (composioToolkits !== undefined) widgetConfig.composioToolkits = composioToolkits
      createData.widgetConfig = widgetConfig
    }

    const agent = await prisma.agent.create({
      data: {
        ...createData,
        knowledgeBaseId: knowledgeBaseId || null,
        organizationId: orgId,
        createdById: request.userId,
      } as any,
    })

    return { data: agent }
  })

  // GET /api/organizations/:orgId/agent-templates — List ready-made prompt templates (member only)
  fastify.get('/organizations/:orgId/agent-templates', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    return { data: listTemplates() }
  })

  // POST /api/agents/from-template — Create an agent pre-filled from a template (member only)
  fastify.post('/agents/from-template', {
    preHandler: [
      fastify.authenticate,
      validate({ body: fromTemplateBodySchema }),
    ],
  }, async (request) => {
    const body = request.body as z.infer<typeof fromTemplateBodySchema>
    const { organizationId, template: templateType } = body

    await fastify.getMembership(request.userId!, organizationId)

    const template = getTemplate(templateType)
    if (!template) {
      throw new AppError(404, `Unknown template: ${templateType}`)
    }

    const agent = await prisma.agent.create({
      data: {
        organizationId,
        createdById: request.userId,
        name: body.name ?? template.name,
        description: body.description ?? template.description,
        model: body.model ?? template.suggestedModel,
        temperature: body.temperature ?? template.suggestedTemperature,
        systemPrompt: body.systemPrompt ?? template.systemPrompt,
        knowledgeBaseId: body.knowledgeBaseId || null,
        providerKeyId: body.providerKeyId ?? null,
      } as any,
    })

    await fastify.auditLog({
      organizationId,
      actorId: request.userId,
      action: 'agent.created',
      entityType: 'agent',
      entityId: agent.id,
      metadata: { template: template.id },
    })

    return { data: agent }
  })

  // POST /api/agents/generate — Generate an agent draft from a description (member only)
  fastify.post('/agents/generate', {
    preHandler: [
      fastify.authenticate,
      validate({ body: generateAgentBodySchema }),
    ],
  }, async (request) => {
    const { description, model } = request.body as z.infer<typeof generateAgentBodySchema>

    const { provider, apiKey, model: genModel } = await resolveGenerationProvider(request.userId!, model)

    let result
    try {
      result = await provider.generate({
        model: genModel,
        messages: [
          { role: 'system', content: AGENT_GENERATION_PROMPT },
          { role: 'user', content: description },
        ],
        temperature: 0.7,
        maxTokens: 2048,
        apiKey,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed'
      throw new AppError(502, `AI generation failed: ${msg}`)
    }

    return { data: parseAgentDraft(result.content) }
  })

  // GET /api/organizations/:orgId/agents — List agents (member only, cursor pagination)
  fastify.get('/organizations/:orgId/agents', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: agentsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      include: { tools: true, knowledgeBase: { select: { id: true, name: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = agents.length > limit
    const items = hasNextPage ? agents.slice(0, limit) : agents

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/agents/:id — Get agent by ID (member only, includes deployments)
  fastify.get('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        tools: true,
        knowledgeBase: { select: { id: true, name: true } },
        deployments: true,
      },
    })

    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    return { data: agent }
  })

  // PATCH /api/agents/:id — Update agent (member only)
  fastify.patch('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: updateAgentBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const body = request.body as Record<string, unknown>
    const { knowledgeBaseId, reasoningEffort, tools, composioToolkits, ...rest } = body

    const updateData: Record<string, unknown> = { ...rest }
    if (knowledgeBaseId !== undefined) {
      updateData.knowledgeBaseId = knowledgeBaseId || null
    }
    if (reasoningEffort !== undefined) {
      updateData.reasoningEffort = reasoningEffort
    }
    if (tools !== undefined || composioToolkits !== undefined) {
      const existingConfig = (existing.widgetConfig as Record<string, unknown>) || {}
      const widgetConfig: Record<string, unknown> = { ...existingConfig }
      if (tools !== undefined) widgetConfig.tools = tools
      if (composioToolkits !== undefined) widgetConfig.composioToolkits = composioToolkits
      updateData.widgetConfig = widgetConfig
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData as any,
    })

    return { data: agent }
  })

  // DELETE /api/agents/:id — Delete agent (admin only)
  fastify.delete('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    await prisma.widget.deleteMany({ where: { agentId: id } })

    fastify.emitEvent(NOTIFICATION_EVENTS.AGENT_DELETED, {
      organizationId: existing.organizationId,
      actorId: request.userId,
      entityId: existing.id,
      entityName: existing.name,
    })

    await prisma.agent.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/agents/:id/tools — Attach tool to agent (admin only)
  fastify.post('/agents/:id/tools', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: addToolSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { toolId } = request.body as { toolId: string }

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, agent.organizationId)

    const tool = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!tool || tool.organizationId !== agent.organizationId) {
      throw new AppError(404, 'Tool not found in this organization')
    }

    const existingLink = await prisma.agentTool.findUnique({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    if (existingLink) {
      throw new AppError(409, 'Tool is already attached to this agent', 'CONFLICT')
    }

    const link = await prisma.agentTool.create({
      data: { agentId: id, toolId },
    })

    return { data: link }
  })

  // DELETE /api/agents/:id/tools/:toolId — Detach tool from agent (admin only)
  fastify.delete('/agents/:id/tools/:toolId', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentToolParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id, toolId } = request.params as { id: string; toolId: string }

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, agent.organizationId)

    const existingLink = await prisma.agentTool.findUnique({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    if (!existingLink) {
      throw new AppError(404, 'Tool is not attached to this agent')
    }

    await prisma.agentTool.delete({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    reply.code(204).send()
  })

  // POST /api/agents/:id/test — Test agent with sample message (member only)
  fastify.post('/agents/:id/test', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: testAgentSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { message } = request.body as { message: string }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { tools: true },
    })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    let apiKey: string | undefined
    let providerId: string | undefined
    if (agent.providerKeyId) {
      const providerKey = await prisma.providerKey.findUnique({
        where: { id: agent.providerKeyId },
      })
      if (providerKey && providerKey.organizationId === agent.organizationId) {
        apiKey = decryptSecret(providerKey.apiKey, getEncryptionKey())
        providerId = providerKey.provider
      }
    }
    if (!apiKey) {
      const resolved = await resolveProviderKey({
        organizationId: agent.organizationId,
        model: agent.model,
        providerKeyId: null,
      })
      apiKey = resolved.apiKey
      providerId = resolved.provider
    }

    let provider
    try {
      provider = getProviderForModel(agent.model, providerId)
    } catch {
      throw new AppError(400, `No provider configured for model: ${agent.model}`)
    }

    const response = await provider.generate({
      model: agent.model,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 2048,
      reasoningEffort: (agent as any).reasoningEffort || undefined,
      apiKey,
    })

    return {
      data: {
        response: response.content,
        usage: response.usage,
      },
    }
  })

  // POST /api/agents/test-stream — Test agent config with SSE streaming (authenticated)
  fastify.post('/agents/test-stream', {
    preHandler: [
      fastify.authenticate,
      validate({ body: testStreamSchema }),
    ],
  }, async (request, reply) => {
    const {
      model,
      systemPrompt,
      message,
      temperature,
      maxTokens,
      reasoningEffort,
      providerKeyId,
      knowledgeBaseId,
      history,
      tools: toolNames,
      toolIds,
      mcpServerIds,
      composioToolkits,
      guardrails,
    } = request.body as z.infer<typeof testStreamSchema>

    const providerKey = providerKeyId
      ? await prisma.providerKey.findFirst({
          where: {
            id: providerKeyId,
            organization: { memberships: { some: { userId: request.userId! } } },
          },
          select: { apiKey: true, provider: true },
        })
      : null
    let apiKey = providerKey ? decryptSecret(providerKey.apiKey, getEncryptionKey()) : undefined

    // Fall back to the org's configured key for this model's provider when the
    // caller didn't pick an explicit key (BYOK from Settings → Provider Keys).
    if (!providerKey && !apiKey) {
      const org = await prisma.membership.findFirst({
        where: { userId: request.userId! },
        orderBy: { createdAt: 'asc' },
        select: { organizationId: true },
      })
      if (org) {
        const resolved = await resolveProviderKey({
          organizationId: org.organizationId,
          model,
          providerKeyId: null,
        })
        if (resolved.apiKey) {
          apiKey = resolved.apiKey
        }
      }
    }

    // Plan-gate server-billed tools (e.g. web search). Free plans cannot use them.
    let effectiveToolNames = toolNames
    let gatedToolNote = ''
    if (toolNames.some((name) => GATED_TOOLS.has(name))) {
      const planName = await getCallerPlanName(request.userId!, providerKeyId)
      // Free plans (or an unresolvable org) cannot use gated tools.
      if (planName === null || planName === 'free') {
        effectiveToolNames = toolNames.filter((name) => !GATED_TOOLS.has(name))
        gatedToolNote =
          'Web search is a Pro feature and is disabled on the current plan. If asked to search the web, explain that upgrading to Pro enables it.'
      }
    }

    const corsHeaders = getCorsHeaders(fastify.config.CORS_ORIGIN, request)

    reply.hijack()

    let provider
    try {
      provider = getProviderForModel(model, providerKey?.provider)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown provider error'
      reply.raw.writeHead(400, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      })
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
      return
    }

    let systemContext = systemPrompt
    if (gatedToolNote) {
      systemContext = `${systemContext}\n\n${gatedToolNote}`
    }
    systemContext += guardrailPrompt(guardrails)

    const guardrailRefusal = guardrailInputRefusal(message, guardrails)
    if (guardrailRefusal) {
      reply.hijack()
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      })
      reply.raw.write(`data: ${JSON.stringify({ type: 'text', content: guardrailRefusal })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
      return
    }

    // Convert tool names to native tool definitions for the AI provider
    const toolDefs = effectiveToolNames
      .map((name) => getToolHandler(name))
      .filter((h): h is NonNullable<ReturnType<typeof getToolHandler>> => !!h)
      .map((h) => ({
        name: h.schema.name,
        description: h.schema.description,
        parameters: h.schema.parameters,
      }))

    // ponytail: add ask_user tool when any tools are enabled — it's client-handled
    if (effectiveToolNames.length > 0) {
      toolDefs.push({
        name: ASK_USER_TOOL.name,
        description: ASK_USER_TOOL.description,
        parameters: ASK_USER_TOOL.parameters,
      })
    }

    // DB tools by ID must belong to one of the caller's organizations
    const dbToolHandlers = toolIds.length > 0
      ? await loadDbToolHandlers(prisma, toolIds, {
          organization: { memberships: { some: { userId: request.userId! } } },
        })
      : {}
    for (const handler of Object.values(dbToolHandlers)) {
      toolDefs.push({
        name: handler.schema.name,
        description: handler.schema.description,
        parameters: handler.schema.parameters,
      })
    }

    // Load MCP tools by server ID
    const mcpToolHandlers: Record<string, { schema: { name: string; description: string; parameters: Record<string, unknown> }; execute: (args: Record<string, unknown>) => Promise<unknown> }> = {}
    if (mcpServerIds.length > 0) {
      const { clientFromServer } = await import('../../services/mcp/factory.js')
      const servers = await prisma.mcpServer.findMany({
        where: {
          id: { in: mcpServerIds },
          enabled: true,
          organization: { memberships: { some: { userId: request.userId! } } },
        },
      })
      for (const server of servers) {
        try {
          const client = clientFromServer(server)
          const mcpTools = await client.listTools()
          for (const tool of mcpTools) {
            const namespacedName = `${server.name}:${tool.name}`
            toolDefs.push({
              name: namespacedName,
              description: tool.description || `MCP tool from ${server.name}`,
              parameters: (tool.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
            })
            mcpToolHandlers[namespacedName] = {
              schema: { name: namespacedName, description: tool.description || '', parameters: (tool.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} } },
              async execute(args: Record<string, unknown>) {
                try {
                  const execClient = clientFromServer(server)
                  const result = await execClient.callTool(tool.name, args)
                  await execClient.disconnect().catch(() => {})
                  return result
                } catch (err) {
                  return { error: `MCP tool ${tool.name} failed: ${(err as Error).message}` }
                }
              },
            }
          }
          await client.disconnect().catch(() => {})
        } catch (err) {
          console.warn(`Failed to load MCP tools from ${server.name}: ${(err as Error).message}`)
        }
      }
    }

    // Load Composio tools by toolkit (org config gates which toolkits are allowed)
    const composioToolHandlers: Record<string, { schema: { name: string; description: string; parameters: Record<string, unknown> }; execute: (args: Record<string, unknown>) => Promise<unknown> }> = {}
    if (composioToolkits.length > 0) {
      const orgId = await resolveCallerOrgId(request.userId!, providerKeyId)
      if (orgId) {
        // Plan gate: Composio toolkits are a Pro feature — free plans get a note instead.
        let planName: string | null = null
        try {
          planName = (await getOrgPlan(orgId)).name
        } catch {
          planName = null
        }
        if (planName === null || planName === 'free') {
          systemContext += '\n\nComposio integrations are a Pro feature and are disabled on the current plan. If asked to use connected apps (Gmail, Slack, GitHub, etc.), explain that upgrading to Pro enables them.'
        } else {
          const result = await loadComposioToolHandlers({ orgId, requestedToolkits: composioToolkits })
          for (const handler of result.handlers) {
            toolDefs.push({
              name: handler.schema.name,
              description: handler.schema.description,
              parameters: handler.schema.parameters,
            })
            composioToolHandlers[handler.schema.name] = {
              schema: handler.schema,
              execute: async (args: Record<string, unknown>) => await handler.execute(args),
            }
          }
          if (result.rejectedToolkits.length > 0) {
            console.warn(`[composio] Ignored toolkits not enabled at org level: ${result.rejectedToolkits.join(', ')}`)
          }
        }
      }
    }

    if (knowledgeBaseId) {
      const kb = await prisma.knowledgeBase.findFirst({
        where: { id: knowledgeBaseId, organization: { memberships: { some: { userId: request.userId! } } } },
        select: { id: true },
      })
      if (!kb) throw new AppError(403, 'Knowledge base not found in your organizations', 'FORBIDDEN')
      const context = await retrieveContext(message, knowledgeBaseId).catch(() => null)
      if (context) {
        systemContext +=
          '\n\n## Retrieved knowledge (RAG)\n' +
          'Use the following source excerpts to answer. Prefer this context over general knowledge when relevant. ' +
          'If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n' +
          context
      }
    }

    const messages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
      { role: 'user' as const, content: message },
    ]

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...corsHeaders,
    })
    reply.raw.flushHeaders()

    let clientDisconnected = false
    request.raw.once('close', () => {
      clientDisconnected = true
    })

    try {
      // Multi-round agentic loop: the model may chain tool calls across rounds
      // (search → fetch page → answer). Each round's tool results are fed back
      // as context; the final round omits tools so the model must answer.
      const MAX_TOOL_ROUNDS = 5
      let finalUsage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined
      const roundContext: { role: 'user' | 'assistant'; content: string }[] = []

      for (let round = 1; round <= MAX_TOOL_ROUNDS; round++) {
        const isFinalRound = round === MAX_TOOL_ROUNDS
        const stream = provider.stream({
          model,
          messages: [...messages, ...roundContext],
          temperature,
          maxTokens,
          reasoningEffort: reasoningEffort || undefined,
          apiKey,
          tools: !isFinalRound && toolDefs.length > 0 ? toolDefs : undefined,
        })

        let roundText = ''
        const toolCallsFromStream: { tool: string; args: Record<string, unknown> }[] = []

        for await (const chunk of stream) {
          if (clientDisconnected) break
          if (chunk.type === 'reasoning') {
            reply.raw.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.content })}\n\n`)
          } else if (chunk.type === 'text' && chunk.content) {
            roundText += chunk.content
            reply.raw.write(`data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`)
          } else if (chunk.type === 'tool_call' && chunk.toolCall) {
            const toolName = chunk.toolCall.name
            const args = chunk.toolCall.arguments
            toolCallsFromStream.push({ tool: toolName, args })
            reply.raw.write(`data: ${JSON.stringify({ type: 'tool_call', tool: toolName, args })}\n\n`)
          } else if (chunk.type === 'done') {
            if (chunk.usage) {
              finalUsage = {
                promptTokens: (finalUsage?.promptTokens ?? 0) + (chunk.usage.promptTokens ?? 0),
                completionTokens: (finalUsage?.completionTokens ?? 0) + (chunk.usage.completionTokens ?? 0),
                totalTokens: (finalUsage?.totalTokens ?? 0) + (chunk.usage.totalTokens ?? 0),
              }
            }
            break
          }
        }
        if (clientDisconnected) break

        // No tool calls this round → the model delivered its final answer.
        if (toolCallsFromStream.length === 0) break

        // ponytail: ask_user is client-handled — surface questions and pause.
        const askUserCall = toolCallsFromStream.find((tc) => tc.tool === 'ask_user')
        if (askUserCall) {
          const toolCallId = `tc-${Date.now()}`
          reply.raw.write(`data: ${JSON.stringify({
            type: 'tool_requires_input',
            toolCallId,
            tool: 'ask_user',
            args: askUserCall.args,
          })}\n\n`)
          if (finalUsage) {
            reply.raw.write(`data: ${JSON.stringify({ type: 'usage', usage: finalUsage })}\n\n`)
          }
          reply.raw.write('data: [DONE]\n\n')
          reply.raw.end()
          return
        }

        const results: { tool: string; result: unknown }[] = []
        for (const tc of toolCallsFromStream) {
          const handler = getToolHandler(tc.tool) || dbToolHandlers[tc.tool] || mcpToolHandlers[tc.tool] || composioToolHandlers[tc.tool]
          if (handler) {
            const result = await handler.execute(tc.args)
            reply.raw.write(`data: ${JSON.stringify({ type: 'tool_result', tool: tc.tool, result })}\n\n`)
            results.push({ tool: tc.tool, result })
          } else {
            // Feed unknown-tool errors back so the model can self-correct
            // instead of silently continuing without the data.
            results.push({ tool: tc.tool, result: { error: `Tool "${tc.tool}" is not available.` } })
          }
        }

        const resultsSummary = results
          .map((r) => `${r.tool} returned:\n${JSON.stringify(r.result, null, 2)}`)
          .join('\n\n')

        roundContext.push({ role: 'assistant', content: roundText || 'I will look that up for you.' })
        roundContext.push({
          role: 'user',
          content: `The following tools returned these results:\n\n${resultsSummary}\n\nContinue: if you still need information, call another tool; otherwise write your final answer to the user now.`,
        })
      }

      if (finalUsage) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'usage', usage: finalUsage })}\n\n`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stream generation failed'
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
    }

    if (!clientDisconnected) {
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    }
  })

  // ponytail: resume endpoint for ask_user tool output
  fastify.post('/agents/test-stream-resume', {
    preHandler: [
      fastify.authenticate,
      validate({ body: testStreamResumeSchema }),
    ],
  }, async (request, reply) => {
    const {
      model,
      systemPrompt,
      message,
      temperature,
      maxTokens,
      reasoningEffort,
      providerKeyId,
      knowledgeBaseId,
      history,
      guardrails,
      toolCallId,
      toolName,
      toolOutput,
      assistantText,
    } = request.body as z.infer<typeof testStreamResumeSchema>

    const providerKey = providerKeyId
      ? await prisma.providerKey.findFirst({
          where: {
            id: providerKeyId,
            organization: { memberships: { some: { userId: request.userId! } } },
          },
          select: { apiKey: true, provider: true },
        })
      : null
    let apiKey = providerKey ? decryptSecret(providerKey.apiKey, getEncryptionKey()) : undefined

    if (!providerKey && !apiKey) {
      const org = await prisma.membership.findFirst({
        where: { userId: request.userId! },
        orderBy: { createdAt: 'asc' },
        select: { organizationId: true },
      })
      if (org) {
        const resolved = await resolveProviderKey({
          organizationId: org.organizationId,
          model,
          providerKeyId: null,
        })
        if (resolved.apiKey) {
          apiKey = resolved.apiKey
        }
      }
    }

    const corsHeaders = getCorsHeaders(fastify.config.CORS_ORIGIN, request)

    reply.hijack()

    let provider
    try {
      provider = getProviderForModel(model, providerKey?.provider)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown provider error'
      reply.raw.writeHead(400, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      })
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
      return
    }

    let systemContext = systemPrompt
    systemContext += guardrailPrompt(guardrails)

    const guardrailRefusal = guardrailInputRefusal(message, guardrails)
    if (guardrailRefusal) {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      })
      reply.raw.write(`data: ${JSON.stringify({ type: 'text', content: guardrailRefusal })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
      return
    }

    if (knowledgeBaseId) {
      const context = await retrieveContext(message, knowledgeBaseId).catch(() => null)
      if (context) {
        systemContext +=
          '\n\n## Retrieved knowledge (RAG)\n' +
          'Use the following source excerpts to answer. Prefer this context over general knowledge when relevant. ' +
          'If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n' +
          context
      }
    }

    const toolOutputSummary = toolOutput
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n')

    const messages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: assistantText || 'Let me ask you a few questions to clarify.' },
      { role: 'user' as const, content: `User answered the questions:\n\n${toolOutputSummary}\n\nPlease continue and provide a helpful response based on these answers. Do NOT use any tools or ask more questions.` },
    ]

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...corsHeaders,
    })
    reply.raw.flushHeaders()

    let clientDisconnected = false
    request.raw.once('close', () => {
      clientDisconnected = true
    })

    try {
      const stream = provider.stream({
        model,
        messages,
        temperature,
        maxTokens,
        reasoningEffort: reasoningEffort || undefined,
        apiKey,
      })

      let finalUsage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined

      for await (const chunk of stream) {
        if (clientDisconnected) break
        if (chunk.type === 'reasoning') {
          reply.raw.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'text' && chunk.content) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'done') {
          finalUsage = chunk.usage
          break
        }
      }

      if (finalUsage) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'usage', usage: finalUsage })}\n\n`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stream generation failed'
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
    }

    if (!clientDisconnected) {
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    }
  })

  // PATCH /api/agents/:id/status — Change agent status (admin only, validates transitions)
  fastify.patch('/agents/:id/status', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: z.object({ status: z.enum(['draft', 'active', 'paused', 'archived']) }) }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const agent = await prisma.agent.update({
      where: { id },
      data: { status },
    })

    return { data: agent }
  })
}
