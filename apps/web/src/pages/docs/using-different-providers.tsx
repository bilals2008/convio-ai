import { GitBranch, DollarSign, Zap, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UsingDifferentProvidersPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Using Different Providers' },
        ]}
        title="Using Models from Different Providers"
        description="Mix providers per agent, compare costs, and choose the right provider for each use case."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio lets you use different AI providers for different agents. One agent can run on OpenAI while another uses Anthropic — all within the same organization. This flexibility lets you optimize for cost, speed, or quality depending on each agent's role.
      </p>

      <h2 id="mixing-providers">Mixing Providers Per Agent</h2>
      <p>
        Each agent in Convio has its own model configuration. You can assign a different provider and model to each agent independently. For example:
      </p>
      <ul>
        <li><strong>Customer support agent:</strong> GPT-4o Mini for fast, cost-effective responses.</li>
        <li><strong>Sales qualification agent:</strong> Claude Sonnet 4 for nuanced, high-quality conversations.</li>
        <li><strong>Internal FAQ agent:</strong> Gemini 2.5 Flash for low-cost, high-volume queries.</li>
      </ul>
      <p>
        To change an agent's provider, go to <strong>Agent Settings → Model</strong> and select the desired provider and model from the dropdown.
      </p>

      <DocCallout variant="tip" icon={GitBranch} title="No reconfiguration needed">
        Switching an agent's model is a single dropdown change. No code changes, no redeployment. The agent immediately starts using the new model on the next conversation.
      </DocCallout>

      <h2 id="provider-features">Provider-Specific Features</h2>
      <p>
        Different providers offer different capabilities. Some features are provider-specific:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Feature</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Providers</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Notes</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Streaming</td>
              <td className="py-2 pr-4">All</td>
              <td className="py-2">All providers support streaming responses.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Tool Use</td>
              <td className="py-2 pr-4">OpenAI, Anthropic, Google</td>
              <td className="py-2">Groq supports tool use on select models.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Structured Output</td>
              <td className="py-2 pr-4">OpenAI, Anthropic</td>
              <td className="py-2">JSON schema enforcement.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Vision / Multimodal</td>
              <td className="py-2 pr-4">OpenAI, Google</td>
              <td className="py-2">Image understanding in conversations.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Extended Thinking</td>
              <td className="py-2 pr-4">Anthropic, OpenAI (o-series)</td>
              <td className="py-2">Chain-of-thought reasoning for complex tasks.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="cost-comparison">Cost Comparison Across Providers</h2>
      <p>
        Pricing varies significantly between providers and models. Here's a rough comparison for a typical support conversation (~2K input tokens, ~500 output tokens):
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Cost per 1K Input</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Cost per 1K Output</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost per Conversation</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o Mini</td>
              <td className="py-2 pr-4">$0.00015</td>
              <td className="py-2 pr-4">$0.0006</td>
              <td className="py-2">~$0.0006</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o</td>
              <td className="py-2 pr-4">$0.0025</td>
              <td className="py-2 pr-4">$0.01</td>
              <td className="py-2">~$0.01</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3.5 Haiku</td>
              <td className="py-2 pr-4">$0.0008</td>
              <td className="py-2 pr-4">$0.004</td>
              <td className="py-2">~$0.004</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude Sonnet 4</td>
              <td className="py-2 pr-4">$0.003</td>
              <td className="py-2 pr-4">$0.015</td>
              <td className="py-2">~$0.014</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 2.5 Flash</td>
              <td className="py-2 pr-4">$0.000075</td>
              <td className="py-2 pr-4">$0.0003</td>
              <td className="py-2">~$0.0003</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Llama 3.3 (Groq)</td>
              <td className="py-2 pr-4">$0.00059</td>
              <td className="py-2 pr-4">$0.00079</td>
              <td className="py-2">~$0.0016</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="info" icon={DollarSign} title="Prices change frequently">
        Check each provider's pricing page for current rates. The table above is a rough guide — actual costs depend on your usage tier and any negotiated rates.
      </DocCallout>

      <h2 id="when-to-switch">When to Switch Providers</h2>
      <p>
        Consider switching providers when:
      </p>
      <ul>
        <li><strong>Cost is too high:</strong> Move to a cheaper provider or model (e.g., GPT-4o → GPT-4o Mini).</li>
        <li><strong>Quality is insufficient:</strong> Upgrade to a more capable model (e.g., GPT-4o → Claude Sonnet 4).</li>
        <li><strong>Latency matters:</strong> Switch to Groq-hosted models for sub-200ms response times.</li>
        <li><strong>Provider is down:</strong> Temporarily switch to another provider while the primary one recovers.</li>
        <li><strong>Feature requirements change:</strong> Need multimodal? Switch to OpenAI or Google. Need extended thinking? Switch to Anthropic or OpenAI o-series.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limits & Quotas"
          href="/docs/rate-limits"
        />
        <DocNextStepCard
          icon={GitBranch}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Local Models"
          href="/docs/local-models"
        />
      </DocCardGrid>
    </DocContent>
  )
}
