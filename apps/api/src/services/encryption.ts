import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

// AES-256-GCM encryption for provider API keys at rest.
// ponytail: plaintext fallback when ENCRYPTION_KEY is unset keeps local dev
// simple, but keys stay readable — set ENCRYPTION_KEY in production.
const ALGO = 'aes-256-gcm'

export function getEncryptionKey(): Buffer | null {
  const envKey = process.env.ENCRYPTION_KEY
  if (!envKey) return null
  return createHash('sha256').update(envKey).digest()
}

export function encryptSecret(value: string, key: Buffer | null): string {
  if (!key) return value
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: tag.toString('base64'), data: encrypted.toString('base64') })
}

export function decryptSecret(payload: string, key: Buffer | null): string {
  if (!key) return payload
  try {
    const parsed = JSON.parse(payload) as { v?: number; iv: string; tag: string; data: string }
    if (parsed.v !== 1) return payload
    const decipher = createDecipheriv(ALGO, key, Buffer.from(parsed.iv, 'base64'))
    decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'))
    const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    return payload
  }
}