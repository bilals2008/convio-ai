import { Link } from 'react-router-dom'
import { Plus, Key, Settings, Eye, Globe, Shield, Palette } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CreatingWidgetPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating a Widget' },
        ]}
        title="Creating a Widget"
        description="Set up a new chat widget in minutes. Connect it to an agent and generate the embed snippet."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Creating a widget is a three-step process: name it, connect it to an agent, and generate the embed code. The widget inherits its behavior from the agent — system prompt, knowledge base, tools — while the widget controls appearance and embedding settings.
      </p>

      <h2 id="step-1-navigate">Step 1 — Navigate to Widgets</h2>
      <p>
        From the dashboard, click <strong>Channels</strong> in the sidebar, then select <strong>Widget</strong>. Click <strong>New Widget</strong> to start the creation flow.
      </p>

      <h2 id="step-2-name">Step 2 — Name Your Widget</h2>
      <p>
        Give your widget a descriptive name. This is internal — visitors won't see it. Use something that identifies the website or use case: "Main Site Widget", "Documentation Help", or "Pricing Page Support".
      </p>

      <h2 id="step-3-agent">Step 3 — Select an Agent</h2>
      <p>
        Choose the agent this widget connects to. The agent determines how the widget responds — its personality, knowledge, and capabilities. You can assign a different agent to each widget if you run multiple sites or need different behavior per page.
      </p>

      <DocCallout variant="tip" icon={Settings} title="One agent, many widgets">
        A single agent can power multiple widgets. Create separate widgets with different appearances for different pages while sharing the same underlying agent configuration.
      </DocCallout>

      <h2 id="step-4-public-key">Step 4 — Generate the Public Key</h2>
      <p>
        Click <strong>Generate Public Key</strong> to create an API key for the widget. This key authenticates widget requests to your Convio instance. It's safe to expose in client-side code — it's scoped to this widget only.
      </p>

      <DocCallout variant="warning" title="Keep your public key safe">
        While the public key is designed for client-side use, don't expose your organization's private API keys. The widget public key has limited permissions — it can only create conversations and send messages through its assigned widget.
      </DocCallout>

      <h2 id="step-5-configure">Step 5 — Configure Settings</h2>
      <p>
        Before generating the embed code, review these settings:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Eye}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Appearance"
          description="Set colors, position, size, and welcome message. These control how the widget looks on your site."
          href="/docs/widget-appearance"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Allowed Domains"
          description="Restrict which websites can embed this widget. Prevents unauthorized usage on domains you don't control."
          href="/docs/allowed-domains"
        />
      </DocCardGrid>

      <h2 id="step-6-embed">Step 6 — Copy the Embed Code</h2>
      <p>
        Once configured, click <strong>Save</strong>. The dashboard generates a script snippet you can paste into your HTML. See <Link to="/docs/embedding-script" className="text-primary hover:underline">Embedding with a Script Tag</Link> for placement details.
      </p>

      <h2 id="widget-configuration">Configuration Reference</h2>
      <ul>
        <li><strong>Name:</strong> Internal identifier (required)</li>
        <li><strong>Agent:</strong> The agent powering conversations (required)</li>
        <li><strong>Public Key:</strong> Auto-generated authentication key (required)</li>
        <li><strong>Allowed Domains:</strong> Domain whitelist for embedding (recommended)</li>
        <li><strong>Appearance:</strong> Colors, position, size, welcome message (optional)</li>
        <li><strong>Auto-open:</strong> Whether the widget opens automatically on page load (optional)</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Palette}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Customize Appearance"
          href="/docs/widget-appearance"
        />
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Embed on Your Site"
          href="/docs/embedding-script"
        />
      </DocCardGrid>
    </DocContent>
  )
}
