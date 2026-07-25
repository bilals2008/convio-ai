import { Link } from 'react-router-dom'
import { UserPlus, Contact, Target, Link2 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function LeadsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Leads & Contact Management' },
        ]}
        title="Leads & Contact Management"
        description="Capture lead information from conversations, build contact profiles, qualify leads, and integrate with your existing CRM."
      />

      <h2 id="capturing-leads">Capturing Lead Information</h2>
      <p>
        Every conversation has the potential to capture a new lead. Convio extracts contact information automatically and associates it with a Contact profile that persists across conversations.
      </p>

      <h3 id="auto-capture">Automatic Capture</h3>
      <p>
        Convio automatically captures lead information from:
      </p>
      <ul>
        <li><strong>Channel profiles:</strong> Name, phone number, and avatar from WhatsApp/Telegram</li>
        <li><strong>Web widget forms:</strong> Email and name collected via the pre-chat form (if enabled)</li>
        <li><strong>Conversation content:</strong> Email addresses and phone numbers mentioned in messages</li>
        <li><strong>API:</strong> Contact details passed via the conversations API</li>
      </ul>

      <DocCallout variant="tip" icon={UserPlus} title="Pre-chat forms">
        Enable the pre-chat form in your web widget settings to require name and email before a conversation starts. This guarantees every web conversation captures a lead.
      </DocCallout>

      <h2 id="contact-profiles">Contact Profiles</h2>
      <p>
        Each unique contact gets a profile that aggregates all their conversations and metadata. The profile includes:
      </p>
      <ul>
        <li><strong>Contact details:</strong> Name, email, phone, avatar</li>
        <li><strong>Conversation history:</strong> All conversations across all channels</li>
        <li><strong>Tags:</strong> Associated tags from any conversation</li>
        <li><strong>Custom fields:</strong> CRM-synced or manually entered data</li>
        <li><strong>First seen:</strong> When the contact first interacted with your agent</li>
        <li><strong>Last seen:</strong> Most recent activity timestamp</li>
      </ul>

      <h3 id="deduplication">Contact Deduplication</h3>
      <p>
        Convio deduplicates contacts across channels using a matching hierarchy:
      </p>
      <ol>
        <li><strong>Email address:</strong> Strongest match — same email across channels merges into one profile</li>
        <li><strong>Phone number:</strong> Matches WhatsApp and SMS contacts</li>
        <li><strong>Name + channel:</strong> Fallback for channels without email/phone (Telegram usernames)</li>
      </ol>

      <DocCallout variant="info" icon={Contact} title="Manual merging">
        If deduplication creates duplicate profiles, you can manually merge them from the Contacts page. All conversation history from both profiles is consolidated.
      </DocCallout>

      <h2 id="lead-qualification">Lead Qualification</h2>
      <p>
        Convio can qualify leads automatically based on conversation content. Configure qualification criteria in your agent's settings:
      </p>

      <h3 id="qualification-criteria">Qualification Criteria</h3>
      <ul>
        <li><strong>Intent detection:</strong> The AI identifies purchase intent, demo requests, or pricing inquiries</li>
        <li><strong>Company information:</strong> Extracts company name, size, and industry from conversation context</li>
        <li><strong>Budget signals:</strong> Detects budget-related language and qualifies accordingly</li>
        <li><strong>Timeline:</strong> Identifies urgency and decision timeline from user messages</li>
      </ul>

      <h3 id="lead-scoring">Lead Scoring</h3>
      <p>
        Qualified leads receive a score based on configured criteria. Scores range from 0-100 and factor in:
      </p>
      <ul>
        <li>Conversation depth (more messages = higher engagement)</li>
        <li>Explicit intent signals (e.g., "I want to buy", "schedule a demo")</li>
        <li>Company fit (if company data is available)</li>
        <li>Response patterns (quick replies indicate higher interest)</li>
      </ul>

      <h2 id="crm-integration">CRM Integration Patterns</h2>
      <p>
        Convio integrates with popular CRMs to sync contact and conversation data:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Integration</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Sync Direction</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">What Syncs</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">HubSpot</td>
              <td className="py-2 pr-4">Bidirectional</td>
              <td className="py-2">Contacts, companies, deals, conversation notes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Salesforce</td>
              <td className="py-2 pr-4">Bidirectional</td>
              <td className="py-2">Leads, contacts, cases, activity history</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Pipedrive</td>
              <td className="py-2 pr-4">Outbound</td>
              <td className="py-2">Contacts, deals, notes</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Custom / Webhook</td>
              <td className="py-2 pr-4">Outbound</td>
              <td className="py-2">Full contact and conversation data via webhook</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="info" icon={Link2} title="Webhook integration">
        For CRMs not listed above, use the outbound webhook integration. Configure a webhook endpoint in Settings → Integrations and Convio will POST conversation and contact data in real time.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={UserPlus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Metadata"
          href="/docs/conversation-metadata"
        />
        <DocNextStepCard
          icon={Target}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Resolving Conversations"
          href="/docs/resolving-conversations"
        />
      </DocCardGrid>
    </DocContent>
  )
}
