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
            error: `This toolkit (${tool.toolkit}) is not connected yet. Ask the user to connect it from Settings → Composio, then retry.`,
            needs_auth: true,
            toolkit: tool.toolkit,
          }
        }
        return { error: `Composio tool ${tool.name} failed: ${(error as Error).message}` }
      }
    },
  }))
}
