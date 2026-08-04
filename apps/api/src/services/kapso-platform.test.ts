import { describe, expect, it } from 'vitest'
import crypto from 'node:crypto'
import { verifyWebhookSignature } from './kapso-platform.js'

const secret = 'test-secret-123'
const payload = JSON.stringify({ event: 'whatsapp.message.received', message: { text: 'hi' } })

describe('verifyWebhookSignature', () => {
  it('accepts a valid HMAC-SHA256 signature over the raw payload', () => {
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true)
  })

  it('rejects a tampered payload', () => {
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload + ' ', signature, secret)).toBe(false)
  })

  it('rejects a wrong secret', () => {
    const signature = crypto.createHmac('sha256', 'other-secret').update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(false)
  })

  it('rejects a non-hex garbage signature', () => {
    expect(verifyWebhookSignature(payload, 'not-a-valid-signature!', secret)).toBe(false)
  })
})
