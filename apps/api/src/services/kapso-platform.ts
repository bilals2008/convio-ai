import crypto from 'node:crypto'

const PLATFORM_API = 'https://api.kapso.ai/platform/v1'

function getApiKey(): string {
  const key = process.env.KAPSO_ORG_API_KEY
  if (!key) throw new Error('KAPSO_ORG_API_KEY not configured')
  return key
}

async function platformFetch(path: string, options: RequestInit = {}) {
  const url = `${PLATFORM_API}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': getApiKey(),
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

export async function createKapsoCustomer(name: string, externalId: string) {
  const data = await platformFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      customer: { name, external_customer_id: externalId },
    }),
  })
  return data.data as { id: string; name: string }
}

export async function generateSetupLink(
  customerId: string,
  successRedirectUrl: string,
  failureRedirectUrl: string
) {
  const data = await platformFetch(`/customers/${customerId}/setup_links`, {
    method: 'POST',
    body: JSON.stringify({
      setup_link: {
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
      },
    }),
  })
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

export async function listPhoneNumbers(): Promise<KapsoPhoneNumber[]> {
  const data = await platformFetch('/whatsapp/phone_numbers')
  const arr = (data as { data?: KapsoPhoneNumber[] }).data ?? (data as KapsoPhoneNumber[])
  return Array.isArray(arr) ? arr : []
}

export async function registerMessageWebhook(
  phoneNumberId: string,
  webhookUrl: string,
  secretKey?: string
) {
  // Kapso requires a non-blank secret_key when creating a webhook. Generate one
  // if the caller didn't supply it. The returned secret should be persisted so
  // incoming deliveries can be verified.
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
    }
  )
  return { ...(data as Record<string, unknown>), secretKey: secret }
}

export async function sendPlatformMessage(
  phoneNumberId: string,
  to: string,
  body: string
) {
  const baseUrl = process.env.KAPSO_API_BASE_URL || 'https://api.kapso.ai/meta/whatsapp'
  const url = `${baseUrl}/v24.0/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': getApiKey(),
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
