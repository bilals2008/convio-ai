import { Zap, Radio, Webhook, Clock, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AutomationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Automations & Webhooks' },
        ]}
        title="Automations & Webhooks"
        description="Automate repetitive tasks, trigger workflows from external events, and connect Convio to the tools you already use."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio's automation system lets you reduce manual work and respond to events in real time. Broadcasts let you message thousands of users at once. Webhooks let external systems react to events inside Convio. Together, they turn your AI agent from a standalone tool into an integrated part of your stack.
      </p>

      <h2 id="automation-types">Automation Types</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Broadcasts"
          description="Send WhatsApp messages to segmented audiences on a schedule. Promotional campaigns, announcements, and re-engagement."
          href="/docs/broadcasts"
        />
        <DocFeatureCard
          icon={Webhook}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Webhooks"
          description="Receive HTTP callbacks when events happen in Convio. Push data to your CRM, trigger ticketing systems, or build custom workflows."
          href="/docs/webhooks"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Scheduled Tasks"
          description="Run actions on a schedule — sync contact lists, generate reports, or trigger broadcasts at optimal times."
          href="#scheduled"
        />
      </DocCardGrid>

      <h2 id="use-cases">Common Use Cases</h2>
      <ul>
        <li><strong>Lead nurturing:</strong> Send a drip sequence of WhatsApp messages to new sign-ups over 7 days</li>
        <li><strong>Event promotion:</strong> Broadcast event details to segmented audiences with RSVP tracking</li>
        <li><strong>CRM sync:</strong> Push conversation data to HubSpot or Salesforce via webhooks on every new conversation</li>
        <li><strong>Ticket creation:</strong> Auto-create Zendesk tickets when agents escalate conversations</li>
        <li><strong>Analytics pipelines:</strong> Stream message events to your data warehouse for custom reporting</li>
        <li><strong>Slack notifications:</strong> Alert your team in a Slack channel when a high-priority conversation starts</li>
      </ul>

      <DocCallout variant="tip" icon={Zap} title="Event-driven architecture">
        Webhooks follow a push model — Convio sends events to your endpoint as they happen. No polling, no delays.
      </DocCallout>

      <h2 id="how-automations-fit">How Automations Fit Together</h2>
      <p>
        Automations in Convio work at two levels: <strong>outbound</strong> (broadcasts push messages to users) and <strong>inbound</strong> (webhooks receive events from Convio). Most teams use both — broadcasts for user-facing campaigns, webhooks for internal system integration.
      </p>
      <ul>
        <li><strong>Broadcasts</strong> are managed from the dashboard with scheduling, templates, and audience tools</li>
        <li><strong>Webhooks</strong> are configured per-organization with event subscriptions, secret tokens, and retry policies</li>
        <li><strong>Scheduled tasks</strong> combine both — a webhook can trigger a broadcast, or a broadcast can run on a cron schedule</li>
      </ul>

      <DocCallout variant="info" icon={Shield} title="Permission scoping">
        All automations respect your organization's permission model. Broadcasts require messaging permissions. Webhook management requires admin access.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Broadcasts"
          href="/docs/broadcasts"
        />
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhooks Overview"
          href="/docs/webhooks"
        />
      </DocCardGrid>
    </DocContent>
  )
}
