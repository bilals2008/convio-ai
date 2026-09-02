import type { FastifyInstance } from 'fastify'
import { prisma, Prisma } from '@convio/database'
import { z } from 'zod'
import { AppError } from '../../plugins/error.js'
import { validate } from '../../plugins/validate.js'
import { McpClient } from '../../services/mcp/index.js'
import {
  DbOAuthClientProvider,
  findMcpServerByOAuthState,
} from '../../services/mcp/oauth-provider.js'

const mcpParamsSchema = z.object({ id: z.string().uuid() })

function frontendUrl(fastify: FastifyInstance): string {
  return fastify.config.CORS_ORIGIN.split(',')[0].trim()
}

export default async function mcpOauthRoutes(fastify: FastifyInstance) {
  const callbackBaseUrl = fastify.config.PUBLIC_URL

  // POST /api/mcp-servers/:id/authorize — Start OAuth authorization flow
  // Pass `force: true` in body to force re-auth (revokes current tokens first).
  fastify.post('/mcp-servers/:id/authorize', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = (request.body ?? {}) as { force?: boolean }
    const server = await prisma.mcpServer.findUnique({ where: { id } })
    if (!server) throw new AppError(404, 'MCP server not found')
    await fastify.ensureAdmin(request.userId!, server.organizationId)
    if (server.type !== 'streamable-http' || !server.url) {
      throw new AppError(400, 'OAuth requires a streamable HTTP server with a URL')
    }
    if (server.authType !== 'oauth') {
      throw new AppError(400, 'This server is not configured for OAuth')
    }

    const provider = new DbOAuthClientProvider(server.id, callbackBaseUrl, fastify.config.MCP_OAUTH_ENCRYPTION_KEY, {
      clientId: server.clientId || undefined,
      clientSecret: server.clientSecret || undefined,
    })
    if (body.force) {
      await provider.invalidateCredentials('tokens')
    }

    await fastify.auditLog({
      organizationId: server.organizationId,
      actorId: request.userId,
      action: 'mcp_oauth.connected',
      entityType: 'mcp_server',
      entityId: server.id,
      metadata: { event: 'oauth.authorize_started', force: body.force ?? false },
    })

    const client = new McpClient({
      id: server.id,
      name: server.name,
      type: server.type,
      url: server.url,
      authProvider: provider,
    })

    try {
      await client.connect()
      await client.disconnect().catch(() => {})
      return { data: { status: 'authorized' } }
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('does not support dynamic client registration')) {
        throw new AppError(400, 'This OAuth server does not support dynamic client registration. Register a client in your auth provider\'s dashboard and enter the Client ID and Client Secret in the server settings.')
      }
      const url = client.authorizationUrl
      if (err instanceof Error && /[Uu]nauthorized/.test(err.message) && url) {
        return { data: { status: 'redirect', redirectUrl: url } }
      }
      throw err
    }
  })

  // GET /api/mcp/oauth/callback — OAuth provider redirects here after user consent
  fastify.get('/mcp/oauth/callback', {}, async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string; error_description?: string }
    const feBase = frontendUrl(fastify)

    if (query.error || !query.code || !query.state) {
      return reply.redirect(
        `${feBase}/settings/mcp-servers?oauth=error&reason=${encodeURIComponent(query.error_description || query.error || 'missing_params')}`
      )
    }

    const server = await findMcpServerByOAuthState(query.state)
    if (!server) {
      return reply.redirect(`${feBase}/settings/mcp-servers?oauth=error&reason=unknown_state`)
    }

    const provider = new DbOAuthClientProvider(server.id, callbackBaseUrl, fastify.config.MCP_OAUTH_ENCRYPTION_KEY, {
      clientId: server.clientId || undefined,
      clientSecret: server.clientSecret || undefined,
    })
    const client = new McpClient({
      id: server.id,
      name: server.name,
      type: server.type,
      url: server.url,
      authProvider: provider,
    })

    try {
      client.createTransport()
      await client.finishAuth(query.code)
      await client.disconnect().catch(() => {})
      await fastify.auditLog({
        organizationId: server.organizationId,
        actorId: request.userId ?? undefined,
        action: 'mcp_oauth.connected',
        entityType: 'mcp_server',
        entityId: server.id,
        metadata: { event: 'oauth.callback_success' },
      }).catch(() => {})
      return reply.redirect(`${feBase}/settings/mcp-servers?oauth=success`)
    } catch (err) {
      const message = (err as Error).message
      // If the SDK couldn't parse the token response, try a direct fetch to surface the real error
      if (message.includes('access_token') && server.clientId) {
        try {
          const tokenBody = new URLSearchParams({
            client_id: server.clientId,
            client_secret: server.clientSecret || '',
            code: query.code || '',
            grant_type: 'authorization_code',
            redirect_uri: `${callbackBaseUrl.replace(/\/$/, '')}/api/mcp/oauth/callback`,
          }).toString()
          // GitHub's OpenID discovery returns a stale token_endpoint (/access_token) that returns 404.
          // Try both known endpoints to surface a useful error.
          const tokenUrls = [
            'https://github.com/login/oauth/access_token',
            'https://github.com/login/oauth/token',
          ]
          for (const tokenUrl of tokenUrls) {
            const tokenRes = await fetch(tokenUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
              body: tokenBody,
            })
            const tokenText = await tokenRes.text()
            if (!tokenRes.ok || !tokenText.startsWith('{')) {
              throw new Error(`Token endpoint ${tokenUrl} returned HTTP ${tokenRes.status} (not JSON)`)
            }
            const parsed = JSON.parse(tokenText)
            throw new Error(`${message}\n\nGitHub OAuth error: ${parsed.error || 'unknown'} — ${parsed.error_description || tokenText.slice(0, 300)}`)
          }
        } catch (e) {
          if (e instanceof Error && (e as Error).message.includes('GitHub OAuth error')) throw e
          // re-throw original
        }
      }
      await provider.saveError(message).catch(() => {})
      await fastify.auditLog({
        organizationId: server.organizationId,
        actorId: request.userId ?? undefined,
        action: 'mcp_oauth.failed',
        entityType: 'mcp_server',
        entityId: server.id,
        metadata: { event: 'oauth.callback_failed', error: message },
      }).catch(() => {})
      await provider.invalidateCredentials('all').catch(() => {})
      return reply.redirect(
        `${feBase}/settings/mcp-servers?oauth=error&reason=${encodeURIComponent(message)}`
      )
    }
  })

  // POST /api/mcp-servers/:id/disconnect — Revoke OAuth tokens
  fastify.post('/mcp-servers/:id/disconnect', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const server = await prisma.mcpServer.findUnique({ where: { id } })
    if (!server) throw new AppError(404, 'MCP server not found')
    await fastify.ensureAdmin(request.userId!, server.organizationId)

    await prisma.mcpServer.update({
      where: { id },
      data: { oauthState: Prisma.DbNull },
    })
    await fastify.auditLog({
      organizationId: server.organizationId,
      actorId: request.userId,
      action: 'mcp_oauth.disconnected',
      entityType: 'mcp_server',
      entityId: server.id,
      metadata: { event: 'oauth.disconnect' },
    }).catch(() => {})
    return { data: null }
  })

  // GET /api/mcp-servers/:id/oauth-status — Token status (authorized / not)
  fastify.get('/mcp-servers/:id/oauth-status', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const server = await prisma.mcpServer.findUnique({ where: { id } })
    if (!server) throw new AppError(404, 'MCP server not found')
    await fastify.getMembership(request.userId!, server.organizationId)

    const provider = new DbOAuthClientProvider(server.id, callbackBaseUrl, fastify.config.MCP_OAUTH_ENCRYPTION_KEY, {
      clientId: server.clientId || undefined,
      clientSecret: server.clientSecret || undefined,
    })
    const status = await provider.status().catch(() => ({ authorized: false, hasRefreshToken: false, tokenExpiresAt: undefined, lastError: undefined }))

    return {
      data: {
        authorized: status.authorized,
        hasRefreshToken: status.hasRefreshToken,
        tokenExpiresAt: status.tokenExpiresAt ?? null,
        lastError: status.lastError ?? null,
      },
    }
  })
}
