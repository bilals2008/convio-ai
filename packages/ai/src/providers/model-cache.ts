import type { Model } from '../index.js'

const cache = new Map<string, { data: Model[]; expires: number }>()

export async function getCachedModels(
  key: string,
  ttlMs: number,
  loader: () => Promise<Model[]>,
): Promise<Model[]> {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.data
  const data = await loader()
  if (data.length > 0) cache.set(key, { data, expires: Date.now() + ttlMs })
  return data
}

export async function fetchOpenAICompatibleModels(
  baseURL: string,
  provider: string,
  apiKey?: string,
): Promise<Model[]> {
  const res = await fetch(`${baseURL}/models`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Models API returned ${res.status}`)
  const body = await res.json() as { data: Array<{ id: string }> }
  if (!body?.data?.length) throw new Error('No models in response')
  return body.data.map((m) => ({
    id: m.id,
    name: m.id,
    provider,
    maxTokens: 128000,
    supportsTools: true,
    supportsStreaming: true,
  }))
}

export function modelCacheKey(provider: string, apiKey?: string): string {
  return `${provider}:${apiKey ?? 'default'}`
}