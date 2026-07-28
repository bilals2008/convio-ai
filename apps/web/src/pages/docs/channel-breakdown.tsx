import { Smartphone, Globe, ArrowRight, TrendingUp, Users, Clock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function ChannelBreakdownPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Channel Breakdown' },
        ]}
        title="Channel Breakdown"
        description="Compare agent performance across WhatsApp, web widget, Discord, and other channels."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Channel breakdown analytics show how your agents perform on each communication channel. This helps you identify channel-specific issues, optimize per-channel configurations, and allocate resources where they matter most.
      </p>

      <h2 id="channels">Channel Performance</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp"
          description="Performance metrics for WhatsApp Business integration including template message delivery and response rates."
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Web Widget"
          description="On-site chat widget metrics including open rate, engagement, and conversation completion."
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Discord"
          description="Discord bot performance including server reach, command usage, and community engagement."
        />
      </DocCardGrid>

      <h2 id="per-channel-metrics">Per-Channel Metrics</h2>
      <p>
        For each channel, Convio tracks:
      </p>
      <ul>
        <li><strong>Conversations started:</strong> How many conversations originated on this channel</li>
        <li><strong>Avg response time:</strong> Response time specific to this channel's constraints</li>
        <li><strong>Success rate:</strong> Resolution rate for conversations on this channel</li>
        <li><strong>Token usage:</strong> Total tokens consumed by conversations on this channel</li>
        <li><strong>User satisfaction:</strong> Feedback scores specific to this channel</li>
      </ul>

      <h2 id="channel-comparison">Cross-Channel Comparison</h2>
      <p>
        The comparison table shows side-by-side metrics for all active channels:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Metric</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">WhatsApp</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Web Widget</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Discord</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Conversations</td>
              <td className="py-2 pr-4">3,421</td>
              <td className="py-2 pr-4">1,892</td>
              <td className="py-2">876</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Avg Response Time</td>
              <td className="py-2 pr-4">2.1s</td>
              <td className="py-2 pr-4">1.4s</td>
              <td className="py-2">1.8s</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Success Rate</td>
              <td className="py-2 pr-4">89.3%</td>
              <td className="py-2 pr-4">92.1%</td>
              <td className="py-2">85.7%</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Avg Tokens/Conv</td>
              <td className="py-2 pr-4">2,340</td>
              <td className="py-2 pr-4">1,890</td>
              <td className="py-2">2,150</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="channel-specific">Channel-Specific Considerations</h2>
      <h3 id="whatsapp">WhatsApp</h3>
      <p>
        WhatsApp messages have a 24-hour response window. Conversations that exceed this window require template messages to re-engage. Monitor the response window compliance in your analytics.
      </p>

      <h3 id="web-widget">Web Widget</h3>
      <p>
        Web widget metrics include visitor-level data: open rate, bounce rate, and messages per conversation. These metrics are not available for other channels since they lack a page-view context.
      </p>

      <h3 id="discord">Discord</h3>
      <p>
        Discord conversations may span multiple channels or threads. The analytics aggregate all interactions per user into a single conversation for consistent measurement.
      </p>

      <DocCallout variant="info" icon={TrendingUp} title="Channel optimization">
        If one channel has significantly lower success rate, check for channel-specific issues like message length limits, media support, or rate limiting before assuming agent quality problems.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channels Overview"
          href="/docs/channels"
        />
        <DocNextStepCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Per-Agent Analytics"
          href="/docs/per-agent-analytics"
        />
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Date Ranges"
          href="/docs/date-ranges"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Exporting Analytics"
          href="/docs/exporting-analytics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
