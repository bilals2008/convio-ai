const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

export interface FrontendUrlConfig {
  NODE_ENV?: string
  WEB_URL?: string
  CORS_ORIGIN?: string
}

function parseOrigin(value: string | null | undefined): URL | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function isLocalhost(url: URL): boolean {
  return LOCAL_HOSTNAMES.has(url.hostname)
}

function corsOrigins(config: FrontendUrlConfig): string[] {
  return (config.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/**
 * Resolves the browser-facing dashboard origin, used where the customer's browser is sent
 * back to the app (Creem checkout success URLs).
 *
 * `APP_URL` from `@convio/config` reads frontend-only vars (`VITE_APP_URL` /
 * `NEXT_PUBLIC_APP_URL`) that are not set on the API host, so it silently degrades to
 * `http://localhost:5173` — which sends paying customers to their own machine after payment.
 * This prefers the API's own `WEB_URL`, then the origin the request actually came from
 * (validated against the CORS allowlist).
 *
 * Localhost candidates are ignored in production: the redirect is followed in the customer's
 * browser, so it has to be publicly reachable. Returns null when nothing usable is
 * configured, letting the caller fall back rather than emit a localhost URL.
 */
export function resolveFrontendUrl(
  config: FrontendUrlConfig,
  requestOrigin?: string,
): string | null {
  const allowed = corsOrigins(config)
  const candidates = [
    config.WEB_URL,
    requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : null,
    allowed[0],
  ]

  for (const candidate of candidates) {
    const url = parseOrigin(candidate)
    if (!url) continue
    if (config.NODE_ENV === 'production' && isLocalhost(url)) continue
    return url.origin
  }

  return null
}
