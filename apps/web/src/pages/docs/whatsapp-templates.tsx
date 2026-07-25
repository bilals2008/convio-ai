import { Link } from 'react-router-dom'
import { FileText, Tag, Clock, Users, AlertCircle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WhatsAppTemplatesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'WhatsApp Templates & Broadcasts' },
        ]}
        title="WhatsApp Templates & Broadcasts"
        description="Create message templates for outbound campaigns. Schedule broadcasts, target specific audiences, and track delivery."
      />

      <h2 id="overview">Overview</h2>
      <p>
        WhatsApp requires pre-approved message templates for outbound messages — messages you initiate rather than reply to. Templates enable broadcasts, notifications, and re-engagement campaigns at scale.
      </p>

      <DocCallout variant="warning" icon={AlertCircle} title="Template approval required">
        All templates must be approved by WhatsApp before they can be used. Rejected templates cannot send messages. Approval typically takes 24-48 hours.
      </DocCallout>

      <h2 id="creating-templates">Creating Message Templates</h2>
      <p>
        Templates are created through the Meta Business Manager and submitted for approval. Each template has:
      </p>
      <ul>
        <li><strong>Name:</strong> A unique identifier using lowercase letters, numbers, and underscores (e.g., <code>order_confirmation</code>)</li>
        <li><strong>Language:</strong> The language the template is written in</li>
        <li><strong>Category:</strong> The template's purpose category</li>
        <li><strong>Body:</strong> The message content with optional variables</li>
        <li><strong>Buttons:</strong> Optional call-to-action or quick reply buttons</li>
      </ul>

      <h3 id="variables">Variables</h3>
      <p>
        Templates support dynamic content through variables. Use double curly braces to define placeholders:
      </p>
      <ul>
        <li><code>{'{{1}}'}</code> — First variable (e.g., customer name)</li>
        <li><code>{'{{2}}'}</code> — Second variable (e.g., order number)</li>
        <li><code>{'{{body}}'}</code> — Body variable for rich content</li>
      </ul>

      <p>Example: <code>Hi {'{{1}}'}, your order #{'{{2}}'} has been shipped and will arrive by {'{{3}}'}.</code></p>

      <h2 id="template-categories">Template Categories</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Tag}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Marketing"
          description="Promotional messages, product announcements, offers, and re-engagement campaigns. Highest per-template cost."
          href="#marketing"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Utility"
          description="Transaction updates, order confirmations, shipping notifications, appointment reminders. Lower cost than marketing."
          href="#utility"
        />
        <DocFeatureCard
          icon={Tag}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Authentication"
          description="One-time passwords and verification codes. Lowest per-message cost. Cannot include marketing content."
          href="#authentication"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
          title="Service"
          description="Replies within a 24-hour customer service window. No template approval needed for session messages."
          href="#service"
        />
      </DocCardGrid>

      <h2 id="scheduling-campaigns">Scheduling Campaigns</h2>
      <p>
        Once templates are approved, schedule broadcasts through the Convio dashboard:
      </p>
      <ol>
        <li><strong>Select a template:</strong> Choose from your approved templates</li>
        <li><strong>Define the audience:</strong> Target by tags, segments, or upload a contact list</li>
        <li><strong>Set the schedule:</strong> Choose immediate delivery or pick a future date and time</li>
        <li><strong>Map variables:</strong> Connect template variables to audience data fields</li>
        <li><strong>Review and confirm:</strong> Preview a sample message and confirm the broadcast</li>
      </ol>

      <h2 id="audience-targeting">Audience Targeting</h2>
      <p>
        Target broadcasts to specific audience segments:
      </p>
      <ul>
        <li><strong>Tags:</strong> Send to contacts with specific tags (e.g., "premium", "new-user")</li>
        <li><strong>Segments:</strong> Use predefined segments based on conversation history or metadata</li>
        <li><strong>Custom lists:</strong> Upload CSV files with phone numbers for targeted campaigns</li>
        <li><strong>Exclude lists:</strong> Exclude specific contacts from broadcasts</li>
      </ul>

      <DocCallout variant="tip" icon={Users} title="Respect opt-outs">
        Always include an opt-out option in marketing templates. Users who reply with "stop" or similar keywords are automatically excluded from future broadcasts.
      </DocCallout>

      <h2 id="broadcast-limits">Broadcast Limits</h2>
      <ul>
        <li><strong>New accounts:</strong> Limited to 250 unique recipients per 24 hours</li>
        <li><strong>Tier 1:</strong> 1,000 unique recipients per 24 hours</li>
        <li><strong>Tier 2:</strong> 10,000 unique recipients per 24 hours</li>
        <li><strong>Tier 3:</strong> 100,000 unique recipients per 24 hours</li>
      </ul>
      <p>
        Tier upgrades occur automatically as you send quality messages with low block/report rates.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Deployments"
          href="/docs/managing-deployments"
        />
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel-Specific Behavior"
          href="/docs/channel-behavior"
        />
      </DocCardGrid>
    </DocContent>
  )
}
