import { describe, it, expect, vi, afterEach } from 'vitest'
import type { FastifyRequest } from 'fastify'
import { issueWidgetToken, assertPublicAccess } from './access.js'

afterEach(() => {
  vi.unstubAllEnvs()
})

function fakeRequest(headers: Record<string, string>): FastifyRequest {
  return { headers } as unknown as FastifyRequest
}

describe('assertPublicAccess origin rules', () => {
  it('allows a request from an allowed origin', () => {
    expect(() =>
      assertPublicAccess(fakeRequest({ origin: 'https://shop.example.com' }), ['shop.example.com']),
    ).not.toThrow()
  })

  it('rejects a request from a disallowed origin', () => {
    expect(() =>
      assertPublicAccess(fakeRequest({ origin: 'https://evil.com' }), ['shop.example.com']),
    ).toThrow()
  })

  it('rejects a request with no Origin and no signed token in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => assertPublicAccess(fakeRequest({}), ['shop.example.com'])).toThrow()
  })

  it('allows a request with no Origin outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(() => assertPublicAccess(fakeRequest({}), ['shop.example.com'])).not.toThrow()
  })

  it('accepts a signed token for an allowed host even with no Origin', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WIDGET_TOKEN_SECRET', 'test-secret')
    const token = issueWidgetToken('key-1', 'shop.example.com')
    expect(() =>
      assertPublicAccess(fakeRequest({ 'x-widget-token': token }), ['shop.example.com'], 'key-1'),
    ).not.toThrow()
  })

  it('rejects a signed token issued for a different host', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WIDGET_TOKEN_SECRET', 'test-secret')
    const token = issueWidgetToken('key-1', 'evil.com')
    expect(() =>
      assertPublicAccess(fakeRequest({ 'x-widget-token': token }), ['shop.example.com'], 'key-1'),
    ).toThrow()
  })

  it('rejects a signed token minted for another widget', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WIDGET_TOKEN_SECRET', 'test-secret')
    const token = issueWidgetToken('other-key', 'shop.example.com')
    expect(() =>
      assertPublicAccess(fakeRequest({ 'x-widget-token': token }), ['shop.example.com'], 'key-1'),
    ).toThrow()
  })
})
