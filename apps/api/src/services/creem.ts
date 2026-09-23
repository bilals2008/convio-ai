import { CREEM_TEST_MODE } from '@convio/config'
import { AppError } from '../plugins/error.js'

const TEST_BASE_URL = 'https://test-api.creem.io'
const LIVE_BASE_URL = 'https://api.creem.io'
const REQUEST_TIMEOUT_MS = 15_000

export type CreemMode = 'test' | 'live'

// The environment follows the API key prefix via CREEM_TEST_MODE, so the base URL and
// the credential can never point at different environments.
export const creemMode = (): CreemMode => (CREEM_TEST_MODE ? 'test' : 'live')
export const creemBaseUrl = () => (CREEM_TEST_MODE ? TEST_BASE_URL : LIVE_BASE_URL)
export const isCreemConfigured = () => Boolean(process.env.CREEM_API_KEY)

interface CreemErrorBody {
  message?: string[] | string
  trace_id?: string
  error?: string
}

function errorMessage(body: CreemErrorBody | null, status: number): string {
  const message = body?.message
  if (Array.isArray(message) && message.length > 0) return message.join(' ')
  if (typeof message === 'string' && message) return message
  return body?.error || `Creem request failed (HTTP ${status})`
}

interface CreemRequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  idempotencyKey?: string
}

export async function creemRequest<T>(path: string, options: CreemRequestOptions): Promise<T> {
  const apiKey = process.env.CREEM_API_KEY
  if (!apiKey) {
    throw new AppError(500, 'Creem is not configured on this server.', 'CREEM_NOT_CONFIGURED')
  }

  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey

  let response: Response
  try {
    response = await fetch(`${creemBaseUrl()}${path}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    // Never leak the key or the raw network error to the caller.
    throw new AppError(502, 'Creem is unreachable. Please try again.', 'CREEM_UNREACHABLE')
  }

  const text = await response.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AppError(502, 'Creem rejected the API key. Check CREEM_API_KEY.', 'CREEM_AUTH_FAILED')
    }

    // 400/404/409 are actionable by the caller; everything else is an upstream fault.
    const status = response.status === 400 || response.status === 404 || response.status === 409
      ? response.status
      : 502
    throw new AppError(status, errorMessage(parsed as CreemErrorBody | null, response.status), 'CREEM_ERROR')
  }

  return parsed as T
}

export interface CreemProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  billing_type: string
  billing_period: string
  status: string
  mode: string
  trial_period_days?: number | null
  product_url?: string
}

export interface CreemProductInput {
  name: string
  description: string
  price: number
  currency: 'USD' | 'EUR'
  billing_type: 'recurring' | 'onetime'
  billing_period?: string
  tax_category?: 'saas' | 'digital-goods-service' | 'ebooks'
  tax_mode?: 'inclusive' | 'exclusive'
  default_success_url?: string
  trial_period_days?: number | null
}

export const creemProducts = {
  create: (payload: CreemProductInput, idempotencyKey?: string) =>
    creemRequest<CreemProduct>('/v1/products', { method: 'POST', body: payload, idempotencyKey }),

  get: (productId: string) =>
    creemRequest<CreemProduct>(`/v1/products?product_id=${encodeURIComponent(productId)}`, { method: 'GET' }),

  // On Creem, omitting trial_period_days leaves it unchanged while null removes it.
  // PATCH rejects tax_category ("property tax_category should not exist") — create-only field.
  update: (productId: string, payload: Partial<Omit<CreemProductInput, 'tax_category'>>) =>
    creemRequest<CreemProduct>(`/v1/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: payload }),
}

export interface CreemCheckout {
  id: string
  checkout_url: string
  status?: string
}

export const creemCheckouts = {
  create: (payload: {
    product_id: string
    success_url?: string
    metadata?: Record<string, unknown>
  }) => creemRequest<CreemCheckout>('/v1/checkouts', { method: 'POST', body: payload }),
}

export const creemCustomers = {
  billingPortal: (customerId: string) =>
    creemRequest<{ customer_portal_link: string }>('/v1/customers/billing', {
      method: 'POST',
      body: { customer_id: customerId },
    }),
}
