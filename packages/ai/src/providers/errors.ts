const isDev = process.env.NODE_ENV !== 'production'

export function toProviderError(error: unknown, providerName: string): Error {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (
    lower.includes('api key') ||
    lower.includes('apikey') ||
    lower.includes('authentication') ||
    lower.includes('unauthorized') ||
    lower.includes('missing credentials') ||
    lower.includes('401')
  ) {
    return new Error(`Invalid or missing ${providerName} API key. Add your key in Settings → Provider Keys and try again.`)
  }

  if (isDev) {
    return new Error(`[${providerName}] ${message}`)
  }

  console.error(`[${providerName}] ${message}`, error)
  return new Error(`${providerName} request failed. Please check your API key and try again.`)
}

export function isUpstreamFailure(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return msg.includes('Upstream request failed') || msg.includes('503') || msg.includes('Service Unavailable')
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
