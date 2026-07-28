import { Link } from 'react-router-dom'
import { MessageSquare, Layers, Radio, ArrowRight, Repeat } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ConversationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Conversations Overview' },
        ]}
        title="Conversations Overview"
        description="Conversations are the core unit of interaction in Convio. Each conversation groups messages between a user and an AI agent across one or more channels."
      />

      <h2 id="what-is-a-conversation">What Is a Conversation?</h2>
      <p>
        A conversation is a threaded exchange between a single user and an agent. It contains all messages, metadata, and status changes related to that interaction. Think of it as a container — messages go inside it, and status tracks where it sits in its lifecycle.
      </p>

      <DocCallout variant="info" icon={MessageSquare} title="Conversation vs Message">
        A <strong>conversation</strong> is the whole thread. A <strong>message</strong> is one entry in that thread — either from the user or the agent. One conversation contains many messages.
      </DocCallout>

      <h2 id="how-conversations-are-created">How Conversations Are Created</h2>
      <p>
        Conversations are created automatically when a user initiates contact. The trigger depends on the channel:
      </p>
      <ul>
        <li><strong>Web Widget:</strong> Created when a visitor opens the widget and sends the first message (or triggers the welcome message)</li>
        <li><strong>WhatsApp:</strong> Created when an inbound WhatsApp message arrives from a new number</li>
        <li><strong>Telegram:</strong> Created on the first /start command or message in a new chat</li>
        <li><strong>API:</strong> Created programmatically via the conversations endpoint when posting the first message</li>
      </ul>

      <DocCallout variant="tip" icon={Radio} title="Existing conversations are reused">
        If a returning user sends a message on the same channel with an existing open conversation, Convio appends to it instead of creating a new one. Only one active conversation exists per user per channel at a time.
      </DocCallout>

      <h2 id="lifecycle">Conversation Lifecycle</h2>
      <p>
        Every conversation moves through a predictable lifecycle:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="New → Active"
          description="A conversation starts as New when created. It becomes Active when the agent responds or a human agent picks it up."
          href="#lifecycle-details"
        />
        <DocFeatureCard
          icon={Layers}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Active → Resolved"
          description="Active conversations stay open while the user is engaged. They move to Resolved once the issue is addressed."
          href="#lifecycle-details"
        />
        <DocFeatureCard
          icon={Repeat}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Resolved → Archived"
          description="Resolved conversations are retained for history. After a configurable period, they archive automatically."
          href="#lifecycle-details"
        />
      </DocCardGrid>

      <h3 id="lifecycle-details">Lifecycle Details</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Status</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">What Happens</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Auto-Transitions</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">New</td>
              <td className="py-2 pr-4">Conversation created, awaiting first response</td>
              <td className="py-2">→ Active on first agent/human reply</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Active</td>
              <td className="py-2 pr-4">Live conversation, messages flowing</td>
              <td className="py-2">→ Waiting after timeout, → Resolved on close</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Waiting</td>
              <td className="py-2 pr-4">Awaiting human response after escalation</td>
              <td className="py-2">→ Active when human responds</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Resolved</td>
              <td className="py-2 pr-4">Issue addressed, conversation closed by agent or human</td>
              <td className="py-2">→ Archived after retention period</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Archived</td>
              <td className="py-2 pr-4">Hidden from main view, retained for analytics</td>
              <td className="py-2">None — manual reopen required</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="multi-channel">Multi-Channel Conversations</h2>
      <p>
        A single user can have separate conversations across different channels. Each channel maintains its own conversation thread. This means:
      </p>
      <ul>
        <li>A user chatting via WhatsApp has one conversation; the same user on the web widget has another</li>
        <li>Context is not shared between channel conversations unless you configure cross-channel continuity</li>
        <li>Each conversation tracks its originating channel separately in metadata</li>
      </ul>

      <DocCallout variant="tip" icon={ArrowRight} title="Channel routing">
        If a user switches channels mid-conversation (e.g., from web to WhatsApp), you can configure Convio to link the conversations via contact metadata. See <Link to="/docs/conversation-metadata" className="text-primary hover:underline">Conversation Metadata</Link>.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Statuses"
          href="/docs/conversation-statuses"
        />
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Viewing Conversations"
          href="/docs/viewing-conversations"
        />
      </DocCardGrid>
    </DocContent>
  )
}
