import { Radio, Users, Clock, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon } from '@/components/docs/brand-icons'

export default function BroadcastsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'WhatsApp Broadcasts' },
        ]}
        title="WhatsApp Broadcasts"
        description="Send targeted WhatsApp messages to large audiences. Promotional campaigns, announcements, and re-engagement sequences."
      />

      <h2 id="what-are-broadcasts">What Are Broadcasts?</h2>
      <p>
        Broadcasts let you send a single message to many recipients at once via WhatsApp. Unlike conversational messages, broadcasts are one-to-many — you compose a message, select an audience, and schedule delivery. Each recipient gets the message individually in their WhatsApp chat.
      </p>
      <p>
        Convio handles opt-out management, delivery tracking, and template compliance so you can focus on the content.
      </p>

      <DocCallout variant="info" icon={Radio} title="Template messages required">
        WhatsApp requires pre-approved template messages for business-initiated broadcasts. Convio helps you submit and track template approvals.
      </DocCallout>

      <h2 id="key-features">Key Features</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audience Targeting"
          description="Segment users by tags, conversation history, custom fields, or engagement level. Send to the right people."
          href="/docs/creating-broadcast"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Scheduling"
          description="Schedule broadcasts for optimal delivery times. Set one-time or recurring schedules with timezone awareness."
          href="/docs/creating-broadcast"
        />
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Template Messages"
          description="Use WhatsApp-approved templates with variables for personalization. Track approval status and manage your template library."
          href="/docs/whatsapp-templates"
        />
      </DocCardGrid>

      <h2 id="use-cases">Use Cases</h2>
      <ul>
        <li><strong>Product announcements:</strong> Notify users about new features, launches, or updates</li>
        <li><strong>Promotional campaigns:</strong> Send offers, discounts, or seasonal promotions to engaged users</li>
        <li><strong>Event reminders:</strong> Remind registrants about upcoming webinars, meetings, or deadlines</li>
        <li><strong>Re-engagement:</strong> Reach out to users who haven't interacted in 30+ days</li>
        <li><strong>Transactional updates:</strong> Send shipping confirmations, appointment reminders, or status updates</li>
        <li><strong>Surveys and feedback:</strong> Collect NPS scores or feedback via interactive messages</li>
      </ul>

      <h2 id="broadcast-lifecycle">Broadcast Lifecycle</h2>
      <ol>
        <li><strong>Draft:</strong> Compose your message, select template, define audience</li>
        <li><strong>Scheduled:</strong> Set delivery date and time, broadcast is queued</li>
        <li><strong>Sending:</strong> Messages are being delivered to WhatsApp's API</li>
        <li><strong>Complete:</strong> All messages delivered or failed, results available</li>
      </ol>

      <DocCallout variant="warning" icon={Shield} title="Opt-out compliance">
        Convio automatically excludes users who have opted out of WhatsApp communications. Never manually add opted-out users to a broadcast audience.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Broadcast"
          href="/docs/creating-broadcast"
        />
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Broadcasts"
          href="/docs/managing-broadcasts"
        />
      </DocCardGrid>
    </DocContent>
  )
}
