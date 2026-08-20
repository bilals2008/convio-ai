import { prisma } from '@convio/database'
import { getProviderForModel } from '@convio/ai/providers'
import { decryptSecret, getEncryptionKey } from './encryption.js'

export interface ResolvedProviderKey {
  apiKey?: string
  provider?: string
}

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
    if (explicit) {
      return { apiKey: decryptSecret(explicit.apiKey, getEncryptionKey()), provider: explicit.provider }
    }
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
  return orgKey
    ? { apiKey: decryptSecret(orgKey.apiKey, getEncryptionKey()), provider: orgKey.provider }
    : {}
}
