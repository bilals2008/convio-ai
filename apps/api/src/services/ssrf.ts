import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'

// Shared SSRF guard for all outbound fetches (tools, MCP, KB ingestion).
// ponytail: single-pass IP check; add a DNS-rebinding resolver loop if you harden further.
export function isBlockedAddress(address: string): boolean {
  if (isIP(address) === 0) return false
  if (address.includes(':')) {
    // IPv6: block loopback, link-local, and ULA
    const lower = address.toLowerCase()
    return (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc00:') ||
      lower.startsWith('fd00:') ||
      lower.startsWith('ff00:') ||
      lower.startsWith('::ffff:10.') ||
      lower.startsWith('::ffff:127.') ||
      lower.startsWith('::ffff:169.254')
    )
  }
  const parts = address.split('.').map(Number)
  const [a, b] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast + reserved
  )
}

export async function assertSafeUrl(rawUrl: string): Promise<void> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are supported')
  }
  const { address } = await lookup(url.hostname)
  if (isBlockedAddress(address)) {
    throw new Error('URL points to a blocked/internal address')
  }
}

/**
 * Fetch a URL with SSRF protection on every redirect hop.
 * Rejects instead of returning, so callers can map the error to their shape.
 */
export async function safeFetchText(
  rawUrl: string,
  init: RequestInit = {},
  maxRedirects = 5,
  timeoutMs = 20_000,
): Promise<{ url: string; status: number; contentType: string; text: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let currentUrl = rawUrl
    for (let i = 0; i < maxRedirects; i++) {
      await assertSafeUrl(currentUrl)
      const res = await fetch(currentUrl, {
        ...init,
        signal: controller.signal,
        redirect: 'manual',
      })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) throw new Error(`Redirect without Location header (${res.status})`)
        currentUrl = new URL(location, currentUrl).toString()
        res.body?.cancel()
        continue
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch URL (${res.status})`)
      }

      const text = await res.text()
      return {
        url: currentUrl,
        status: res.status,
        contentType: res.headers.get('content-type') || '',
        text,
      }
    }
    throw new Error('Too many redirects')
  } finally {
    clearTimeout(timeout)
  }
}