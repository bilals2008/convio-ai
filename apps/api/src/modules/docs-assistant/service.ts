import type { AIProvider } from '@convio/ai'
import { getProviderById, getProviderForModel } from '@convio/ai/providers'
import { prisma } from '@convio/database'
import { decryptSecret, encryptSecret, getEncryptionKey } from '../../services/encryption.js'

const DEFAULT_PROVIDER = 'agnes'
const DEFAULT_MODEL = 'agnes-2.5'

const keyMap: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  opencode: 'OPENCODE_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  agnes: 'AGNES_API_KEY',
  local: 'LOCAL_API_URL',
}

export interface DocsAssistantConfig {
  provider: string
  model: string
  keyPreview: string | null
}

/**
 * Resolve which provider + model + key answer docs questions. Order of
 * precedence: the admin-panel config (encrypted key) → the provider's env key →
 * the provider's own default. Defaults to Agnes AI so the assistant works with
 * zero env configuration.
 */
export async function resolveDocsModel(): Promise<{
  provider: AIProvider
  model: string
  apiKey?: string
}> {
  const config = await prisma.docsAssistantConfig.findUnique({ where: { id: 'default' } })
  const providerId = config?.provider || DEFAULT_PROVIDER
  const model = config?.model || DEFAULT_MODEL

  const provider = getProviderById(providerId) ?? getProviderForModel(model)

  const storedKey = config?.apiKey ? decryptSecret(config.apiKey, getEncryptionKey()) : undefined
  const envVar = keyMap[provider.id]
  const apiKey = storedKey || (envVar ? process.env[envVar] : undefined)

  return { provider, model, apiKey }
}

export async function getDocsAssistantConfig(): Promise<DocsAssistantConfig> {
  const config = await prisma.docsAssistantConfig.findUnique({ where: { id: 'default' } })
  return {
    provider: config?.provider || DEFAULT_PROVIDER,
    model: config?.model || DEFAULT_MODEL,
    keyPreview: config?.keyPreview ?? null,
  }
}

function maskKey(key: string): string {
  return key.length > 8 ? `sk-...${key.slice(-4)}` : `...${key.slice(-4)}`
}

export async function saveDocsAssistantConfig(input: {
  provider: string
  model: string
  apiKey?: string
  updatedById?: string
}): Promise<DocsAssistantConfig> {
  const data: {
    provider: string
    model: string
    apiKey?: string
    keyPreview?: string
    updatedById?: string
  } = {
    provider: input.provider,
    model: input.model,
    updatedById: input.updatedById,
  }

  if (input.apiKey) {
    data.apiKey = encryptSecret(input.apiKey, getEncryptionKey())
    data.keyPreview = maskKey(input.apiKey)
  }

  const config = await prisma.docsAssistantConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      provider: data.provider,
      model: data.model,
      apiKey: data.apiKey,
      keyPreview: data.keyPreview,
      updatedById: data.updatedById,
    },
    update: data,
  })

  return {
    provider: config.provider,
    model: config.model,
    keyPreview: config.keyPreview ?? null,
  }
}
