import { Key, Shield, DollarSign, Lock, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function BYOKPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Bring Your Own Key (BYOK)' },
        ]}
        title="Bring Your Own Key (BYOK)"
        description="Connect your own AI provider API keys to Convio. Pay providers directly with no markup."
      />

      <h2 id="what-is-byok">What is BYOK?</h2>
      <p>
        BYOK (Bring Your Own Key) lets you connect your own API keys from AI providers like OpenAI, Anthropic, Google, and others directly to Convio. Instead of using Convio's managed API credits, your agents call providers using your personal or organizational API keys.
      </p>
      <p>
        When BYOK is enabled, Convio passes your key to the provider on each request. You are billed directly by the provider at their published rates — Convio does not add any markup or fees on token usage.
      </p>

      <h2 id="why-use-byok">Why Use Your Own API Keys</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={DollarSign}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Cost Control"
          description="Pay providers directly at their published rates. No middleman markup. Monitor usage through your provider's dashboard."
          href="#cost-control"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Full Control"
          description="Set spending limits, configure rate limits, and manage billing directly with each provider. No dependency on Convio's billing cycle."
          href="#full-control"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Privacy"
          description="Your keys stay in your org's encrypted storage. Each request goes directly from Convio to the provider with your credentials."
          href="#data-privacy"
        />
      </DocCardGrid>

      <h2 id="cost-control">Cost Control Benefits</h2>
      <p>
        With BYOK, you have complete visibility into your AI spending. Each provider offers its own billing dashboard where you can track token usage, set spending alerts, and configure hard spending limits.
      </p>
      <ul>
        <li><strong>Direct billing:</strong> Charges appear on your provider account, not through Convio.</li>
        <li><strong>Spending caps:</strong> Set hard limits at the provider level to prevent unexpected costs.</li>
        <li><strong>Usage analytics:</strong> Access detailed usage breakdowns per model and per request in the provider's console.</li>
        <li><strong>No lock-in:</strong> Remove your key at any time. Your agents switch back to Convio's managed credits seamlessly.</li>
      </ul>

      <DocCallout variant="tip" icon={DollarSign} title="Cost optimization tip">
        Start with a cheaper model like GPT-4o Mini or Claude 3.5 Haiku for high-volume agents. Upgrade to more capable models only where quality matters. With BYOK, switching models costs nothing — you just change the agent's model setting.
      </DocCallout>

      <h2 id="supported-providers">Supported Providers</h2>
      <p>
        Convio supports BYOK for all integrated AI providers. You can add keys for multiple providers simultaneously and assign different providers to different agents.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Provider</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Key Format</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Obtained From</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI</td>
              <td className="py-2 pr-4 font-mono text-[12px]">sk-...</td>
              <td className="py-2">platform.openai.com</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Anthropic</td>
              <td className="py-2 pr-4 font-mono text-[12px]">sk-ant-...</td>
              <td className="py-2">console.anthropic.com</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Google</td>
              <td className="py-2 pr-4 font-mono text-[12px]">AIza...</td>
              <td className="py-2">aistudio.google.com</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Groq</td>
              <td className="py-2 pr-4 font-mono text-[12px]">gsk_...</td>
              <td className="py-2">console.groq.com</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenRouter</td>
              <td className="py-2 pr-4 font-mono text-[12px]">sk-or-...</td>
              <td className="py-2">openrouter.ai</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Local</td>
              <td className="py-2 pr-4 font-mono text-[12px]">N/A</td>
              <td className="py-2">Self-hosted endpoint</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="how-to-add">How to Add Your Key</h2>
      <p>
        Navigate to <strong>Settings → Provider Keys</strong> in your Convio dashboard. Click "Add Key," select the provider, paste your API key, and save. Keys are encrypted at rest and only used when routing requests to that provider.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Adding a Provider Key"
          href="/docs/adding-provider-key"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Supported Providers"
          href="/docs/supported-providers"
        />
      </DocCardGrid>
    </DocContent>
  )
}
