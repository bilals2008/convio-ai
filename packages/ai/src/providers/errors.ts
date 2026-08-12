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

  if (
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('insufficient')
  ) {
    return new Error(`The ${providerName} provider is rate-limiting requests. Wait a moment and try again.`)
  }

  if (lower.includes('model') && (lower.includes('not found') || lower.includes('does not exist'))) {
    return new Error(`This model is not available for the configured ${providerName} provider. Pick a different model.`)
  }

  if (
    lower.includes('upstream') ||
    lower.includes('503') ||
    lower.includes('overloaded') ||
    lower.includes('unavailable') ||
    lower.includes('service unavailable')
  ) {
    return new Error(`The ${providerName} provider is temporarily overloaded. Try again in a few seconds.`)
  }

  if (isDev) {
    return new Error(`[${providerName}] ${message}`)
  }

  console.error(`[${providerName}] ${message}`, error)
  return new Error(`${providerName} request failed. Please try again.`)
}

export function isUpstreamFailure(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return msg.includes('Upstream request failed') || msg.includes('503') || msg.includes('Service Unavailable')
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
