import { describe, expect, it } from 'vitest'
import { resolveFrontendUrl } from './app-url.js'

describe('resolveFrontendUrl', () => {
  it('prefers the configured WEB_URL', () => {
    expect(
      resolveFrontendUrl({
        NODE_ENV: 'production',
        WEB_URL: 'https://app.convio.ai',
        CORS_ORIGIN: 'https://other.convio.ai',
      }),
    ).toBe('https://app.convio.ai')
  })

  it('drops a trailing path and keeps only the origin', () => {
    expect(
      resolveFrontendUrl({ NODE_ENV: 'production', WEB_URL: 'https://app.convio.ai/settings' }),
    ).toBe('https://app.convio.ai')
  })

  it('never returns localhost in production', () => {
    expect(
      resolveFrontendUrl({ NODE_ENV: 'production', WEB_URL: 'http://localhost:5173' }),
    ).toBeNull()
  })

  it('skips a localhost WEB_URL in production and falls back to the CORS origin', () => {
    expect(
      resolveFrontendUrl({
        NODE_ENV: 'production',
        WEB_URL: 'http://localhost:5173',
        CORS_ORIGIN: 'https://app.convio.ai',
      }),
    ).toBe('https://app.convio.ai')
  })

  it('uses the request origin when it is allowlisted', () => {
    expect(
      resolveFrontendUrl(
        { NODE_ENV: 'production', CORS_ORIGIN: 'https://staging.convio.ai, https://app.convio.ai' },
        'https://app.convio.ai',
      ),
    ).toBe('https://app.convio.ai')
  })

  it('ignores a request origin that is not allowlisted', () => {
    expect(
      resolveFrontendUrl(
        { NODE_ENV: 'production', CORS_ORIGIN: 'https://app.convio.ai' },
        'https://evil.example.com',
      ),
    ).toBe('https://app.convio.ai')
  })

  it('allows localhost in development', () => {
    expect(
      resolveFrontendUrl({ NODE_ENV: 'development', WEB_URL: 'http://localhost:5173' }),
    ).toBe('http://localhost:5173')
  })

  it('returns null for missing or malformed config', () => {
    expect(resolveFrontendUrl({ NODE_ENV: 'production' })).toBeNull()
    expect(resolveFrontendUrl({ NODE_ENV: 'production', WEB_URL: 'not-a-url' })).toBeNull()
    expect(resolveFrontendUrl({ NODE_ENV: 'production', WEB_URL: 'javascript:alert(1)' })).toBeNull()
  })
})
