import { getApiKey } from '../kapso-platform.js'

const META_API = 'https://api.kapso.ai/meta/whatsapp/v24.0'

async function apiPost(phoneNumberId: string, body: Record<string, unknown>, apiKey?: string) {
  const url = `${META_API}/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': getApiKey(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WhatsApp API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function sendTypingIndicator(
  phoneNumberId: string,
  to: string,
  messageId?: string
) {
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    status: 'read',
    ...(messageId ? { message_id: messageId } : {}),
    typing_indicator: { type: 'text' },
  }
  return apiPost(phoneNumberId, body)
}

export async function sendInteractive(
  phoneNumberId: string,
  to: string,
  interactivePayload: Record<string, unknown>,
  apiKey?: string
) {
  return apiPost(phoneNumberId, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: interactivePayload,
  }, apiKey)
}

export async function sendTemplate(
  phoneNumberId: string,
  to: string,
  templatePayload: { name: string; language: { code: string }; components?: Record<string, unknown>[] },
  apiKey?: string
) {
  return apiPost(phoneNumberId, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: templatePayload,
  }, apiKey)
}

export async function sendReaction(
  phoneNumberId: string,
  to: string,
  messageId: string,
  emoji: string
) {
  return apiPost(phoneNumberId, {
    messaging_product: 'whatsapp',
    to,
    type: 'reaction',
    reaction: { message_id: messageId, emoji },
  })
}

export async function markAsRead(phoneNumberId: string, messageId: string) {
  return apiPost(phoneNumberId, {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  })
}
