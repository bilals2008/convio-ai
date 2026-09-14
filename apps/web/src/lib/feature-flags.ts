/**
 * Composio feature flag — the integration is fully built (settings page,
 * agent-builder picker, OAuth redirect-back flow, backend tool execution) but
 * is gated behind "Coming Soon" until launch. All code stays in place; these
 * flags only hide entry points and block execution.
 *
 * To launch: flip COMPOSIO_ENABLED to true. Nothing else needs to change.
 */
export const COMPOSIO_ENABLED = false

/** Where the toolkits are picked per agent (agent builder + playground). */
export const COMPOSIO_LAUNCH_MESSAGE = 'Composio integrations are coming soon — connect Gmail, Slack, GitHub and 40+ more apps to your agents.'
