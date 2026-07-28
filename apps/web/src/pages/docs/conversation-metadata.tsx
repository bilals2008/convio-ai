import { Link } from 'react-router-dom'
import { Tag, Hash, User, Radio, Info } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ConversationMetadataPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Conversation Metadata' },
        ]}
        title="Conversation Metadata"
        description="Metadata enriches conversations with structured data — channel info, contact details, custom fields, and tags that power filtering, routing, and analytics."
      />

      <h2 id="what-is-metadata">What Is Conversation Metadata?</h2>
      <p>
        Metadata is structured data attached to a conversation that provides context beyond the message content. It includes automatically captured information (channel, timestamps) and user-defined fields (tags, custom attributes).
      </p>

      <h2 id="automatic-metadata">Automatically Captured Metadata</h2>
      <p>
        Convio captures the following metadata automatically for every conversation:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Field</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Description</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Example</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Channel</td>
              <td className="py-2 pr-4">Where the conversation originated</td>
              <td className="py-2">whatsapp, web, telegram</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Created At</td>
              <td className="py-2 pr-4">When the conversation was first created</td>
              <td className="py-2">2026-07-26T10:30:00Z</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Last Activity</td>
              <td className="py-2 pr-4">Timestamp of the most recent message</td>
              <td className="py-2">2026-07-26T11:45:00Z</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Message Count</td>
              <td className="py-2 pr-4">Total messages in the conversation</td>
              <td className="py-2">14</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Token Usage</td>
              <td className="py-2 pr-4">Total tokens consumed by the conversation</td>
              <td className="py-2">3,247</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Estimated Cost</td>
              <td className="py-2 pr-4">Calculated cost based on token usage and model pricing</td>
              <td className="py-2">$0.048</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Agent</td>
              <td className="py-2 pr-4">The AI agent handling the conversation</td>
              <td className="py-2">Support Agent — English</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="custom-metadata">Custom Metadata Fields</h2>
      <p>
        You can attach custom key-value pairs to conversations via the API. Custom metadata is useful for:
      </p>
      <ul>
        <li>Linking conversations to internal IDs (order number, ticket ID, user account)</li>
        <li>Storing routing preferences (department, priority level)</li>
        <li>Passing context from your system (subscription tier, account status)</li>
        <li>Enabling custom filtering and segmentation in analytics</li>
      </ul>

      <h3 id="setting-custom-metadata">Setting Custom Metadata</h3>
      <p>
        Use the conversations API to set custom metadata:
      </p>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4">
        <p className="text-[12px] font-mono text-muted-foreground">
          POST /conversations/:id/metadata<br />
          {'{'}<br />
          &nbsp;&nbsp;"order_id": "ORD-2024-789",<br />
          &nbsp;&nbsp;"department": "billing",<br />
          &nbsp;&nbsp;"priority": "high",<br />
          &nbsp;&nbsp;"account_tier": "enterprise"<br />
          {'}'}
        </p>
      </div>

      <DocCallout variant="tip" icon={Hash} title="Metadata is searchable">
        Custom metadata fields are fully indexed. You can filter conversations by any custom field in the dashboard search.
      </DocCallout>

      <h2 id="channel-information">Channel Information</h2>
      <p>
        Each conversation records detailed channel information:
      </p>
      <ul>
        <li><strong>Channel Type:</strong> web, whatsapp, telegram, api</li>
        <li><strong>Channel ID:</strong> The specific channel instance (e.g., WhatsApp phone number, Telegram bot)</li>
        <li><strong>External User ID:</strong> The user's identifier on the channel platform</li>
        <li><strong>Channel Metadata:</strong> Platform-specific data (WhatsApp phone number, Telegram username)</li>
      </ul>

      <h2 id="contact-info">Contact Information</h2>
      <p>
        When available, Convio stores contact information associated with the conversation:
      </p>
      <ul>
        <li><strong>Name:</strong> The contact's display name (from the channel profile or your CRM)</li>
        <li><strong>Email:</strong> Email address if collected during the conversation</li>
        <li><strong>Phone:</strong> Phone number (WhatsApp, SMS channels)</li>
        <li><strong>Avatar URL:</strong> Profile picture from the channel platform</li>
      </ul>

      <DocCallout variant="info" icon={User} title="Contact profiles">
        Contact information is linked to a Contact profile that persists across conversations. See <Link to="/docs/leads" className="text-primary hover:underline">Leads & Contact Management</Link>.
      </DocCallout>

      <h2 id="tags">Tags and Labels</h2>
      <p>
        Tags provide a flexible way to categorize and filter conversations:
      </p>
      <ul>
        <li><strong>Manual tags:</strong> Added by human agents from the conversation view</li>
        <li><strong>Auto tags:</strong> Applied by the AI agent based on conversation content (configurable)</li>
        <li><strong>System tags:</strong> Added automatically based on channel, status, or other criteria</li>
      </ul>

      <h3 id="tag-best-practices">Tag Best Practices</h3>
      <ul>
        <li>Use a consistent naming convention — lowercase, hyphen-separated (e.g., <code>billing-issue</code>, <code>feature-request</code>)</li>
        <li>Keep the tag list under 50 for performance</li>
        <li>Use tags for filtering and reporting, not for data that belongs in custom metadata</li>
        <li>Review and prune unused tags regularly</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Tag}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Leads & Contact Management"
          href="/docs/leads"
        />
        <DocNextStepCard
          icon={Info}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Search"
          href="/docs/conversation-search"
        />
      </DocCardGrid>
    </DocContent>
  )
}
