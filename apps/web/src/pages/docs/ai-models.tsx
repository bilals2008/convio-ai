import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Zap, DollarSign, Shield, Globe, Server } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AIModelsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'AI Models' },
        ]}
        title="Choosing an AI Model"
        description="Convio supports multiple AI providers. Choose the model that fits your latency, quality, and budget requirements."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The model is the reasoning engine behind your agent. Different models have different strengths — some excel at nuanced conversation, others at speed, and others at cost efficiency. Convio lets you swap models per agent without changing anything else.
      </p>

      <h2 id="supported-providers">Supported Providers</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="OpenAI"
          description="GPT-4o, GPT-4o Mini, GPT-4 Turbo. Industry-leading general performance with strong tool use and structured output."
          href="#openai"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Anthropic"
          description="Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku. Excellent at following complex instructions and long-context reasoning."
          href="#anthropic"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Google"
          description="Gemini 1.5 Pro, Gemini 1.5 Flash. Strong multimodal capabilities and competitive pricing at scale."
          href="#google"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Groq"
          description="Llama 3, Mixtral on Groq hardware. Ultra-low latency inference — ideal for real-time conversational agents."
          href="#groq"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="OpenRouter"
          description="Access to 100+ models through a single API. Useful for testing and switching between providers without multiple API keys."
          href="#openrouter"
        />
        <DocFeatureCard
          icon={Server}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Local / Self-hosted"
          description="Run models on your own infrastructure via Ollama or any OpenAI-compatible endpoint. Full data control, no external API calls."
          href="#local"
        />
      </DocCardGrid>

      <h2 id="model-comparison">Model Comparison</h2>
      <p>
        A quick reference for the most commonly used models in Convio:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Provider</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Speed</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Quality</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cost</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o</td>
              <td className="py-2 pr-4">OpenAI</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2">Mid</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GPT-4o Mini</td>
              <td className="py-2 pr-4">OpenAI</td>
              <td className="py-2 pr-4">Very Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Low</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3.5 Sonnet</td>
              <td className="py-2 pr-4">Anthropic</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2">Mid</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3 Haiku</td>
              <td className="py-2 pr-4">Anthropic</td>
              <td className="py-2 pr-4">Very Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Low</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 1.5 Pro</td>
              <td className="py-2 pr-4">Google</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Very Good</td>
              <td className="py-2">Low-Mid</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 1.5 Flash</td>
              <td className="py-2 pr-4">Google</td>
              <td className="py-2 pr-4">Very Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Low</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Llama 3 70B</td>
              <td className="py-2 pr-4">Groq</td>
              <td className="py-2 pr-4">Ultra Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Low</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Mixtral 8x7B</td>
              <td className="py-2 pr-4">Groq</td>
              <td className="py-2 pr-4">Ultra Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Low</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="which-model-when">Which Model for Which Use Case</h2>
      <ul>
        <li><strong>Customer support (high volume):</strong> GPT-4o Mini or Claude 3 Haiku — fast responses, low cost, handles most queries well.</li>
        <li><strong>Complex reasoning:</strong> GPT-4o or Claude 3.5 Sonnet — better at multi-step reasoning, tool orchestration, and nuanced instructions.</li>
        <li><strong>Real-time chat:</strong> Groq-hosted models — sub-200ms response times for conversational flows.</li>
        <li><strong>Data-sensitive:</strong> Local/self-hosted models — no data leaves your infrastructure.</li>
        <li><strong>Multilingual:</strong> GPT-4o or Gemini 1.5 Pro — strong performance across languages.</li>
      </ul>

      <h2 id="cost-vs-quality">Cost vs Quality Tradeoffs</h2>
      <DocCallout variant="warning" icon={DollarSign} title="Cost scales with usage">
        Agent costs are per-token. A support agent handling 1,000 conversations/day with GPT-4o will cost significantly more than the same agent on GPT-4o Mini. Start with a smaller model and upgrade if quality is insufficient.
      </DocCallout>

      <p>
        Practical approach: start with a mid-tier model (GPT-4o or Claude 3.5 Sonnet) to establish a quality baseline, then experiment with cheaper alternatives. If the cheaper model maintains acceptable response quality, switch to it for production.
      </p>

      <h2 id="bring-your-own-key">Bring Your Own Key</h2>
      <p>
        Convio supports BYOK (Bring Your Own Key) for all providers. Connect your own API keys in Settings → Provider Keys. This means you pay the provider directly — Convio doesn't add markup on token usage.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing in the Playground"
          href="/docs/agent-playground"
        />
      </DocCardGrid>
    </DocContent>
  )
}
