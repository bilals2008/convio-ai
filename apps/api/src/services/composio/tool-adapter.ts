import type { ToolHandler } from '../tools/index.js'
import { executeComposioTool, composioSlugFromName, ComposioAuthError, type ComposioTool } from './index.js'

interface ComposioSessionLike {
  execute: (slug: string, args: Record<string, unknown>) => Promise<unknown>
}

/**
 * Convert Composio tools into our ToolHandler shape.
 * The LLM sees sanitized names (`composio_github_list_stargazers`); execution
 * resolves the real Composio slug from the name, so the model can never call
 * an invalid tool name.
 */
export function adaptComposioTools(
  tools: ComposioTool[],
  getSession: () => Promise<ComposioSessionLike | null>
): ToolHandler[] {
  return tools.map((tool) => ({
    schema: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
    async execute(args: Record<string, unknown>) {
      const slug = composioSlugFromName(tool.name) ?? tool.slug
      const session = await getSession()
      if (!session) {
        return { error: 'Composio session is no longer available' }
      }
      try {
        return await executeComposioTool(session, slug, args)
      } catch (error) {
        if (error instanceof ComposioAuthError) {
          return {
            error: `The ${tool.toolkit} connection is missing or expired. Tell the user to reconnect it in Settings → Composio.`,
            needs_auth: true,
            toolkit: tool.toolkit,
          }
        }
        // Pass the REAL failure through — wrong page ID, missing permissions,
        // rate limits, etc. The model can often retry with corrected arguments,
        // and it should never claim the integration is missing when it isn't.
        return { error: `${tool.name} failed: ${(error as Error).message}` }
      }
    },
  }))
}
