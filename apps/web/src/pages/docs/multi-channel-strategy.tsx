import { Globe, Smartphone, Monitor, Zap, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function MultiChannelStrategyPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Multi-Channel Strategy' },
        ]}
        title="Multi-Channel Strategy"
        description="Deliver consistent, channel-appropriate experiences across WhatsApp, web chat, Discord, and more."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Your users interact with you across multiple platforms — WhatsApp for quick questions, web chat for detailed support, Discord for community engagement. A multi-channel strategy ensures your agent provides a consistent experience while adapting to each channel's strengths and limitations.
      </p>
      <p>
        Convio's agent deployment model lets you configure channel-specific behavior while maintaining a single source of truth for knowledge and conversation history.
      </p>

      <h2 id="consistency">Consistent Experience Across Channels</h2>
      <p>
        Regardless of the channel, users should receive the same quality of response. Maintain consistency by:
      </p>
      <ul>
        <li><strong>Shared knowledge base:</strong> Use the same knowledge base across all channels so answers stay consistent.</li>
        <li><strong>Shared system prompt:</strong> Define your agent's core behavior once. Add channel-specific overrides only where necessary.</li>
        <li><strong>Shared conversation history:</strong> When a user switches channels, the agent should retain context from previous interactions.</li>
      </ul>

      <DocCallout variant="tip" icon={Zap} title="Single source of truth">
        Your knowledge base and agent prompt should be authored once and deployed to all channels. Channel-specific overrides should be minimal — response length, formatting preferences, and media support.
      </DocCallout>

      <h2 id="channel-adaptations">Channel-Specific Adaptations</h2>
      <p>
        Each channel has unique constraints. Adapt your agent's behavior without changing its core knowledge:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Channel</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Strengths</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Limitations</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Adaptations</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">WhatsApp</td>
              <td className="py-2 pr-4">Ubiquitous, mobile-native, media support</td>
              <td className="py-2 pr-4">Character limits, no markdown tables</td>
              <td className="py-2">Keep responses under 500 chars. Use bullet points instead of tables.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Web Chat</td>
              <td className="py-2 pr-4">Rich formatting, longer responses, file uploads</td>
              <td className="py-2 pr-4">Requires website visit</td>
              <td className="py-2">Support detailed answers with markdown, code blocks, and links.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Discord</td>
              <td className="py-2 pr-4">Community context, thread support, rich embeds</td>
              <td className="py-2 pr-4">Character limits, public conversations</td>
              <td className="py-2">Use threads for detailed discussions. Avoid sharing private info in public channels.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">API</td>
              <td className="py-2 pr-4">Full control, programmatic access</td>
              <td className="py-2 pr-4">No built-in UI</td>
              <td className="py-2">Return structured responses. Let the calling application handle display.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="channel-comparison">Channel Selection Guide</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp"
          description="Best for customer support in regions where WhatsApp dominates. Ideal for quick Q&A, order updates, and appointment confirmations."
          href="/docs/whatsapp-twilio"
        />
        <DocFeatureCard
          icon={Monitor}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Web Widget"
          description="Best for on-site support. Integrates with your website for contextual help, lead capture, and detailed troubleshooting."
          href="/docs/creating-widget"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Discord"
          description="Best for community engagement and support. Leverages threads for organized discussions and moderation tools for community management."
          href="/docs/discord-integration"
        />
      </DocCardGrid>

      <h2 id="deployment-strategy">Deployment Strategy</h2>
      <p>
        When deploying across multiple channels, follow this sequence:
      </p>
      <ol>
        <li><strong>Start with one channel:</strong> Perfect your agent on a single channel before expanding. Web chat is usually the easiest to test.</li>
        <li><strong>Add a second channel:</strong> Deploy to a second channel with minimal overrides. Compare performance metrics across channels.</li>
        <li><strong>Optimize per channel:</strong> Use analytics to identify channel-specific issues and adjust overrides accordingly.</li>
        <li><strong>Monitor holistically:</strong> Track cross-channel metrics to ensure the overall experience stays consistent as you scale.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={WhatsAppIcon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Integration"
          href="/docs/whatsapp-twilio"
        />
        <DocNextStepCard
          icon={Monitor}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Setup"
          href="/docs/creating-widget"
        />
      </DocCardGrid>
    </DocContent>
  )
}
