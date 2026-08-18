import type { FastifyRequest } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'

// Resolve the requesting domain. For widget embeds the iframe runs on our own
// origin, so the real host is passed by the embed parent via the X-Widget-Host
// header; Origin is the fallback for direct browser calls.
export function getRequestDomain(request: FastifyRequest): string | null {
  const host = request.headers['x-widget-host']
  if (typeof host === 'string' && host.trim()) return host.trim().toLowerCase()

  const origin = request.headers.origin
  if (!origin) return null
  try {
    return new URL(origin).host.toLowerCase()
  } catch {
    return null
  }
}

export function assertPublicAccess(request: FastifyRequest, allowedDomains: string[], preview = false) {
  if (preview) return
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
