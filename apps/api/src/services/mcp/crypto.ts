import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * AES-256-GCM encryption for sensitive OAuth tokens at rest.
 * Falls back to plaintext (base64 passthrough) when MCP_OAUTH_ENCRYPTION_KEY is not set.
 */
export function getEncryptionKey(envKey?: string): Buffer | null {
  if (!envKey) return null
  return createHash('sha256').update(envKey).digest()
}

export function encryptJson(value: unknown, key: Buffer | null): string {
  if (!key) return JSON.stringify(value)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: tag.toString('base64'), data: encrypted.toString('base64') })
}

export function decryptJson<T = unknown>(payload: string, key: Buffer | null): T {
  if (!key) return JSON.parse(payload) as T
  const parsed = JSON.parse(payload) as { v?: number; iv: string; tag: string; data: string }
  if (parsed.v !== 1) throw new Error('Unsupported encrypted payload version')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()])
  return JSON.parse(decrypted.toString('utf8')) as T
}
