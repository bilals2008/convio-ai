import { Link } from 'react-router-dom'
import { Globe, Code, ArrowRight, Zap, Users } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function ChannelsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Channels Overview' },
        ]}
        title="Channels Overview"
        description="Deploy one agent across WhatsApp, Telegram, Discord, Slack, web widgets, and APIs. One brain, every surface."
      />

      <h2 id="architecture">One Agent, Many Channels</h2>
      <p>
        Convio's architecture separates your agent logic from the messaging surface. You configure your agent once — system prompt, model, tools, knowledge base — and deploy it to any supported channel. Each channel handles its own protocol, formatting, and quirks.
      </p>

      <DocCallout variant="tip" icon={Zap} title="No duplication">
        Changes to your agent's system prompt, model, or tools propagate to all active deployments instantly. No need to update each channel separately.
      </DocCallout>

      <h2 id="supported-channels">Supported Channels</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp"
          description="Reach customers on the world's most popular messaging app. Supports text, media, interactive buttons, and message templates."
          href="/docs/whatsapp-integration"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram"
          description="Fast, developer-friendly platform with inline keyboards, rich media support, and a built-in bot ecosystem."
          href="/docs/telegram-integration"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord"
          description="Deploy to Discord servers with slash commands, thread support, and server-specific configuration."
          href="/docs/discord-integration"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Slack"
          description="Integrate into workspaces with event subscriptions, bot tokens, and app manifest-based setup."
          href="/docs/slack-integration"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
          title="Web Widget"
          description="Embed a chat widget directly on your website. Customizable appearance, no backend required."
          href="#web-widget"
        />
        <DocFeatureCard
          icon={Code}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="API"
          description="Programmatic access to your agent via REST endpoints. Build custom integrations and connect any platform."
          href="#api"
        />
      </DocCardGrid>

      <h2 id="how-routing-works">How Routing Works</h2>
      <p>
        When a message arrives on any channel, Convio routes it to the correct agent based on the deployment configuration. The channel adapter normalizes the incoming message into a standard format, passes it to the agent, and converts the response back to the channel's expected format.
      </p>
      <ul>
        <li><strong>Inbound:</strong> Channel adapter receives message → normalizes to standard format → routes to agent</li>
        <li><strong>Outbound:</strong> Agent generates response → channel adapter converts to platform format → delivers to user</li>
        <li><strong>Context:</strong> Conversation history is shared across channels if linked to the same contact</li>
      </ul>

      <h2 id="channel-specific">Channel-Specific Considerations</h2>
      <p>
        Each channel has unique constraints that affect how your agent communicates. See <Link to="/docs/channel-behavior" className="text-primary hover:underline">Channel-Specific Behavior</Link> for detailed adaptation rules.
      </p>
      <ul>
        <li><strong>Message length:</strong> WhatsApp limits messages to 4,096 characters; Discord allows 2,000; Telegram supports 4,096</li>
        <li><strong>Media support:</strong> All channels support images; WhatsApp and Telegram support documents and audio</li>
        <li><strong>Interactive elements:</strong> WhatsApp supports reply buttons and list messages; Discord supports slash commands; Telegram supports inline keyboards</li>
        <li><strong>Rich formatting:</strong> Discord and Slack support Markdown; WhatsApp uses limited formatting; Telegram supports HTML or Markdown</li>
      </ul>

      <h2 id="choosing-channel">Choosing the Right Channel</h2>
      <p>
        Your audience determines your channel. Consider where your users already spend time and what interaction patterns they expect.
      </p>
      <ul>
        <li><strong>Customer support:</strong> WhatsApp for B2C, Slack for B2B, web widget for website visitors</li>
        <li><strong>Internal tools:</strong> Slack or Discord for team-facing agents</li>
        <li><strong>Automation/API:</strong> REST API for programmatic integrations and custom frontends</li>
        <li><strong>Broadcasts:</strong> WhatsApp templates for opt-in audiences, Telegram for channels</li>
      </ul>

      <h2 id="web-widget">Web Widget</h2>
      <p>
        The web widget is an embeddable chat component for your website. Add a single script tag to your HTML and your agent is live. The widget handles connection, message history, and responsive layout automatically.
      </p>

      <h2 id="api">API Access</h2>
      <p>
        The REST API provides programmatic access to your agent. Send messages, retrieve conversation history, and manage deployments via HTTP requests. See the API reference for endpoints and authentication details.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp Integration"
          href="/docs/whatsapp-integration"
        />
        <DocNextStepCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram Integration"
          href="/docs/telegram-integration"
        />
      </DocCardGrid>
    </DocContent>
  )
}
