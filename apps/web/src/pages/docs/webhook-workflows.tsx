import { Users, BarChart3, Bell, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhookWorkflowsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Building Workflows with Webhooks' },
        ]}
        title="Building Workflows with Webhooks"
        description="Real-world integration patterns: CRM sync, ticketing systems, analytics pipelines, and notification systems."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Webhooks turn Convio from a standalone chat tool into a connected part of your infrastructure. Here are proven patterns for integrating Convio with your existing systems.
      </p>

      <h2 id="crm-integration">CRM Integration</h2>
      <p>
        Sync conversation and contact data with your CRM automatically:
      </p>
      <ul>
        <li><strong>conversation.created</strong> → Create or update a contact in HubSpot/Salesforce</li>
        <li><strong>message.received</strong> → Log the message as a activity on the contact record</li>
        <li><strong>conversation.updated</strong> → Update the deal stage based on conversation status</li>
      </ul>

      <DocCallout variant="tip" icon={Users} title="Hubspot example">
        <pre><code>{`app.post('/webhooks/convio', async (req, res) => {
  const event = verifyAndParse(req)

  if (event.event === 'conversation.created') {
    await hubspot.contacts.create({
      phone: event.data.user.phone,
      properties: {
        convio_conversation_id: event.data.conversation_id,
        source: 'whatsapp'
      }
    })
  }

  res.status(200).json({ received: true })
})`}</code></pre>
      </DocCallout>

      <h2 id="ticketing">Ticketing System Integration</h2>
      <p>
        Auto-create support tickets when conversations need human attention:
      </p>
      <ul>
        <li><strong>conversation.updated</strong> (status: escalated) → Create a Zendesk ticket</li>
        <li><strong>agent.assigned</strong> → Assign the ticket to the corresponding agent</li>
        <li><strong>conversation.updated</strong> (status: resolved) → Close the ticket</li>
      </ul>

      <pre><code>{`if (event.event === 'conversation.updated' && event.data.changes.status?.to === 'escalated') {
  await zendesk.tickets.create({
    subject: \`Escalated conversation \${event.data.conversation_id}\`,
    description: 'Conversation escalated by AI agent',
    requestor_id: event.data.user.zendesk_id,
    tags: ['convio', 'escalated']
  })
}`}</code></pre>

      <h2 id="analytics-pipeline">Analytics Pipeline</h2>
      <p>
        Stream all events to your data warehouse for custom reporting:
      </p>
      <ul>
        <li>Subscribe to all events on a dedicated webhook endpoint</li>
        <li>Write events to a staging table (S3, BigQuery, or Postgres)</li>
        <li>Run aggregation queries on a schedule</li>
        <li>Build dashboards on top of the aggregated data</li>
      </ul>

      <DocCallout variant="info" icon={BarChart3} title="Volume handling">
        For high-volume analytics, use a message queue (Kafka, SQS) between the webhook handler and your data warehouse. This decouples ingestion from processing.
      </DocCallout>

      <h2 id="notification-systems">Notification Systems</h2>
      <p>
        Alert your team in real time when important events happen:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Bell}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Slack Notifications"
          description="Post to a Slack channel when conversations are created, escalated, or resolved. Use Slack's incoming webhooks."
          href="#slack"
        />
        <DocFeatureCard
          icon={Bell}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Email Alerts"
          description="Send email notifications for high-priority events. Use SendGrid, SES, or any email API."
          href="#email"
        />
        <DocFeatureCard
          icon={Bell}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="PagerDuty / Opsgenie"
          description="Page on-call engineers when deployments disconnect or critical conversations fail."
          href="#pagerduty"
        />
      </DocCardGrid>

      <h3 id="slack">Slack Notification Example</h3>
      <pre><code>{`if (event.event === 'conversation.created') {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: \`New conversation from \${event.data.user.name}\`,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: \`*New Conversation*\\nFrom: \${event.data.user.name}\\nChannel: \${event.data.channel}\`
        }
      }]
    })
  })
}`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Available Webhook Events"
          href="/docs/webhook-events"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhook Security"
          href="/docs/webhook-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
