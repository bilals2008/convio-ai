// AI agent draft generation: schema, prompt, and response parsing for the
// "Create with AI" endpoint. Kept separate from routes so it can be unit-tested.

import { z } from 'zod'
import { AppError } from '../../plugins/error.js'
import { prisma } from '@convio/database'
import { getProviderForModel } from '@convio/ai/providers'
import type { AIProvider } from '@convio/ai'

export const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  opencode: 'OPENCODE_API_KEY',
  local: 'LOCAL_API_URL',
}

export const agentDraftSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().max(500).default(''),
  systemPrompt: z.string().max(10000).default(''),
  suggestedModel: z.string().max(200).optional(),
  suggestedTemperature: z.number().min(0).max(2).optional(),
  toneOfVoice: z.string().max(50).optional(),
  language: z.string().max(50).optional(),
  suggestedTools: z.array(z.string()).max(10).optional(),
  suggestedCapabilities: z.array(z.string()).max(10).optional(),
  suggestedDeployments: z.array(z.string()).max(10).optional(),
})

export type AgentDraft = z.infer<typeof agentDraftSchema>

export const AGENT_GENERATION_PROMPT = `You design AI chat agents for a platform called Convio. The user will describe the agent they want in plain language. Respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching this schema:

{
  "name": string,            // short, memorable agent name (<=50 chars)
  "description": string,     // one sentence describing what the agent does (<=200 chars)
  "systemPrompt": string,    // detailed system prompt: role, behavior, tone, constraints, knowledge guidance (2-8 sentences)
  "suggestedModel": string,  // optional: a model id you recommend, must be one of the free opencode zen models listed below
  "suggestedTemperature": number, // 0.0-2.0, higher = more creative. 0.3-0.5 for accurate/supportive agents, 0.6-0.8 for creative ones
  "toneOfVoice": string,     // one of: friendly, professional, casual, witty, empathetic
  "language": string,        // language the agent should respond in, e.g. english
  "suggestedTools": string[] // subset of: ["web-search", "calculator", "url-fetcher", "current-time"]. Only include tools that genuinely help this agent.
  "suggestedCapabilities": string[] // subset of: ["answer-questions", "knowledge-search", "generate-leads", "book-appointments", "execute-actions"]. Capabilities the agent needs.
  "suggestedDeployments": string[]  // subset of: ["web-chat-widget", "shareable-link", "whatsapp"]. Channels the agent should be available on.
}

Rules:
- Make the systemPrompt specific and useful, not generic.
- Never invent tool, capability, or deployment ids outside the allowed lists.
- Only include an id if it genuinely helps the agent (e.g. "generate-leads" only for lead capture, "web-search" only when it needs current info).
- The suggestedModel MUST be one of the free opencode zen model ids:
  opencode/deepseek-v4-flash, opencode/mimo-v2.5, opencode/nemotron-3-ultra, opencode/north-mini-code, opencode/laguna-s-2.1
- Never suggest gpt-*, claude-*, or gemini-* models.
- Return valid JSON only.`

/** Resolve a usable generation provider + key for a user (BYOK first, env fallback). */
export async function resolveGenerationProvider(
  userId: string,
  model?: string,
): Promise<{ provider: AIProvider; apiKey?: string; model: string }> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: { include: { providerKeys: true } } },
  })
  const userKeyMap = new Map(
    (membership?.organization?.providerKeys || []).map((k) => [k.provider, k.apiKey])
  )

  const genModel = model || 'opencode/deepseek-v4-flash-free'
  let provider
  try {
    provider = getProviderForModel(genModel)
  } catch {
    throw new AppError(400, `No provider configured for model: ${genModel}`)
  }

  const apiKey = userKeyMap.get(provider.id) || process.env[PROVIDER_ENV_KEYS[provider.id]]
  if (!apiKey && provider.id !== 'opencode') {
    throw new AppError(
      400,
      'No API key configured for the selected model provider. Add one in Settings → Provider Keys.'
    )
  }

  return { provider, apiKey, model: genModel }
}

/** Extract the first JSON object from an LLM response (handles code fences and prose). */
export function extractJsonObject(content: string): unknown {
  let raw = content.trim()
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) raw = fence[1].trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object found')
  return JSON.parse(raw.slice(start, end + 1))
}

/** Extract the JSON object from an LLM response (handles code fences and prose). */
export function parseAgentDraft(content: string): AgentDraft {
  try {
    return agentDraftSchema.parse(extractJsonObject(content))
  } catch (error) {
    const detail = error instanceof z.ZodError
      ? `missing ${error.issues.map((i) => i.path.join('.')).join(', ')}`
      : 'invalid JSON'
    throw new AppError(502, `The AI returned an unusable draft (${detail}). Please try again.`)
  }
}
