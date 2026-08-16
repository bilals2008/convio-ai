import { Link } from 'react-router-dom'
import { Link2, Shield, TestTube, Server } from 'lucide-react'
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
        description="Attach a connected MCP server to your agents so their tools are available in conversations."
      />

      <h2 id="making-tools-available">Attaching a Server to an Agent</h2>
      <p>
        Linking is done at the <strong>server level</strong> — once a server is connected (see{' '}
        <Link to="/docs/connecting-mcp-server" className="text-primary hover:underline">Connecting an MCP Server</Link>),
        attach it to the agents that should use its tools:
      </p>
      <ol>
        <li>Open the agent you want to configure</li>
        <li>In the <strong>MCP Servers</strong> section of the agent form, toggle on the connected servers</li>
        <li>Save the agent</li>
      </ol>
      <p>
        All tools from an attached server become available to that agent. There is no per-tool selection — the server's
        full tool set is exposed.
      </p>

      <h2 id="tool-discovery">Tool Discovery</h2>
      <p>
        Convio discovers tools from the MCP server automatically and merges them into the agent's tool router:
      </p>
      <ul>
        <li><strong>Names:</strong> The tool's identifier as exposed by the server</li>
        <li><strong>Descriptions:</strong> What the tool does — the model reads this to decide when to use it</li>
        <li><strong>Parameters:</strong> The input schema the tool accepts</li>
      </ul>
      <p>
        Tool names from MCP servers are namespaced to avoid conflicts with built-in or custom tools. A tool called{' '}
        <code>search</code> from a GitHub MCP server appears as <code>github.search</code>.
      </p>

      <h2 id="permission-management">Permission Management</h2>
      <ul>
        <li><strong>Per-agent control:</strong> Attach or detach a server per agent</li>
        <li><strong>Per-server control:</strong> Disconnect or disable a server to remove its tools from every agent</li>
        <li><strong>No cross-agent leakage:</strong> An agent can only use tools from servers you've attached to it</li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Least privilege">
        Only attach the servers each agent actually needs. A support agent doesn't need database write tools. A sales
        agent doesn't need file system tools.
      </DocCallout>

      <h2 id="testing">Testing MCP Tool Integration</h2>
      <ol>
        <li><strong>Verify discovery:</strong> After linking, confirm the server's tools are reachable via the Test Chat / agent chat</li>
        <li><strong>Test chat:</strong> Ask a question that should trigger an MCP tool</li>
        <li><strong>Check tool calls:</strong> In the trace, confirm the correct tool was called with valid parameters</li>
        <li><strong>Verify responses:</strong> Ensure the agent incorporates MCP tool results naturally</li>
        <li><strong>Error scenarios:</strong> Test what happens when the MCP server is unreachable mid-conversation</li>
      </ol>

      <DocCallout variant="warning" icon={TestTube} title="Monitor MCP usage">
        MCP tools may call external services that have their own rate limits or costs. Monitor your MCP server logs
        alongside Convio's usage dashboard.
      </DocCallout>

      <h2 id="updating">Updating MCP Links</h2>
      <ul>
        <li>Attach a server — its tools are available on the next conversation</li>
        <li>Detach a server — its tools are immediately removed from the agent</li>
        <li>Disconnect a server — its tools are revoked across all agents</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li><Link to="/docs/mcp-security" className="text-primary hover:underline">MCP Security Best Practices</Link></li>
        <li><Link to="/docs/mcp-server-types" className="text-primary hover:underline">MCP Server Types</Link></li>
      </ul>
    </DocContent>
  )
}