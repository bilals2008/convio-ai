import { Radio, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CreatingBroadcastPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating a Broadcast' },
        ]}
        title="Creating a Broadcast"
        description="Step-by-step guide to composing, targeting, scheduling, and sending a WhatsApp broadcast campaign."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Creating a broadcast in Convio is a four-step process: choose a template, define your audience, configure scheduling, and preview before sending. Each step has validation to catch issues before they reach your users.
      </p>

      <h2 id="step-1-template">Step 1: Choose a Template</h2>
      <p>
        Start by selecting a WhatsApp-approved template message. Templates can include variables (like <code>{'{{1}}'}</code>) that get replaced with personalized content per recipient.
      </p>
      <ul>
        <li>Browse your approved templates in the template library</li>
        <li>Filter by category: promotional, transactional, or authentication</li>
        <li>Preview how the template renders with sample data</li>
        <li>If no template fits, submit a new one for WhatsApp approval (takes 24-48 hours)</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Template approval">
        Templates must be approved by WhatsApp before use. Rejected templates need revision and resubmission. Start early — approval isn't instant.
      </DocCallout>

      <h2 id="step-2-audience">Step 2: Define Your Audience</h2>
      <p>
        Target the right users by combining filters. Convio supports several audience segments:
      </p>
      <ul>
        <li><strong>Tags:</strong> Send to users with specific tags (e.g., "premium", "trial-active")</li>
        <li><strong>Conversation history:</strong> Target users who had conversations in the last N days</li>
        <li><strong>Custom fields:</strong> Filter by any custom field value stored on the contact</li>
        <li><strong>Engagement level:</strong> Segment by message frequency, response rate, or last active date</li>
        <li><strong>Exclude segments:</strong> Remove specific groups from the audience (e.g., existing customers for a new-user campaign)</li>
      </ul>

      <h2 id="step-3-variables">Step 3: Map Template Variables</h2>
      <p>
        If your template has variables, map them to contact fields or static values:
      </p>
      <ul>
        <li>Use contact fields for personalization: <code>{'{{1}}'}</code> → <code>contact.first_name</code></li>
        <li>Use static values for campaign-wide content: <code>{'{{2}}'}</code> → <code>"SUMMER2026"</code></li>
        <li>Preview each recipient's personalized message before sending</li>
      </ul>

      <h2 id="step-4-schedule">Step 4: Schedule Delivery</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Send Now"
          description="Broadcast begins sending immediately after confirmation. Messages are queued and delivered as fast as WhatsApp's API allows."
          href="#schedule-now"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Schedule for Later"
          description="Pick a date and time. Convio respects the recipient's timezone for optimal delivery windows."
          href="#schedule-later"
        />
      </DocCardGrid>

      <h3 id="schedule-now">Send Now</h3>
      <p>
        Click "Send Broadcast" and messages start queuing immediately. You'll see a live progress counter as messages are delivered.
      </p>

      <h3 id="schedule-later">Schedule for Later</h3>
      <p>
        Set a future date and time. Convio will queue the broadcast at the scheduled time. You can cancel or reschedule before the send window opens.
      </p>

      <h2 id="step-5-preview">Step 5: Preview and Test</h2>
      <p>
        Before sending to your full audience, send a test message to yourself or a small group:
      </p>
      <ul>
        <li>Send a test to up to 5 phone numbers</li>
        <li>Verify template rendering, variable substitution, and media attachments</li>
        <li>Test messages are free and don't count against your broadcast</li>
      </ul>

      <DocCallout variant="tip" icon={CheckCircle} title="Always test first">
        Send a test broadcast before every campaign. A missed variable or broken template is cheaper to catch at 5 recipients than 5,000.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Broadcasts"
          href="/docs/managing-broadcasts"
        />
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Templates"
          href="/docs/whatsapp-templates"
        />
      </DocCardGrid>
    </DocContent>
  )
}
