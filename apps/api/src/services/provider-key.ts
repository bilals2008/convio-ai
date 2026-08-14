import { prisma } from '@convio/database'
import { getProviderForModel } from '@convio/ai/providers'

export interface ResolvedProviderKey {
  apiKey?: string
  provider?: string
}

/**
 * Resolve the API key to use for a generation:
 * 1. Explicit key linked to the agent/providerKeyId (org-scoped).
 * 2. Org's configured key for the model's provider (BYOK from Settings → Provider Keys).
 * 3. Nothing → provider falls back to its own env key.
 */
export async function resolveProviderKey(opts: {
  organizationId: string
  model: string
  providerKeyId?: string | null
}): Promise<ResolvedProviderKey> {
  if (opts.providerKeyId) {
    const explicit = await prisma.providerKey.findFirst({
      where: { id: opts.providerKeyId, organizationId: opts.organizationId },
      select: { apiKey: true, provider: true },
    })
    if (explicit) return explicit
  }

  let providerId: string | undefined
  try {
    providerId = getProviderForModel(opts.model).id
  } catch {
    return {}
  }
  const orgKey = await prisma.providerKey.findUnique({
    where: { organizationId_provider: { organizationId: opts.organizationId, provider: providerId } },
    select: { apiKey: true, provider: true },
  })
  return orgKey ?? {}
}
