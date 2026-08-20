import { describe, it, expect } from 'vitest'
import { isBlockedAddress, assertSafeUrl } from './processor.js'

describe('isBlockedAddress (SSRF guard)', () => {
  it('blocks private and loopback IPv4 ranges', () => {
    expect(isBlockedAddress('10.0.0.1')).toBe(true)
    expect(isBlockedAddress('127.0.0.1')).toBe(true)
    expect(isBlockedAddress('169.254.169.254')).toBe(true)
    expect(isBlockedAddress('172.16.0.1')).toBe(true)
    expect(isBlockedAddress('192.168.1.1')).toBe(true)
    expect(isBlockedAddress('100.64.0.1')).toBe(true)
  })

  it('allows public IPv4 addresses', () => {
    expect(isBlockedAddress('8.8.8.8')).toBe(false)
    expect(isBlockedAddress('1.1.1.1')).toBe(false)
    expect(isBlockedAddress('142.250.190.46')).toBe(false)
  })

  it('blocks IPv6 loopback, link-local, and ULA', () => {
    expect(isBlockedAddress('::1')).toBe(true)
    expect(isBlockedAddress('fe80::1')).toBe(true)
    expect(isBlockedAddress('fd00::1')).toBe(true)
  })
})

describe('assertSafeUrl', () => {
  it('rejects non-http protocols', async () => {
    await expect(assertSafeUrl('file:///etc/passwd')).rejects.toThrow('Only http(s)')
  })

  it('rejects internal hostnames via DNS resolution', async () => {
    await expect(assertSafeUrl('http://localhost:3000')).rejects.toThrow('blocked')
  })

  it('accepts public https URLs', async () => {
    await expect(assertSafeUrl('https://example.com')).resolves.toBeUndefined()
  })
})
