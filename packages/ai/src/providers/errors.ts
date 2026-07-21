const isDev = process.env.NODE_ENV !== 'production'

export function toProviderError(error: unknown, providerName: string): Error {
  const message = error instanceof Error ? error.message : String(error)

  if (isDev) {
    return new Error(`[${providerName}] ${message}`)
  }

  console.error(`[${providerName}] ${message}`, error)
  return new Error(`${providerName} request failed. Please check your API key and try again.`)
}
