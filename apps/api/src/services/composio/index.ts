import { Composio, SessionPreset } from '@composio/core'
import { VercelProvider } from '@composio/vercel'
import { prisma } from '@convio/database'
import { decryptSecret, getEncryptionKey } from '../encryption.js'

export interface ComposioTool {
  /** Real Composio slug, e.g. GITHUB_LIST_STARGAZERS — used for execution. */
  slug: string
  /** Toolkit slug this tool belongs to, e.g. github */
  toolkit: string
  /** Safe name exposed to the LLM (OpenAI-style ^[a-zA-Z0-9_-]+$) */
  name: string
  description: string
  parameters: Record<string, unknown>
}

export class ComposioAuthError extends Error {
  public originalError: Error
  constructor(message: string, originalError: Error) {
    super(message)
    this.name = 'ComposioAuthError'
    this.originalError = originalError
  }
}

/**
 * One Composio client per org API key. The SDK client is stateless w.r.t.
 * sessions, so caching per key is safe and avoids re-handshakes.
 */
const clientCache = new Map<string, InstanceType<typeof Composio>>()

export function createComposioClient(apiKey: string) {
  const existing = clientCache.get(apiKey)
  if (existing) return existing
  const client = new Composio({ apiKey, provider: new VercelProvider() })
  clientCache.set(apiKey, client)
  return client
}

/** Load + decrypt the org's Composio config, or null when not configured. */
export async function loadComposioOrgConfig(orgId: string) {
  const config = await prisma.composioConfig.findUnique({
    where: { organizationId: orgId },
  })
  if (!config?.apiKey) return null

  const encryptionKey = getEncryptionKey()
  const apiKey = decryptSecret(config.apiKey, encryptionKey)
  return { apiKey, enabledToolkits: config.enabledToolkits, sessionId: config.composioSessionId ?? undefined }
}

/**
 * Create (or reuse) a Composio session for a user.
 * Sessions are cheap to reuse and hold the toolkit filters + connected accounts.
 */
export async function getOrCreateSession(
  client: ReturnType<typeof createComposioClient>,
  userId: string,
  toolkits: string[],
  existingSessionId?: string
) {
  if (existingSessionId) {
    try {
      const session = await client.use(existingSessionId)
      return session
    } catch {
      // Session expired/unknown — fall through and create a fresh one.
    }
  }

  // DIRECT_TOOLS preset preloads the filtered toolkits' tools directly into
  // session.tools() and disables Composio's meta tools. The default preset
  // only exposes meta tools (COMPOSIO_SEARCH_TOOLS etc.) which a custom agent
  // loop never calls — resulting in zero usable tools for the LLM.
  return client.create(
    userId,
    toolkits.length > 0
      ? { toolkits, sessionPreset: SessionPreset.DIRECT_TOOLS }
      : { sessionPreset: SessionPreset.DIRECT_TOOLS },
  )
}

/**
 * Map an LLM-visible tool name back to its real Composio slug.
 * Names are generated as `composio_<SLUG_lowercase_sanitized>`; the slug is
 * recoverable by uppercasing the remainder, which is exactly how Composio
 * slugs are formatted.
 */
export function composioSlugFromName(name: string): string | null {
  if (!name.startsWith('composio_')) return null
  const slug = name.slice('composio_'.length).toUpperCase()
  return slug || null
}

function sanitizeToolName(slug: string): string {
  const name = `composio_${slug.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`
  return name.slice(0, 64)
}

/**
 * List the tools a session exposes and format them for our ToolHandler shape.
 * The VercelProvider formats `session.tools()` as a Record keyed by tool slug
 * (values carry description/inputParameters for the AI SDK tool). Meta tools
 * (COMPOSIO_*) are excluded — they only make sense inside Composio's runtime.
 */
export async function getSessionTools(session: {
  tools: () => Promise<unknown>
  execute: (slug: string, args: Record<string, unknown>) => Promise<unknown>
}): Promise<ComposioTool[]> {
  const raw = (await session.tools()) as unknown

  const normalize = (slug: string, tool: Record<string, unknown>): ComposioTool | null => {
    if (!slug || slug.startsWith('COMPOSIO_')) return null
    const toolkit = (
      (tool.toolkit as { slug?: string } | undefined)?.slug ||
      (tool.meta as { toolkit?: string } | undefined)?.toolkit ||
      slug.split('_')[0].toLowerCase()
    ).toLowerCase()
    const parameters =
      (tool.inputParameters as Record<string, unknown> | undefined) ??
      (tool.parameters as Record<string, unknown> | undefined) ??
      { type: 'object', properties: {} }
    return {
      slug,
      toolkit,
      name: sanitizeToolName(slug),
      description: (tool.description as string) || `Composio tool ${slug}`,
      parameters,
    }
  }

  if (Array.isArray(raw)) {
    return raw
      .map((tool) => {
        const t = tool as Record<string, unknown>
        return normalize((t.slug as string) || '', t)
      })
      .filter((t): t is ComposioTool => t !== null)
  }

  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .map(([slug, tool]) => normalize(slug, (tool ?? {}) as Record<string, unknown>))
      .filter((t): t is ComposioTool => t !== null)
  }

  return []
}

/**
 * Errors that genuinely mean the toolkit's connection is missing/revoked.
 * Deliberately narrow — a bare "connect" or "auth" appears in unrelated
 * tool failures (invalid page IDs, permissions, network hiccups) and would
 * make the agent falsely claim the integration isn't set up.
 */
const AUTH_ERROR_PATTERN =
  /\b(401|403)\b|unauthorized|not connected|no connected account|connected account (not|isn't|is not)|authentication required|re-?connect/i

/** Execute a Composio tool through its session. */
export async function executeComposioTool(
  session: {
    execute: (slug: string, args: Record<string, unknown>) => Promise<unknown>
  },
  slug: string,
  args: Record<string, unknown>
): Promise<unknown> {
  try {
    const result = (await session.execute(slug, args)) as { data?: unknown; error?: string | null }
    if (result && typeof result === 'object' && 'data' in result && 'error' in result) {
      if (result.error) {
        const message = String(result.error)
        // Auth failures get the special error so the adapter can hint at reconnecting;
        // everything else keeps its REAL message so the LLM sees what actually failed.
        if (AUTH_ERROR_PATTERN.test(message)) throw new ComposioAuthError(message, new Error(message))
        throw new Error(message)
      }
      return result.data
    }
    return result
  } catch (error) {
    if (error instanceof ComposioAuthError) throw error
    const message = error instanceof Error ? error.message : String(error)
    if (AUTH_ERROR_PATTERN.test(message)) {
      throw new ComposioAuthError(message, new Error(message))
    }
    throw error
  }
}

/**
 * Start a connection for a toolkit and return the Connect Link.
 * Composio-managed auth: the user completes OAuth on the hosted page.
 */
export async function getToolkitConnectLink(
  session: {
    authorize: (toolkit: string, options?: { callbackUrl?: string }) => Promise<{ redirectUrl?: string | null }>
  },
  toolkit: string,
  callbackUrl?: string
): Promise<string | null> {
  const request = await session.authorize(toolkit, callbackUrl ? { callbackUrl } : undefined)
  return request.redirectUrl ?? null
}
