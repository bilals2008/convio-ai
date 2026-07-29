interface ErrorContext {
  component?: string
  action?: string
  url?: string
  userId?: string
  info?: unknown
}

const STORAGE_KEY = 'convio:error-log'

function getStoredErrors(): unknown[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function storeError(entry: unknown) {
  try {
    const errors = getStoredErrors()
    errors.push(entry)
    if (errors.length > 100) errors.shift()
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(errors))
  } catch {
  }
}

export function captureError(error: Error, context?: ErrorContext) {
  const entry = {
    message: error.message,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: context?.url || window.location.href,
    component: context?.component,
    action: context?.action,
    userId: context?.userId,
  }

  if (import.meta.env.DEV) {
    console.error('[ErrorTracking]', entry, error)
  }

  storeError(entry)
}

export function capturePromiseRejection(event: PromiseRejectionEvent) {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  captureError(error, { action: 'unhandledPromiseRejection' })
}

export function getErrorLog() {
  return getStoredErrors()
}

export function clearErrorLog() {
  sessionStorage.removeItem(STORAGE_KEY)
}
