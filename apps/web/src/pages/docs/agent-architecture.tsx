import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bot } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function AgentArchitecturePage() {
  return (
    <div>
      <DocHeading as="h1">Agent Architecture</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        How Convio agents are created, configured, and deployed.
      </p>

      <DocHeading>Create Agent Flow</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        The create agent page at <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">/agents/new</code> follows a structured flow:
      </p>
      <ol className="space-y-2 text-sm text-muted-foreground mb-6 list-decimal pl-5">
        <li><strong>Template</strong> — User picks a template (optional). Opens a modal with search + category filters.</li>
        <li><strong>Identity</strong> — Name + Description + Avatar. Avatar supports Upload (Supabase Storage) or Choose Preset (modal).</li>
        <li><strong>Model & Behavior</strong> — Model selection, system prompt, temperature, reasoning effort, tone of voice, language.</li>
        <li><strong>Knowledge</strong> — Link a knowledge base for RAG (one-to-one: one agent ↔ one KB).</li>
        <li><strong>Sidebar</strong> — Tools, MCP Servers, Capabilities, Deployment toggles.</li>
      </ol>

      <DocHeading>Avatar System</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Avatar presets JSON</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">lib/config/avatar-presets.json</code> contains an array of <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{`{ id, name, category, url }`}</code> objects</li>
        <li><strong>Categories</strong> — support, business, education, developer, researcher</li>
        <li><strong>Modal</strong> — 80vw × 80vh with search + category tabs + grid</li>
        <li><strong>Upload</strong> — Goes to Supabase Storage <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">avatars</code> bucket at <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">agents/{`{orgId}`}/{`{uuid}`}.{ext}</code></li>
        <li><strong>File validation</strong> — JPG, PNG, WebP, GIF only. Max 2MB.</li>
        <li><strong>Hook</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">use-agent-avatar-upload.ts</code> handles the upload + public URL retrieval</li>
      </ul>

      <DocHeading>Tools System</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Agents can use built-in tools and external MCP servers.
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Built-in tools</strong> — Defined in <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">components/agents/agent-tool-picker.tsx</code> with <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">id</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">label</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">description</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">icon</code></li>
        <li><strong>MCP Servers</strong> — Listed from API, user can select multiple. "See all" button opens a modal when more than 3 servers exist.</li>
        <li><strong>Tools stored in</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">widgetConfig.tools</code> array on the agent model</li>
      </ul>

      <DocHeading>Knowledge Base (RAG)</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>One-to-one</strong> — Each agent can be linked to exactly one knowledge base</li>
        <li><strong>Field</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">knowledgeBaseId</code> on the Agent model</li>
        <li><strong>At query time</strong> — The last user message is embedded, top chunks are injected into the system prompt</li>
        <li><strong>Embedding model</strong> — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">text-embedding-3-small</code> via OpenAI</li>
        <li><strong>UI</strong> — Select dropdown in the Knowledge card, shows connected KB with doc count</li>
      </ul>

      <DocHeading>Capabilities</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Toggle features the agent can use:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Answer Questions</strong> — Always enabled (default capability)</li>
        <li><strong>Knowledge Search</strong> — Always enabled when a KB is linked</li>
        <li><strong>Web Search</strong> — External web search</li>
        <li><strong>Image Generation</strong> — Generate images via DALL-E / similar</li>
        <li><strong>File Uploads</strong> — Accept file uploads from users</li>
        <li>Defined in <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">components/agents/agent-capabilities.ts</code></li>
      </ul>

      <DocHeading>Deployment Options</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Web Chat Widget</strong> — Embed on your website. Always enabled.</li>
        <li><strong>Shareable Link</strong> — A public chat URL</li>
        <li><strong>API Access</strong> — Connect through the REST API</li>
        <li><strong>WhatsApp</strong> — WhatsApp Business integration</li>
        <li>Stored as <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">deployment</code> array on the agent</li>
      </ul>

      <DocHeading>Key Components</DocHeading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 px-3 font-medium">Component</th>
              <th className="text-left py-2 px-3 font-medium">File</th>
              <th className="text-left py-2 px-3 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">CreateAgentPage</td><td className="py-2 px-3 font-mono text-xs">pages/agents/create-agent-page.tsx</td><td className="py-2 px-3 text-xs">Main create agent form</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AgentBasicInfo</td><td className="py-2 px-3 font-mono text-xs">components/agents/agent-basic-info.tsx</td><td className="py-2 px-3 text-xs">Name + Description + Avatar</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AgentBehaviorSettings</td><td className="py-2 px-3 font-mono text-xs">components/agents/agent-behavior-settings.tsx</td><td className="py-2 px-3 text-xs">Model, prompt, temperature, etc.</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AgentKnowledgeSources</td><td className="py-2 px-3 font-mono text-xs">components/agents/agent-knowledge-sources.tsx</td><td className="py-2 px-3 text-xs">KB selector dropdown</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AgentToolPicker</td><td className="py-2 px-3 font-mono text-xs">components/agents/agent-tool-picker.tsx</td><td className="py-2 px-3 text-xs">Built-in tool toggles</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AgentTemplateModal</td><td className="py-2 px-3 font-mono text-xs">components/agents/agent-template-modal.tsx</td><td className="py-2 px-3 text-xs">Template picker modal</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">AvatarPresetModal</td><td className="py-2 px-3 font-mono text-xs">components/agents/avatar-preset-modal.tsx</td><td className="py-2 px-3 text-xs">Avatar picker modal</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">PresetAvatarPicker</td><td className="py-2 px-3 font-mono text-xs">components/agents/preset-avatar-picker.tsx</td><td className="py-2 px-3 text-xs">Upload + Choose Preset buttons</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3 font-mono text-xs">useAgentAvatarUpload</td><td className="py-2 px-3 font-mono text-xs">lib/hooks/use-agent-avatar-upload.ts</td><td className="py-2 px-3 text-xs">Supabase Storage upload hook</td></tr>
            <tr><td className="py-2 px-3 font-mono text-xs">avatar-presets.json</td><td className="py-2 px-3 font-mono text-xs">lib/config/avatar-presets.json</td><td className="py-2 px-3 text-xs">Avatar URL config file</td></tr>
          </tbody>
        </table>
      </div>

      <DocHeading>Data Flow</DocHeading>
      <pre className="rounded-lg bg-muted p-4 text-xs font-mono leading-relaxed mb-6 overflow-x-auto">
{`User fills form
  → form.handleSubmit(handleCreate)
    → agentsApi.create({ name, model, systemPrompt,
        knowledgeBaseId, tools, capabilities, deployment,
        settings, ... })
      → POST /organizations/:orgId/agents
        → prisma.agent.create({ ... })
          → returns agent ID
    → If MCP servers selected:
      → mcpApi.linkToAgent(agentId, serverId) for each
    → navigate('/agents')`}
      </pre>

      <DocHeading>Form Schema</DocHeading>
      <pre className="rounded-lg bg-muted p-4 text-xs font-mono leading-relaxed mb-6 overflow-x-auto">
{`const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string(),
  avatar: z.string(),
  model: z.string().min(1),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  reasoningEffort: z.string(),
  toneOfVoice: z.string(),
  language: z.string(),
})`}
      </pre>

      <DocHeading>Agent Model (Prisma)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Key fields on the Agent model in <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">packages/database/prisma/schema.prisma</code>:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">id</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">organizationId</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">createdById</code></li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">name</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">description</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">avatar</code></li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">model</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">systemPrompt</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">temperature</code></li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">knowledgeBaseId</code> — Links to KnowledgeBase (nullable)</li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">widgetConfig</code> — JSON field storing tools, deployment, and widget settings</li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">providerKeyId</code> — Optional custom API key</li>
        <li><code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">status</code> — active | inactive</li>
      </ul>

      <div className="flex gap-3">
        <Link to="/docs/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Templates
          </Button>
        </Link>
      </div>
    </div>
  )
}