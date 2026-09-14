import { prisma } from '@convio/database'
import {
  createComposioClient,
  loadComposioOrgConfig,
  getOrCreateSession,
  getSessionTools,
} from './index.js'
import { adaptComposioTools } from './tool-adapter.js'
import type { ToolHandler } from '../tools/index.js'

/**
 * Coming Soon launch gate — the whole Composio integration is built but not
 * launched. When false, NO Composio tools are ever loaded/executed anywhere
 * (agent stream, playground, widgets/messages), regardless of saved config.
 * Flip to true to launch; nothing else changes.
 */
export const COMPOSIO_LAUNCH_ENABLED = false

export interface LoadComposioHandlersOptions {
  orgId: string
  /**
   * Toolkit slugs the agent requested (from widgetConfig.composioToolkits).
   * When empty, falls back to the org's enabled toolkits.
   */
  requestedToolkits?: string[]
}

export interface LoadComposioHandlersResult {
  handlers: ToolHandler[]
  /** Persisted session ID to reuse on subsequent calls. */
  sessionId: string
  /** Toolkits that were rejected because they're not enabled at org level. */
  rejectedToolkits: string[]
  /** True when the org has Composio configured with a valid key. */
  configured: boolean
}

/**
 * Load Composio tool handlers for an org (optionally scoped to specific
 * toolkits). Creates or reuses a session, persists the session ID, and returns
 * adapted ToolHandlers. Failures degrade gracefully to an empty list.
 */
export async function loadComposioToolHandlers(
  options: LoadComposioHandlersOptions
): Promise<LoadComposioHandlersResult> {
  const { orgId, requestedToolkits = [] } = options

  // Coming Soon gate — short-circuit before any Composio API/session work.
  if (!COMPOSIO_LAUNCH_ENABLED) {
    return { handlers: [], sessionId: '', rejectedToolkits: [], configured: false }
  }

  try {
    const config = await loadComposioOrgConfig(orgId)
    if (!config) {
      return { handlers: [], sessionId: '', rejectedToolkits: [], configured: false }
    }

    // Only toolkits enabled at the org level can be used; agent picks a subset.
    const enabledSet = new Set(config.enabledToolkits ?? [])
    const requested = requestedToolkits.filter(Boolean)
    const validToolkits = requested.length > 0
      ? requested.filter((t) => enabledSet.has(t))
      : (config.enabledToolkits ?? [])
    const rejectedToolkits = requested.filter((t) => !enabledSet.has(t))

    if (validToolkits.length === 0) {
      return { handlers: [], sessionId: '', rejectedToolkits, configured: true }
    }

    const client = createComposioClient(config.apiKey)
    let session = await getOrCreateSession(client, orgId, validToolkits, config.sessionId)

    let composioTools = await getSessionTools(session)

    // A session created before the DIRECT_TOOLS preset only exposes meta tools.
    // If reuse yielded nothing usable, recreate once with the current config.
    if (composioTools.length === 0 && config.sessionId && session.sessionId === config.sessionId) {
      session = await getOrCreateSession(client, orgId, validToolkits, undefined)
      composioTools = await getSessionTools(session)
    }

    // Persist the session ID whenever it changed (create or refresh).
    if (session.sessionId !== config.sessionId) {
      await prisma.composioConfig.update({
        where: { organizationId: orgId },
        data: { composioSessionId: session.sessionId },
      }).catch(() => {})
    }

    const handlers = adaptComposioTools(composioTools, async () => session)

    return { handlers, sessionId: session.sessionId, rejectedToolkits, configured: true }
  } catch (error) {
    console.warn(`[composio] Failed to load tools for org ${orgId}: ${(error as Error).message}`)
    return { handlers: [], sessionId: '', rejectedToolkits: [], configured: false }
  }
}
