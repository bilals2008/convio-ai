import { Bot, Plus, Settings, Wrench, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiAgentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Agents API' },
        ]}
        title="Agents API"
        description="Create, retrieve, update, and manage AI agents programmatically. Full CRUD with tool attachment and status control."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Agents API provides complete control over your agents. Create new agents with system prompts and model configurations, attach tools and knowledge bases, manage active status, and retrieve agent details — all via REST endpoints.
      </p>

      <h2 id="endpoints">Endpoints</h2>
      <pre><code>{`GET    /v1/agents              # List all agents
POST   /v1/agents              # Create a new agent
GET    /v1/agents/:id          # Get a specific agent
PATCH  /v1/agents/:id          # Update an agent
DELETE /v1/agents/:id          # Delete an agent
POST   /v1/agents/:id/tools    # Attach a tool to an agent
DELETE /v1/agents/:id/tools/:tool_id  # Remove a tool`}</code></pre>

      <h2 id="create-agent">Create Agent</h2>
      <p>Send a POST request with the agent configuration:</p>
      <pre><code>{`POST /v1/agents
{
  "name": "Support Agent",
  "model": "gpt-4o",
  "system_prompt": "You are a helpful support agent for Acme Inc.",
  "temperature": 0.7,
  "knowledge_base_ids": ["kb_abc123"],
  "tools": ["web_search", "knowledge_base"]
}`}</code></pre>
      <p>The response returns the created agent with its ID and metadata:</p>
      <pre><code>{`{
  "data": {
    "id": "agent_xyz789",
    "name": "Support Agent",
    "status": "draft",
    "model": "gpt-4o",
    "system_prompt": "You are a helpful support agent for Acme Inc.",
    "temperature": 0.7,
    "knowledge_base_ids": ["kb_abc123"],
    "tools": ["web_search", "knowledge_base"],
    "organization_id": "org_abc123",
    "created_at": "2026-07-26T10:00:00Z",
    "updated_at": "2026-07-26T10:00:00Z"
  }
}`}</code></pre>

      <h2 id="status-management">Status Management</h2>
      <p>
        Agents have three statuses: <code>draft</code>, <code>active</code>, and <code>inactive</code>. Activate an agent by updating its status:
      </p>
      <pre><code>{`PATCH /v1/agents/agent_xyz789
{
  "status": "active"
}`}</code></pre>

      <DocCallout variant="info" icon={Bot} title="Draft agents cannot receive messages">
        A newly created agent starts in <code>draft</code> status. It won't appear in channels or respond to messages until you set it to <code>active</code>.
      </DocCallout>

      <h2 id="tool-attachment">Attaching Tools</h2>
      <p>Attach built-in or custom tools to give your agent capabilities beyond text generation:</p>
      <pre><code>{`POST /v1/agents/agent_xyz789/tools
{
  "tool_id": "web_search",
  "config": {
    "max_results": 5,
    "safe_search": true
  }
}`}</code></pre>
      <p>Available built-in tools: <code>web_search</code>, <code>knowledge_base</code>, <code>url_fetcher</code>, <code>calculator</code>. Custom tools can be created via the Custom Tools API.</p>

      <h2 id="response-schema">Response Schema</h2>
      <pre><code>{`{
  "id": string,              // Unique agent identifier
  "name": string,            // Agent display name
  "status": "draft" | "active" | "inactive",
  "model": string,           // AI model identifier
  "system_prompt": string,   // Agent instructions
  "temperature": number,     // 0.0 - 1.0
  "knowledge_base_ids": string[],
  "tools": string[],
  "organization_id": string,
  "created_at": string,      // ISO 8601 timestamp
  "updated_at": string       // ISO 8601 timestamp
}`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversations API"
          href="/docs/api-conversations"
        />
        <DocNextStepCard
          icon={Wrench}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Messages API"
          href="/docs/api-messages"
        />
      </DocNextStepCard>
    </DocContent>
  )
}
