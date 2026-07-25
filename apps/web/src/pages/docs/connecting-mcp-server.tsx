import { Link } from 'react-router-dom'
import { Server, Key, TestTube, AlertCircle, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function ConnectingMcpServerPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Connecting an MCP Server' },
        ]}
        title="Connecting an MCP Server"
        description="Set up a connection to an MCP server and verify it's working before linking it to agents."
      />

      <h2 id="configuration-fields">Configuration Fields</h2>
      <p>
        Connecting an MCP server requires a few fields in Convio's settings:
      </p>
      <ul>
        <li><strong>Name:</strong> A descriptive name for this connection (e.g., "GitHub MCP Server")</li>
        <li><strong>Transport Type:</strong> <code>STDIO</code>, <code>SSE</code>, or <code>Streamable HTTP</code> (see <Link to="/docs/mcp-server-types" className="text-primary hover:underline">MCP Server Types</Link>)</li>
        <li><strong>Endpoint / Command:</strong> The URL for SSE/HTTP, or the command and arguments for STDIO</li>
        <li><strong>Environment Variables:</strong> Key-value pairs passed to the server process (for STDIO) or included as headers (for HTTP)</li>
      </ul>

      <h2 id="authentication">Authentication Setup</h2>
      <p>
        Most MCP servers require authentication. Convio supports passing credentials through environment variables or headers:
      </p>
      <ul>
        <li><strong>API keys:</strong> Set as environment variables (e.g., <code>GITHUB_TOKEN</code>) — never hardcode in the endpoint URL</li>
        <li><strong>Bearer tokens:</strong> Added as <code>Authorization</code> headers in the connection config</li>
        <li><strong>OAuth:</strong> For servers that support it, complete the OAuth flow before connecting</li>
      </ul>

      <DocCallout variant="warning" icon={Key} title="Never commit credentials">
        Store API keys and tokens in environment variables, not in Convio's configuration files. Use your organization's secret manager for production deployments.
      </DocCallout>

      <h2 id="testing-connection">Testing the Connection</h2>
      <p>
        After filling in the configuration fields:
      </p>
      <ol>
        <li>Click <strong>Test Connection</strong></li>
        <li>Convio attempts to reach the MCP server and discover available tools</li>
        <li>On success, you'll see a list of tools the server exposes</li>
        <li>On failure, an error message explains what went wrong</li>
      </ol>

      <DocCallout variant="success" icon={CheckCircle} title="Tool discovery">
        Convio automatically discovers all tools exposed by the MCP server. You select which tools to make available to agents — you don't need to define schemas manually.
      </DocCallout>

      <h2 id="troubleshooting">Troubleshooting</h2>
      <h3 id="connection-refused">Connection Refused</h3>
      <ul>
        <li>Verify the server is running and accessible</li>
        <li>Check firewall rules for the port</li>
        <li>For STDIO, confirm the binary path is correct</li>
      </ul>

      <h3 id="auth-errors">Authentication Errors</h3>
      <ul>
        <li>Verify API keys are set correctly in environment variables</li>
        <li>Check that the token hasn't expired</li>
        <li>Ensure the token has the required permissions</li>
      </ul>

      <h3 id="no-tools-found">No Tools Found</h3>
      <ul>
        <li>Confirm the server implements the MCP tool protocol</li>
        <li>Check server logs for startup errors</li>
        <li>Verify the transport type matches the server's expectation</li>
      </ul>

      <h3 id="timeout">Timeout</h3>
      <ul>
        <li>Increase the connection timeout in advanced settings</li>
        <li>Check network latency to remote servers</li>
        <li>For STDIO, ensure the server starts within the timeout window</li>
      </ul>

      <DocCallout variant="info" icon={TestTube} title="Start with the Playground">
        Test MCP tools in the Playground before deploying to agents. This lets you verify tool calls work correctly without affecting live conversations.
      </DocCallout>
    </DocContent>
  )
}
