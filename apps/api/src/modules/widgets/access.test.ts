import { describe, it, expect, vi, afterEach } from 'vitest'
import { issueWidgetToken, verifyWidgetToken } from './access.js'

afterEach(() => vi.useRealTimers())

describe('widget tokens', () => {
  it('roundtrips a valid token', () => {
    const token = issueWidgetToken('key-123', 'example.com')
    expect(verifyWidgetToken(token)).toEqual({ publicKey: 'key-123', host: 'example.com' })
  })

  it('rejects an expired token', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const token = issueWidgetToken('key-123', 'example.com')
    vi.setSystemTime(new Date('2026-01-01T00:10:01Z'))
    expect(verifyWidgetToken(token)).toBeNull()
  })

  it('rejects a tampered payload', () => {
    const token = issueWidgetToken('key-123', 'example.com')
    const [, signature] = token.split('.')
    const tampered = Buffer.from(JSON.stringify({ publicKey: 'key-123', host: 'evil.com', exp: Date.now() + 60000 })).toString('base64url')
    expect(verifyWidgetToken(`${tampered}.${signature}`)).toBeNull()
  })

  it('rejects garbage input', () => {
    expect(verifyWidgetToken('not-a-token')).toBeNull()
    expect(verifyWidgetToken('')).toBeNull()
  })
})