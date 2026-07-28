import { Link } from 'react-router-dom'
import { ArrowRight, Plus, LayoutTemplate, Settings, FileText, Wrench, Database } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CreatingAgentPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating an Agent' },
        ]}
        title="Creating an Agent"
        description="Build an agent from scratch or start from a pre-built template. Most agents are ready to test in under five minutes."
      />

      <h2 id="two-ways">Two Ways to Create</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Plus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="From Scratch"
          description="Start with a blank agent and define every detail — system prompt, model, tools, and knowledge base."
          href="#from-scratch"
        />
        <DocFeatureCard
          icon={LayoutTemplate}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="From Template"
          description="Choose from 17 pre-built templates for common use cases — customer support, sales, FAQ, onboarding, and more."
          href="#from-template"
        />
      </DocCardGrid>

      <h2 id="from-scratch">Creating from Scratch</h2>

      <h3 id="step-1-navigate">Step 1 — Navigate to Agents</h3>
      <p>
        From the dashboard, click <strong>Agents</strong> in the sidebar, then click <strong>New Agent</strong> in the top-right corner.
      </p>

      <h3 id="step-2-name">Step 2 — Name Your Agent</h3>
      <p>
        Give your agent a descriptive name. This is visible to your team and appears in channel configurations. Use something like "Support Agent — English" or "Sales Qualifier".
      </p>

      <h3 id="step-3-model">Step 3 — Select a Model</h3>
      <p>
        Choose the AI model that powers your agent. Each provider offers different tradeoffs between speed, quality, and cost. See <Link to="/docs/ai-models" className="text-primary hover:underline">Choosing an AI Model</Link> for guidance.
      </p>

      <h3 id="step-4-prompt">Step 4 — Write a System Prompt</h3>
      <p>
        The system prompt defines how your agent behaves. Be specific about the agent's role, tone, rules, and what it should do in different scenarios. See <Link to="/docs/system-prompts" className="text-primary hover:underline">Writing System Prompts</Link> for tips.
      </p>

      <DocCallout variant="tip" icon={FileText} title="Minimum viable prompt">
        A good starting prompt: "You are a customer support agent for [Company]. Be helpful and concise. If you don't know the answer, say so and offer to connect the user with a human agent."
      </DocCallout>

      <h3 id="step-5-optional">Step 5 — Configure Optional Settings</h3>
      <p>
        Add a knowledge base, connect tools, set a welcome message, or adjust model parameters. These are optional but significantly improve agent performance. See <Link to="/docs/agent-settings" className="text-primary hover:underline">Agent Settings</Link>.
      </p>

      <h3 id="step-6-save">Step 6 — Save and Test</h3>
      <p>
        Click <strong>Save</strong>, then open the Playground tab to test your agent with sample inputs before deploying to any channel.
      </p>

      <h2 id="from-template">Creating from a Template</h2>
      <p>
        Convio ships with 17 templates covering the most common agent use cases. Each template comes with a pre-configured system prompt, suggested tools, and recommended model settings.
      </p>

      <h3 id="template-categories">Template Categories</h3>
      <ul>
        <li><strong>Customer Support:</strong> General support, technical help, returns & refunds, account issues</li>
        <li><strong>Sales:</strong> Lead qualification, product recommendations, pricing inquiries, demo booking</li>
        <li><strong>FAQ:</strong> Company information, policies, hours, locations</li>
        <li><strong>Onboarding:</strong> New user walkthrough, feature tutorials, setup assistance</li>
        <li><strong>Internal:</strong> HR assistant, IT helpdesk, documentation search</li>
      </ul>

      <h3 id="using-template">Using a Template</h3>
      <ol>
        <li>Click <strong>New Agent</strong> → <strong>From Template</strong></li>
        <li>Browse or search the template library</li>
        <li>Select a template and review the pre-filled configuration</li>
        <li>Customize the system prompt, model, and settings for your use case</li>
        <li>Click <strong>Create Agent</strong></li>
      </ol>

      <DocCallout variant="info" icon={Settings} title="Templates are starting points">
        Every template is fully editable after creation. Adjust the prompt, swap the model, add tools — the template just saves you from starting with a blank page.
      </DocCallout>

      <h2 id="required-fields">Required Fields</h2>
      <ul>
        <li><strong>Name:</strong> A unique, descriptive name for the agent</li>
        <li><strong>Model:</strong> The AI provider and model variant (e.g., GPT-4o, Claude 3.5 Sonnet)</li>
        <li><strong>System Prompt:</strong> Instructions that define the agent's behavior and constraints</li>
      </ul>

      <h2 id="optional-fields">Optional Fields</h2>
      <ul>
        <li><strong>Temperature:</strong> Controls randomness (0 = deterministic, 1 = creative). Default varies by model.</li>
        <li><strong>Tools:</strong> Functions the agent can call — knowledge base search, web search, custom integrations</li>
        <li><strong>Knowledge Base:</strong> Factual data sources the agent retrieves context from</li>
        <li><strong>Welcome Message:</strong> Greeting shown when a conversation starts</li>
        <li><strong>Suggested Replies:</strong> Quick-reply buttons shown alongside the welcome message</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Writing System Prompts"
          href="/docs/system-prompts"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
      </DocCardGrid>
    </DocContent>
  )
}
