import crypto from 'node:crypto'

const PLATFORM_API = 'https://api.kapso.ai/platform/v1'

export function getApiKey(overrideKey?: string): string {
  if (overrideKey) return overrideKey
  const key = process.env.KAPSO_ORG_API_KEY
  if (!key) throw new Error('KAPSO_ORG_API_KEY not configured')
  return key
}

async function platformFetch(path: string, options: RequestInit = {}, apiKey?: string) {
  const url = `${PLATFORM_API}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': getApiKey(apiKey),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Kapso API error ${res.status}: ${body}`)
  }
  return res.json()
}

export async function createKapsoCustomer(name: string, externalId: string, apiKey?: string) {
  const data = await platformFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      customer: { name, external_customer_id: externalId },
    }),
  }, apiKey)
  return data.data as { id: string; name: string }
}

export async function generateSetupLink(
  customerId: string,
  successRedirectUrl: string,
  failureRedirectUrl: string,
  apiKey?: string
) {
  const data = await platformFetch(`/customers/${customerId}/setup_links`, {
    method: 'POST',
    body: JSON.stringify({
      setup_link: {
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
      },
    }),
  }, apiKey)
  return data.data as { id: string; url: string; expires_at: string }
}

export interface KapsoPhoneNumber {
  id: string
  display_name?: string
  display_phone_number?: string
  kind?: string
  status?: string | null
  customer_id?: string | null
}

export async function listPhoneNumbers(apiKey?: string): Promise<KapsoPhoneNumber[]> {
  const data = await platformFetch('/whatsapp/phone_numbers', {}, apiKey)
  const arr = (data as { data?: KapsoPhoneNumber[] }).data ?? (data as KapsoPhoneNumber[])
  return Array.isArray(arr) ? arr : []
}

export async function registerMessageWebhook(
  phoneNumberId: string,
  webhookUrl: string,
  secretKey?: string,
  apiKey?: string
) {
  const secret = secretKey || crypto.randomUUID().replace(/-/g, '')
  const data = await platformFetch(
    `/whatsapp/phone_numbers/${phoneNumberId}/webhooks`,
    {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_webhook: {
          kind: 'kapso',
          url: webhookUrl,
          events: ['whatsapp.message.received'],
          active: true,
          secret_key: secret,
        },
      }),
    },
    apiKey
  )
  return { ...(data as Record<string, unknown>), secretKey: secret }
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const signatureBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (signatureBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(signatureBuf, expectedBuf)
}

export async function sendPlatformMessage(
  phoneNumberId: string,
  to: string,
  body: string,
  apiKey?: string
) {
  const baseUrl = process.env.KAPSO_API_BASE_URL || 'https://api.kapso.ai/meta/whatsapp'
  const url = `${baseUrl}/v24.0/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': getApiKey(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Kapso send error ${res.status}: ${text}`)
  }
  return res.json()
}
