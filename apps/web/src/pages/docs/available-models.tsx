import { Cpu, Filter, BarChart3, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AvailableModelsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Available Models' },
        ]}
        title="Available Models"
        description="Browse the AI models available in Convio, filtered by provider and capabilities."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio dynamically lists available models from each configured provider. The model list is fetched from the provider's API when you set up a key, so it always reflects the latest models offered. You can filter models by provider to find the right one for your agent.
      </p>

      <h2 id="dynamic-listing">How Models Are Listed</h2>
      <p>
        When you add a provider key, Convio queries the provider's model endpoint to discover available models. This means:
      </p>
      <ul>
        <li>New models appear automatically as providers release them.</li>
        <li>Deprecated models are removed from the selection.</li>
        <li>Models you don't have access to (e.g., private betas) are excluded.</li>
      </ul>

      <DocCallout variant="tip" icon={Cpu} title="Refresh model list">
        If a new model was recently released and doesn't appear, try removing and re-adding your provider key. This forces Convio to re-fetch the model list.
      </DocCallout>

      <h2 id="filtering">Filtering by Provider</h2>
      <p>
        In the Agent Settings page, use the provider filter to narrow down available models. Selecting a provider shows only that provider's models. This is useful when you've configured multiple providers and want to quickly find the right model.
      </p>

      <h2 id="model-list">Complete Model List</h2>

      <h3 id="openai-models">OpenAI Models</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Context Window</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost Tier</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o</td>
              <td className="py-2 pr-4">128K</td>
              <td className="py-2 pr-4">General purpose, tool use</td>
              <td className="py-2">Mid</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o-mini</td>
              <td className="py-2 pr-4">128K</td>
              <td className="py-2 pr-4">High-volume, fast responses</td>
              <td className="py-2">Low</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4.1</td>
              <td className="py-2 pr-4">1M</td>
              <td className="py-2 pr-4">Long context, code generation</td>
              <td className="py-2">Mid-High</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">o1</td>
              <td className="py-2 pr-4">200K</td>
              <td className="py-2 pr-4">Reasoning, analysis</td>
              <td className="py-2">High</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">o3</td>
              <td className="py-2 pr-4">200K</td>
              <td className="py-2 pr-4">Complex reasoning</td>
              <td className="py-2">High</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="anthropic-models">Anthropic Models</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Context Window</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost Tier</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude Sonnet 4</td>
              <td className="py-2 pr-4">200K</td>
              <td className="py-2 pr-4">Balanced performance</td>
              <td className="py-2">Mid</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude Opus 4</td>
              <td className="py-2 pr-4">200K</td>
              <td className="py-2 pr-4">Complex instructions</td>
              <td className="py-2">High</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3.5 Haiku</td>
              <td className="py-2 pr-4">200K</td>
              <td className="py-2 pr-4">Fast, real-time</td>
              <td className="py-2">Low</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="google-models">Google Models</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Context Window</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost Tier</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 2.5 Pro</td>
              <td className="py-2 pr-4">1M</td>
              <td className="py-2 pr-4">Multimodal, long context</td>
              <td className="py-2">Low-Mid</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 2.5 Flash</td>
              <td className="py-2 pr-4">1M</td>
              <td className="py-2 pr-4">Fast, cost-effective</td>
              <td className="py-2">Low</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="groq-models">Groq Models</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Context Window</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost Tier</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Llama 3.3 70B</td>
              <td className="py-2 pr-4">128K</td>
              <td className="py-2 pr-4">Ultra-fast inference</td>
              <td className="py-2">Low</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Mixtral 8x7B</td>
              <td className="py-2 pr-4">32K</td>
              <td className="py-2 pr-4">Fast, multilingual</td>
              <td className="py-2">Low</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="capabilities">Model Capabilities Comparison</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Capability</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">OpenAI</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Anthropic</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Google</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Groq</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Tool Use</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Good</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Structured Output</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Good</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Multilingual</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2">Good</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Long Context</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2">Limited</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Inference Speed</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2">Ultra Fast</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Using Different Providers"
          href="/docs/using-different-providers"
        />
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limits & Quotas"
          href="/docs/rate-limits"
        />
      </DocCardGrid>
    </DocContent>
  )
}
