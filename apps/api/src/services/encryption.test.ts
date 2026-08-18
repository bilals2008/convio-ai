import { describe, expect, it } from 'vitest'
import { encryptSecret, decryptSecret } from './encryption.js'

const key = Buffer.from('test-key-derived-via-sha256-of-a-test-value', 'utf8')

describe('encryption', () => {
  it('round-trips a secret and never stores it in plaintext', () => {
    const secret = 'sk-test-provider-key-1234567890'
    const encrypted = encryptSecret(secret, key)
    expect(encrypted).not.toContain('sk-test-provider-key')
    expect(encrypted).toContain('"v":1')
    expect(decryptSecret(encrypted, key)).toBe(secret)
  })

  it('returns legacy plaintext rows unchanged', () => {
    expect(decryptSecret('sk-legacy-plaintext-key', key)).toBe('sk-legacy-plaintext-key')
  })
})