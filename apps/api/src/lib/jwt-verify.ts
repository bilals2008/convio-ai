import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

/**
 * Verifies Supabase access tokens locally against the project's JWKS instead of
 * calling Supabase Auth on every request.
 *
 * This is a pure validation module: it never mutates state and returns `null`
 * for any token it cannot fully verify. Callers must treat `null` as
 * unauthenticated — never fall back to a weaker check.
 */

export interface SupabaseClaims extends JWTPayload {
  sub: string
  email?: string
  session_id?: string
  role?: string
  aal?: 'aal1' | 'aal2'
  is_anonymous?: boolean
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}

// Asymmetric only. A local verifier must never accept HS256, otherwise an
// attacker could sign a token with the project's public key as the shared
// secret (the classic algorithm-confusion attack).
const ALLOWED_ALGORITHMS = ['ES256', 'RS256']

// Matches Supabase's own edge cache for the JWKS endpoint. The docs are
// explicit that this must not be raised: a longer cache delays key rotation
// and revocation, causing valid tokens to be rejected or revoked keys to be
// trusted for longer than intended.
const JWKS_CACHE_MS = 10 * 60 * 1000

// How long a probe result (asymmetric vs. legacy shared secret) is trusted.
// Re-probing means flipping the dashboard to asymmetric keys takes effect
// without a redeploy.
const PROBE_CACHE_MS = 10 * 60 * 1000
const PROBE_TIMEOUT_MS = 5000

const COOLDOWN_MS = 30 * 1000

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
let probeCache: { value: boolean; expiresAt: number } | null = null
let probeInflight: Promise<boolean> | null = null

function projectUrl(): string | null {
  const url = process.env.SUPABASE_URL
  return url ? url.replace(/\/+$/, '') : null
}

function issuer(): string | null {
  const url = projectUrl()
  return url ? `${url}/auth/v1` : null
}

function getJwks(iss: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${iss}/.well-known/jwks.json`), {
      cacheMaxAge: JWKS_CACHE_MS,
      cooldownDuration: COOLDOWN_MS,
    })
  }
  return jwks
}

async function probeAsymmetric(iss: string): Promise<boolean> {
  try {
    const res = await fetch(`${iss}/.well-known/jwks.json`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    })
    if (!res.ok) return false

    const body = (await res.json()) as { keys?: unknown }
    return Array.isArray(body.keys) && body.keys.length > 0
  } catch {
    // A failed probe degrades to the Auth-server path, which stays correct —
    // just slower. Never treat "unknown" as "verify locally".
    return false
  }
}

/**
 * Whether the project has asymmetric JWT signing keys configured.
 *
 * `false` means the project still uses the legacy shared secret (HS256), or the
 * probe could not reach Supabase — in both cases callers must verify with the
 * Auth server instead.
 */
export async function isAsymmetricMode(): Promise<boolean> {
  const iss = issuer()
  if (!iss) return false

  const now = Date.now()
  if (probeCache && probeCache.expiresAt > now) return probeCache.value

  // Collapse concurrent probes so a burst of requests triggers one fetch.
  if (!probeInflight) {
    probeInflight = probeAsymmetric(iss)
      .then((value) => {
        probeCache = { value, expiresAt: Date.now() + PROBE_CACHE_MS }
        return value
      })
      .finally(() => {
        probeInflight = null
      })
  }

  return probeInflight
}

/**
 * Verifies a Supabase access token against the project JWKS.
 *
 * Returns the claims on success, `null` on any failure. The signature is
 * checked against an explicit algorithm allowlist, and the issuer and audience
 * are asserted so a token minted for another audience cannot be replayed.
 */
export async function verifySupabaseJwt(token: string): Promise<SupabaseClaims | null> {
  const iss = issuer()
  if (!iss) return null

  try {
    const { payload } = await jwtVerify(token, getJwks(iss), {
      issuer: iss,
      audience: 'authenticated',
      algorithms: ALLOWED_ALGORITHMS,
    })

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) return null

    return payload as SupabaseClaims
  } catch {
    return null
  }
}
