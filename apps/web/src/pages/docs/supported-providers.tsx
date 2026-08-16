import { Cpu, Shield, Zap, Globe, Server, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SupportedProvidersPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Supported Providers' },
        ]}
        title="Supported Providers"
        description="Convio supports multiple AI providers. Choose the one that fits your performance, quality, and budget needs."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Each AI provider has different strengths. Convio integrates with all major providers so you can pick the best model for each agent — or mix providers across your organization. You can use Convio's managed API or connect your own keys via BYOK.
      </p>

      <h2 id="openai">OpenAI</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="GPT-4o"
          description="Flagship model. Excellent at complex reasoning, tool use, and structured output. Best overall quality for conversational agents."
          href="#openai"
        />
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="GPT-4o-mini"
          description="Cost-effective variant. Fast responses with good quality. Ideal for high-volume support agents where speed and cost matter."
          href="#openai"
        />
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="GPT-4.1"
          description="Latest generation with improved instruction following and longer context. Strong at multi-step tasks and code generation."
          href="#openai"
        />
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="o1"
          description="Reasoning model. Excels at complex analysis, math, and coding tasks. Uses chain-of-thought for deeper reasoning."
          href="#openai"
        />
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="o3"
          description="Advanced reasoning model. Best for tasks requiring multi-step logical analysis and problem solving."
          href="#openai"
        />
      </DocCardGrid>

      <p className="mt-4">
        <strong>API base:</strong> <code>https://api.openai.com/v1</code>
      </p>

      <h2 id="anthropic">Anthropic</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Claude Sonnet 4"
          description="Balanced performance and speed. Excellent instruction following, strong at tool use, and handles long conversations well."
          href="#anthropic"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Claude Opus 4"
          description="Most capable Anthropic model. Best for complex reasoning, nuanced instructions, and tasks requiring deep analysis."
          href="#anthropic"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Claude 3.5 Haiku"
          description="Fastest Anthropic model. Great for real-time conversational agents where low latency is critical."
          href="#anthropic"
        />
      </DocCardGrid>

      <p className="mt-4">
        <strong>API base:</strong> <code>https://api.anthropic.com/v1</code>
      </p>

      <h2 id="google">Google</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Gemini 2.5 Pro"
          description="Google's most capable model. Strong multimodal support, large context window, and competitive pricing at scale."
          href="#google"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Gemini 2.5 Flash"
          description="Optimized for speed and cost. Fast inference with good quality. Ideal for high-throughput conversational applications."
          href="#google"
        />
      </DocCardGrid>

      <p className="mt-4">
        <strong>API base:</strong> <code>https://generativelanguage.googleapis.com/v1beta</code>
      </p>

      <h2 id="groq">Groq</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Llama 3.3 70B"
          description="Meta's open-source model on Groq hardware. Ultra-low latency inference — sub-200ms response times."
          href="#groq"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Mixtral 8x7B"
          description="Mixture-of-experts model. Fast inference with strong multilingual and reasoning capabilities."
          href="#groq"
        />
      </DocCardGrid>

      <DocCallout variant="info" icon={Zap} title="Groq is fast">
        Groq uses custom LPU hardware for inference. Response times are consistently under 200ms, making it ideal for real-time conversational agents where latency matters most.
      </DocCallout>

      <h2 id="openrouter">OpenRouter</h2>
      <p>
        OpenRouter provides a single API endpoint to access 100+ models from multiple providers. Useful when you want to experiment with different models without managing multiple API keys.
      </p>
      <ul>
        <li><strong>Access:</strong> Single API key for all models on the platform.</li>
        <li><strong>Routing:</strong> Automatic failover between providers for the same model.</li>
        <li><strong>Pricing:</strong> Pass-through pricing — you pay the provider's rate plus a small fee.</li>
      </ul>

      <h2 id="local">Local / Self-hosted</h2>
      <p>
        Run models on your own infrastructure for full data control. Convio supports any OpenAI-compatible endpoint, including Ollama, vLLM, and llama.cpp servers.
      </p>
      <ul>
        <li><strong>No data leaves your network:</strong> All inference happens on your hardware.</li>
        <li><strong>No API costs:</strong> Pay only for compute, no per-token charges.</li>
        <li><strong>Full control:</strong> Choose any model, tune parameters, and configure as needed.</li>
      </ul>

      <h2 id="openai-compatible">OpenCode (Development)</h2>
      <p>
        OpenCode provides development models for testing and building within the Convio platform. These models are available for development purposes and are not intended for production workloads.
      </p>

      <h2 id="comparison">Provider Comparison</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Provider</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Speed</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Quality</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Cost</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Best For</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Mid-High</td>
              <td className="py-2">General purpose, tool use</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Anthropic</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2 pr-4">Mid-High</td>
              <td className="py-2">Complex instructions</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Google</td>
              <td className="py-2 pr-4">Fast</td>
              <td className="py-2 pr-4">Very Good</td>
              <td className="py-2 pr-4">Low-Mid</td>
              <td className="py-2">Multimodal, scale</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Groq</td>
              <td className="py-2 pr-4">Ultra Fast</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2 pr-4">Low</td>
              <td className="py-2">Real-time chat</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenRouter</td>
              <td className="py-2 pr-4">Varies</td>
              <td className="py-2 pr-4">Varies</td>
              <td className="py-2 pr-4">Varies</td>
              <td className="py-2">Multi-provider testing</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Local</td>
              <td className="py-2 pr-4">Hardware dependent</td>
              <td className="py-2 pr-4">Varies</td>
              <td className="py-2 pr-4">Compute only</td>
              <td className="py-2">Data-sensitive, offline</td>
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
          title="Adding a Provider Key"
          href="/docs/adding-provider-key"
        />
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Available Models"
          href="/docs/available-models"
        />
      </DocCardGrid>
    </DocContent>
  )
}
