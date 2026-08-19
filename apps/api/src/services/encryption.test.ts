import { describe, expect, it } from 'vitest'
import { encryptSecret, decryptSecret, getEncryptionKey } from './encryption.js'

process.env.ENCRYPTION_KEY = 'test-key-derived-via-sha256-of-a-test-value'
const key = getEncryptionKey()!

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