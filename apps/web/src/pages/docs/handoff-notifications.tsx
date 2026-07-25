import { Link } from 'react-router-dom'
import { Bell, Mail, BellRing, Settings, Webhook } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function HandoffNotificationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Handoff Notifications' },
        ]}
        title="Handoff Notifications"
        description="How Convio notifies human agents and admins when conversations are escalated from the AI."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When a conversation is handed off, the right people need to know immediately. Convio supports multiple notification channels — in-app, email, browser push, and webhooks — with per-priority and per-agent preferences.
      </p>

      <h2 id="in-app">In-App Alerts</h2>
      <p>
        Real-time notifications inside the Convio dashboard. These appear as:
      </p>
      <ul>
        <li><strong>Notification bell:</strong> A badge counter on the bell icon in the top navigation bar</li>
        <li><strong>Toast notifications:</strong> Pop-up alerts that appear in the bottom-right corner</li>
        <li><strong>Inbox badge:</strong> A count of unviewed conversations on the Inbox sidebar item</li>
        <li><strong>Sound alert:</strong> Optional audio notification for urgent handoffs</li>
      </ul>

      <DocCallout variant="info" icon={Bell} title="Real-time updates">
        In-app notifications are delivered via WebSocket. They appear instantly — no refresh required.
      </DocCallout>

      <h2 id="email">Email Notifications</h2>
      <p>
        When a conversation is assigned to you, Convio sends an email with:
      </p>
      <ul>
        <li>Conversation summary and escalation reason</li>
        <li>User identifier and channel</li>
        <li>Direct link to the conversation in the dashboard</li>
        <li>Priority level and SLA target</li>
      </ul>

      <h3 id="email-config">Email Configuration</h3>
      <p>
        Configure email notifications in <strong>Settings → Notifications → Email</strong>:
      </p>
      <ul>
        <li><strong>Per-priority:</strong> Choose which priority levels trigger emails (default: Urgent and High)</li>
        <li><strong>Batching:</strong> Optionally batch multiple handoff emails into a digest (hourly or daily)</li>
        <li><strong>Quiet hours:</strong> Suppress non-urgent emails during configured hours</li>
      </ul>

      <h2 id="browser-push">Browser Push Notifications</h2>
      <p>
        Browser push notifications appear even when you're not on the Convio dashboard. They require browser permission and work on desktop Chrome, Firefox, Edge, and Safari.
      </p>
      <ul>
        <li>Click "Enable Notifications" when prompted by the browser</li>
        <li>Each notification includes the conversation preview and a direct link</li>
        <li>Click the notification to open the conversation in the dashboard</li>
      </ul>

      <DocCallout variant="tip" icon={BellRing} title="Enable browser push for urgent handoffs">
        Browser push is especially useful for remote teams. You don't need to keep the dashboard open to stay informed about urgent escalations.
      </DocCallout>

      <h2 id="webhooks">Webhook Notifications</h2>
      <p>
        For custom integrations, Convio can send webhook payloads to your endpoint when a handoff occurs. This is useful for integrating with Slack, Microsoft Teams, PagerDuty, or custom tooling.
      </p>

      <h3 id="webhook-payload">Webhook Payload</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Field</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Type</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">event</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">"conversation.escalated"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">conversation_id</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">Unique conversation identifier</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">assigned_to</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">Agent ID or "unassigned"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">priority</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">"urgent", "high", "normal", or "low"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">reason</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">Why the handoff was triggered</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">summary</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">AI-generated conversation summary</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="preferences">Notification Preferences</h2>
      <p>
        Each agent configures their own notification preferences in <strong>Settings → Notifications</strong>:
      </p>
      <ul>
        <li><strong>Per-channel:</strong> Enable or disable in-app, email, browser push, and webhook independently</li>
        <li><strong>Per-priority:</strong> Choose which priority levels trigger each notification type</li>
        <li><strong>Quiet hours:</strong> Set hours when only urgent notifications are delivered</li>
        <li><strong>Team-level:</strong> Admins can set default notification policies for all agents</li>
      </ul>

      <DocCallout variant="warning" icon={Settings} title="Don't suppress everything">
        Agents who disable all notifications miss handoffs. Set a minimum: at least in-app notifications for all priorities, and email for Urgent.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Bell}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Handoff Best Practices"
          href="/docs/handoff-best-practices"
        />
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
      </DocCardGrid>
    </DocContent>
  )
}
