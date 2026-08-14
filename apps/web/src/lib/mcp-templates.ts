export interface McpServerTemplate {
  id: string
  name: string
  description: string
  provider: string
  url: string
  authType: 'none' | 'header' | 'oauth'
  type: 'stdio' | 'streamable-http'
  command?: string
  args?: string[]
  category: 'apps' | 'data' | 'devtools' | 'custom'
}

export const mcpServerTemplates: McpServerTemplate[] = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Search, read, and create pages, databases, and comments in your Notion workspace.',
    provider: 'notion',
    url: 'https://mcp.notion.com/mcp',
    authType: 'oauth',
    type: 'streamable-http',
    category: 'apps',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repositories, issues, pull requests, and code reviews.',
    provider: 'github',
    url: 'https://api.githubcopilot.com/mcp/',
    authType: 'oauth',
    type: 'streamable-http',
    category: 'devtools',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Track issues, projects, and team workflows.',
    provider: 'linear',
    url: 'https://mcp.linear.app/mcp',
    authType: 'oauth',
    type: 'streamable-http',
    category: 'devtools',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, read channels, and manage conversations.',
    provider: 'slack',
    url: 'https://mcp.slack.com/mcp',
    authType: 'oauth',
    type: 'streamable-http',
    category: 'apps',
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read and write files in a local directory (stdio).',
    provider: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/dir'],
    authType: 'none',
    type: 'stdio',
    category: 'custom',
  },
]
