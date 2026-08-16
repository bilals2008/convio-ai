import { Link } from 'react-router-dom'
import { Server, Key, TestTube, ShieldCheck, CheckCircle } from 'lucide-react'
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
        description="Add an MCP server, verify the connection, and complete OAuth authorization."
      />

      <h2 id="where">Where to Add Servers</h2>
      <p>
        MCP servers live on the dedicated <strong>MCP Servers</strong> page — open it from the sidebar (AI group). You
        can also start from pre-built templates at <Link to="/mcp-servers/templates" className="text-primary hover:underline">MCP Templates</Link>{' '}
        (Notion, GitHub, Linear, Slack) which pre-fill the server config for you. More templates (Stripe, Google
        Workspace, Cloudflare, and more) are listed but marked <strong>Coming soon</strong> until they're fully
        supported.
      </p>

      <h2 id="configuration-fields">Configuration Fields</h2>
      <p>
        Click <strong>Add Server</strong> on the MCP Servers page and fill in:
      </p>
      <ul>
        <li><strong>Name:</strong> A descriptive name (e.g. "GitHub MCP Server")</li>
        <li><strong>Type:</strong> <code>stdio</code> (local command) or <code>streamable-http</code> (remote URL) — see <Link to="/docs/mcp-server-types" className="text-primary hover:underline">MCP Server Types</Link></li>
        <li><strong>Command / Args:</strong> For STDIO servers (e.g. <code>npx</code> + package args)</li>
        <li><strong>URL:</strong> For HTTP servers (e.g. <code>https://mcp.notion.com/mcp</code>)</li>
        <li><strong>Auth type:</strong> <code>none</code> / <code>header</code> / <code>oauth</code></li>
        <li><strong>API key:</strong> For <code>header</code> auth — sent as <code>Authorization: Bearer &lt;key&gt;</code></li>
        <li><strong>Custom headers:</strong> Extra key: value headers applied on every request</li>
      </ul>

      <DocCallout variant="warning" icon={Key} title="Never commit credentials">
        Store API keys in the API Key field or a secrets manager — never in code or version control.
      </DocCallout>

      <h2 id="oauth-connect">OAuth Connect</h2>
      <ol>
        <li>Add a server with auth type <code>oauth</code> and save</li>
        <li>Click the <strong>shield</strong> icon in the table (or "Connect with OAuth" in the test modal)</li>
        <li>The provider's consent page opens in a new tab (Notion, GitHub, Linear…)</li>
        <li>Authorize → the provider redirects back and tokens are stored</li>
        <li>The badge shows <strong>OAuth connected</strong>; token refresh happens automatically</li>
      </ol>
      <ul>
        <li><strong>Reconnect</strong> (refresh icon): forces re-auth — current tokens are revoked first</li>
        <li><strong>Disconnect</strong> (unlink icon): clears stored OAuth state</li>
      </ul>

      <h2 id="testing-connection">Testing the Connection</h2>
      <ol>
        <li>Click <strong>Test Connection</strong> on the server row</li>
        <li>Convio reaches the server and discovers its tools</li>
        <li>On success a modal lists the available tools with their input schemas</li>
        <li>On failure an error message explains what went wrong</li>
      </ol>

      <DocCallout variant="success" icon={CheckCircle} title="Tool discovery">
        Convio discovers all tools exposed by the MCP server automatically. You link the whole server to agents — you
        don't define schemas manually.
      </DocCallout>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3 id="connection-refused">Connection Refused</h3>
      <ul>
        <li>Verify the server is running and reachable</li>
        <li>For STDIO, confirm the command/args are correct and installed</li>
        <li>For HTTP, check the URL (must be HTTPS in production)</li>
      </ul>

      <h3 id="auth-errors">Authentication Errors</h3>
      <ul>
        <li>Verify the API key is correct and hasn't expired</li>
        <li>Ensure the token has the required scopes</li>
        <li>For OAuth, run <strong>Reconnect</strong> to re-authorize</li>
      </ul>

      <h3 id="oauth-dcr">"Dynamic client registration not supported" (OAuth)</h3>
      <p>
        Some providers — like <strong>GitHub Copilot</strong> — don't support dynamic client registration (DCR), so
        the authorize step fails. Use a personal access token instead:
      </p>
      <ol>
        <li>Switch the server's auth type from <code>oauth</code> to <code>header</code></li>
        <li>Create a PAT at <code>github.com/settings/personal-access-tokens/new</code> (e.g. <code>repo</code> scope)</li>
        <li>Paste it into the <strong>API Key</strong> field and save</li>
        <li>Test the connection — the token is sent as <code>Authorization: Bearer &lt;token&gt;</code></li>
      </ol>
      <p>
        Alternatively, create your own GitHub OAuth App and register its client ID.
      </p>

      <h3 id="no-tools-found">No Tools Found</h3>
      <ul>
        <li>Confirm the server implements the MCP protocol</li>
        <li>Check server logs for startup errors</li>
        <li>Verify the transport type matches the server's expectation</li>
      </ul>

      <DocCallout variant="info" icon={TestTube} title="Test before linking">
        Test MCP tools in the Test Connection modal before linking the server to agents. This verifies tool calls work
        without affecting live conversations.
      </DocCallout>
    </DocContent>
  )
}