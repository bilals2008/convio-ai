import type { FastifyRequest } from 'fastify'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'

const TOKEN_TTL_MS = 10 * 60 * 1000

// Signed domain tokens close the hole where X-Widget-Host (a client-set header)
// is trivially spoofable. widget.js runs on the customer's page, so its fetch
// to the token endpoint carries a browser-set Origin header that cannot be
// forged. The server signs { publicKey, host, exp } and public endpoints trust
// the signed host instead of the header. Fallback to the legacy header stays
// for direct API callers (documented public API, previews without widget.js).
function tokenSecret(): string {
  // ponytail: dev fallback; set WIDGET_TOKEN_SECRET in production (see .env.example)
  return process.env.WIDGET_TOKEN_SECRET || 'dev-widget-token-secret'
}

export function issueWidgetToken(publicKey: string, host: string): string {
  const payload = Buffer.from(JSON.stringify({ publicKey, host, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url')
  const signature = createHmac('sha256', tokenSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyWidgetToken(token: string): { publicKey: string; host: string } | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  const expected = Buffer.from(createHmac('sha256', tokenSecret()).update(payload).digest('base64url'))
  const actual = Buffer.from(signature)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      publicKey?: string
      host?: string
      exp?: number
    }
    if (!data.publicKey || !data.host || typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return { publicKey: data.publicKey, host: data.host }
  } catch {
    return null
  }
}

// Resolve the requesting domain. For widget embeds the iframe runs on our own
// origin, so the real host is passed by the embed parent via the X-Widget-Host
// header; Origin is the fallback for direct browser calls.
export function getRequestDomain(request: FastifyRequest): string | null {
  const host = request.headers['x-widget-host']
  if (typeof host === 'string' && host.trim()) return host.trim().toLowerCase()
  return getRequestOriginHost(request)
}

export function getRequestOriginHost(request: FastifyRequest): string | null {
  const origin = request.headers.origin
  if (!origin) return null
  try {
    return new URL(origin).host.toLowerCase()
  } catch {
    return null
  }
}

export function assertPublicAccess(
  request: FastifyRequest,
  allowedDomains: string[],
  publicKey?: string,
  preview = false,
) {
  if (preview) return

  const token = request.headers['x-widget-token']
  if (typeof token === 'string' && token) {
    const verified = verifyWidgetToken(token)
    if (!verified || (publicKey && verified.publicKey !== publicKey)) {
      throw new AppError(403, 'Invalid or expired widget token', 'FORBIDDEN')
    }
    if (allowedDomains.length > 0 && !allowedDomains.includes(verified.host)) {
      throw new AppError(403, 'This widget is not allowed on this domain')
    }
    return
  }

  const domain = getRequestDomain(request)
  if (allowedDomains.length === 0 || !domain || allowedDomains.includes(domain)) return
  throw new AppError(403, 'This widget is not allowed on this domain')
}

// Union of allowedDomains across an agent's non-archived widgets. Used to
// enforce the same domain check on the agent-keyed widget endpoints that don't
// carry a publicKey. Returns null when the agent has no widget at all (in which
// case the caller should reject — a widget conversation requires a widget).
export async function getAgentWidgetDomains(agentId: string): Promise<string[] | null> {
  const widgets = await prisma.widget.findMany({
    where: { agentId, status: { not: 'archived' } },
    select: { allowedDomains: true },
  })
  if (widgets.length === 0) return null
  return [...new Set(widgets.flatMap((w) => w.allowedDomains ?? []))]
}

export async function requirePreviewAuth(
  fastify: { getMembership: (userId: string, orgId: string) => Promise<unknown> },
  request: FastifyRequest,
  organizationId: string,
) {
  if (!request.userId) throw new AppError(401, 'Authentication required for widget preview', 'UNAUTHORIZED')
  await fastify.getMembership(request.userId, organizationId)
}
