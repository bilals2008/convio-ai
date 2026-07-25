import { Link } from 'react-router-dom'
import { Link2, Eye, Shield, TestTube } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function LinkingMcpAgentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Linking MCP Servers to Agents' },
        ]}
        title="Linking MCP Servers to Agents"
        description="Make MCP server tools available to your agents and control which tools each agent can access."
      />

      <h2 id="making-tools-available">Making MCP Tools Available</h2>
      <p>
        After connecting an MCP server, its tools appear in your agent's tool selection. Linking is straightforward:
      </p>
      <ol>
        <li>Open your agent's settings</li>
        <li>In the <strong>Tools</strong> section, find the MCP tools area</li>
        <li>Select the MCP server connection</li>
        <li>Toggle on the specific tools you want this agent to use</li>
        <li>Save the agent</li>
      </ol>
      <p>
        You don't have to expose all tools from a server. Pick only the ones relevant to each agent's role.
      </p>

      <h2 id="tool-discovery">Tool Discovery</h2>
      <p>
        Convio discovers tools from the MCP server automatically:
      </p>
      <ul>
        <li><strong>Names:</strong> The tool's identifier as exposed by the server</li>
        <li><strong>Descriptions:</strong> What the tool does — the model reads this to decide when to use it</li>
        <li><strong>Parameters:</strong> The input schema the tool accepts</li>
      </ul>
      <p>
        Tool names from MCP servers are namespaced to avoid conflicts with built-in or custom tools. A tool called <code>search</code> from a GitHub MCP server appears as <code>github.search</code> in Convio.
      </p>

      <h2 id="permission-management">Permission Management</h2>
      <p>
        Each agent has independent permissions for MCP tools:
      </p>
      <ul>
        <li><strong>Per-agent control:</strong> Enable or disable specific MCP tools per agent</li>
        <li><strong>Per-server control:</strong> Disconnect an MCP server to revoke all its tools from every agent</li>
        <li><strong>No cross-agent leakage:</strong> An agent can only use tools you've explicitly enabled for it</li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Least privilege">
        Only enable the MCP tools each agent actually needs. A support agent doesn't need database write access. A sales agent doesn't need file system tools. Grant the minimum required.
      </DocCallout>

      <h2 id="testing">Testing MCP Tool Integration</h2>
      <ol>
        <li><strong>Verify discovery:</strong> After linking, check that the expected tools appear in the agent's tool list</li>
        <li><strong>Playground test:</strong> Ask questions that should trigger each MCP tool</li>
        <li><strong>Check tool calls:</strong> In the Playground trace, confirm the correct tool was called with valid parameters</li>
        <li><strong>Verify responses:</strong> Ensure the agent incorporates MCP tool results naturally</li>
        <li><strong>Error scenarios:</strong> Test what happens when the MCP server is unreachable mid-conversation</li>
      </ol>

      <DocCallout variant="warning" icon={TestTube} title="Monitor MCP usage">
        MCP tools may call external services that have their own rate limits or costs. Monitor your MCP server logs alongside Convio's usage dashboard to track consumption.
      </DocCallout>

      <h2 id="updating">Updating MCP Links</h2>
      <p>
        Changes to MCP tool links take effect immediately:
      </p>
      <ul>
        <li>Enable a new tool — available on the next conversation turn</li>
        <li>Disable a tool — immediately removed from the agent's capabilities</li>
        <li>Disconnect an MCP server — all its tools are revoked across all agents</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li><Link to="/docs/mcp-security" className="text-primary hover:underline">MCP Security Best Practices</Link></li>
        <li><Link to="/docs/connecting-mcp-server" className="text-primary hover:underline">Connecting an MCP Server</Link></li>
      </ul>
    </DocContent>
  )
}
