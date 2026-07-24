import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function TemplatesPage() {
  return (
    <div>
      <DocHeading as="h1">Agent Templates</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Pre-built agent templates that let users create purpose-built agents in one click.
      </p>

      <DocHeading>What Are Templates?</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Agent templates are pre-configured blueprints that pre-fill an agent's name, description, system prompt,
        model, temperature, and suggested tools. Users can pick a template, customize further, and create an agent
        instantly — no prompt engineering required.
      </p>

      <DocHeading>How It Works</DocHeading>
      <ol className="space-y-2 text-sm text-muted-foreground mb-6 list-decimal pl-5">
        <li>Templates are defined server-side in <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">apps/api/src/modules/agents/templates.ts</code></li>
        <li>The <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">GET /organizations/:orgId/agent-templates</code> endpoint returns all templates</li>
        <li>The frontend shows them in a modal with categories: <strong>Support, Business, Education, Productivity, Custom</strong></li>
        <li>Users search, filter by category, and click a template to pre-fill the create form</li>
      </ol>

      <DocHeading>Template Data Structure</DocHeading>
      <pre className="rounded-lg bg-muted p-4 text-xs font-mono leading-relaxed mb-4 overflow-x-auto">
{`interface AgentTemplate {
  id: 'customer-support' | 'sales' | 'faq'
     | 'onboarding' | 'interviewer' | 'tutor'
     | 'translator' | 'custom'
  name: string
  description: string
  systemPrompt: string
  suggestedModel: string
  suggestedTemperature: number
  category: 'support' | 'business' | 'education'
         | 'productivity' | 'custom'
  suggestedTools: string[]
}`}
      </pre>

      <DocHeading>Why Backend?</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Single source of truth</strong> — An admin dashboard can edit templates without redeploying the frontend</li>
        <li><strong>Security</strong> — API keys, model names, and prompts stay server-side</li>
        <li><strong>Scalability</strong> — The <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">POST /agents/from-template</code> endpoint creates agents server-side from templates</li>
        <li><strong>Analytics ready</strong> — Track which templates are used most, add A/B testing, or org-specific templates</li>
      </ul>

      <DocHeading>Adding a New Template</DocHeading>
      <ol className="space-y-2 text-sm text-muted-foreground mb-6 list-decimal pl-5">
        <li>Open <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">apps/api/src/modules/agents/templates.ts</code></li>
        <li>Add a new <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">id</code> to the <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">AgentTemplateType</code> union</li>
        <li>Choose a <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">category</code> from the existing ones or add a new one to <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">AgentTemplateCategory</code></li>
        <li>Write a compelling <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">systemPrompt</code> and pick a suitable <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">suggestedModel</code> + <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">suggestedTemperature</code></li>
        <li>Add <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">suggestedTools</code> that the agent commonly needs (e.g. <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">knowledge-search</code> for support agents)</li>
      </ol>

      <DocHeading>Current Templates</DocHeading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 px-3 font-medium">Template</th>
              <th className="text-left py-2 px-3 font-medium">Category</th>
              <th className="text-left py-2 px-3 font-medium">Model</th>
              <th className="text-left py-2 px-3 font-medium">Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Customer Support</td><td className="py-2 px-3">support</td><td className="py-2 px-3">gpt-4o-mini</td><td className="py-2 px-3">knowledge-search</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Sales Representative</td><td className="py-2 px-3">business</td><td className="py-2 px-3">gpt-4o</td><td className="py-2 px-3">generate-leads</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">FAQ Assistant</td><td className="py-2 px-3">support</td><td className="py-2 px-3">gpt-4o-mini</td><td className="py-2 px-3">knowledge-search</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Onboarding Guide</td><td className="py-2 px-3">productivity</td><td className="py-2 px-3">gpt-4o-mini</td><td className="py-2 px-3">—</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Interviewer</td><td className="py-2 px-3">business</td><td className="py-2 px-3">gpt-4o</td><td className="py-2 px-3">—</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Tutor</td><td className="py-2 px-3">education</td><td className="py-2 px-3">gpt-4o</td><td className="py-2 px-3">knowledge-search</td></tr>
            <tr className="border-b border-border/40"><td className="py-2 px-3">Translator</td><td className="py-2 px-3">productivity</td><td className="py-2 px-3">gpt-4o-mini</td><td className="py-2 px-3">—</td></tr>
            <tr><td className="py-2 px-3">Custom</td><td className="py-2 px-3">custom</td><td className="py-2 px-3">gpt-4o-mini</td><td className="py-2 px-3">—</td></tr>
          </tbody>
        </table>
      </div>

      <DocHeading>Frontend Modal Behavior</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The template picker in the create agent page uses an 80vw × 80vh modal with:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Search bar</strong> — Filter by name or description</li>
        <li><strong>Category tabs</strong> — Support, Business, Education, Productivity, Custom</li>
        <li><strong>Card grid</strong> — Responsive (2–4 columns based on viewport)</li>
        <li><strong>Selected state</strong> — Active template shows a checkmark and primary border</li>
        <li><strong>Category badge</strong> — Color-coded per category</li>
        <li><strong>Tools count</strong> — Shows "N tools suggested" when applicable</li>
      </ul>

      <DocHeading>API Endpoints</DocHeading>
      <ul className="space-y-3 mb-6">
        <li>
          <code className="rounded bg-muted px-2 py-1 text-xs font-medium">GET /organizations/:orgId/agent-templates</code>
          <p className="text-xs text-muted-foreground mt-0.5">Returns all templates. No auth required beyond org membership.</p>
        </li>
        <li>
          <code className="rounded bg-muted px-2 py-1 text-xs font-medium">POST /agents/from-template</code>
          <p className="text-xs text-muted-foreground mt-0.5">Creates an agent from a template. Accepts <code className="rounded bg-muted px-1 py-0.5 text-[10px]">template</code>, optional <code className="rounded bg-muted px-1 py-0.5 text-[10px]">name</code>, <code className="rounded bg-muted px-1 py-0.5 text-[10px]">description</code>, <code className="rounded bg-muted px-1 py-0.5 text-[10px]">model</code>, <code className="rounded bg-muted px-1 py-0.5 text-[10px]">systemPrompt</code>, <code className="rounded bg-muted px-1 py-0.5 text-[10px]">knowledgeBaseId</code>, <code className="rounded bg-muted px-1 py-0.5 text-[10px]">providerKeyId</code>.</p>
        </li>
      </ul>

      <DocHeading>Future Admin Features</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Template editor UI</strong> — Admin page to create/edit templates</li>
        <li><strong>Featured templates</strong> — Pin popular templates to the top</li>
        <li><strong>Org-specific templates</strong> — Different templates per organization</li>
        <li><strong>Usage analytics</strong> — Track which templates are used most</li>
        <li><strong>Template cloning</strong> — Duplicate and tweak existing templates</li>
      </ul>

      <div className="flex gap-3">
        <Link to="/docs/plan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Integration Plan
          </Button>
        </Link>
      </div>
    </div>
  )
}