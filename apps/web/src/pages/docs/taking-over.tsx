import { Link } from 'react-router-dom'
import { ArrowRightLeft, MessageSquare, Clock, AlertTriangle, Bell } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function TakingOverPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Taking Over from the AI' },
        ]}
        title="Taking Over from the AI"
        description="The seamless process of a human agent stepping into an active AI conversation without disrupting the user experience."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When a conversation is escalated, a human agent picks up exactly where the AI left off. The user doesn't need to repeat themselves, and the conversation flow stays natural. This page covers how the takeover works and what both the agent and user experience.
      </p>

      <h2 id="takeover-process">Seamless Takeover Process</h2>
      <p>
        The takeover follows a fixed sequence:
      </p>
      <ol>
        <li><strong>Handoff triggered:</strong> The AI detects an escalation condition and pauses its responses</li>
        <li><strong>Conversation routed:</strong> The conversation enters the agent inbox with full context</li>
        <li><strong>Agent accepts:</strong> The human agent clicks the conversation and begins composing a response</li>
        <li><strong>First human message:</strong> The agent's first message replaces the AI as the responder</li>
        <li><strong>Status updated:</strong> The conversation status changes from "Waiting" to "Active"</li>
      </ol>

      <DocCallout variant="info" icon={ArrowRightLeft} title="No gap in the conversation">
        The user sees a single, continuous thread. There's no "please hold while we connect you" screen — the human agent simply starts responding.
      </DocCallout>

      <h2 id="context-preservation">Context Preservation</h2>
      <p>
        The human agent receives the complete context of the conversation:
      </p>
      <ul>
        <li><strong>Full message history:</strong> Every exchange between the user and the AI</li>
        <li><strong>Escalation reason:</strong> Why the handoff was triggered (keyword, sentiment, failed attempts, etc.)</li>
        <li><strong>User metadata:</strong> Name, email, previous conversations, and contact tags</li>
        <li><strong>Agent actions:</strong> What the AI tried — tool calls, knowledge base lookups, and their results</li>
        <li><strong>Sentiment timeline:</strong> How the user's mood evolved during the conversation</li>
        <li><strong>Conversation summary:</strong> Auto-generated summary of the conversation so far</li>
      </ul>

      <DocCallout variant="tip" icon={MessageSquare} title="Read the summary first">
        The AI-generated summary at the top of the conversation is your fastest way to get up to speed. Read it before diving into the full message history.
      </DocCallout>

      <h2 id="ai-interruption">AI Response Interruption</h2>
      <p>
        When a handoff is triggered, the AI stops generating responses immediately:
      </p>
      <ul>
        <li>If the AI is mid-response (streaming), the response is truncated and not sent to the user</li>
        <li>The AI enters a "paused" state for that conversation</li>
        <li>Any pending tool calls are cancelled</li>
        <li>The AI will not resume unless a human agent explicitly returns the conversation</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Avoid mid-response handoffs">
        If possible, let the AI finish its current response before the handoff completes. Interrupting a response can confuse users. Configure a short delay (1-2 seconds) before the handoff takes effect.
      </DocCallout>

      <h2 id="notifications">Handoff Notifications</h2>
      <p>
        When a conversation is assigned to you, Convio notifies you through multiple channels:
      </p>
      <ul>
        <li><strong>In-app notification:</strong> A real-time alert in the dashboard with the conversation preview</li>
        <li><strong>Browser notification:</strong> Push notification if you've enabled browser permissions</li>
        <li><strong>Email notification:</strong> A summary email with a direct link to the conversation</li>
        <li><strong>Webhook:</strong> For custom integrations (Slack, Microsoft Teams, etc.)</li>
      </ul>

      <DocCallout variant="info" icon={Bell} title="Notification preferences">
        Configure which notifications you receive in <strong>Settings → Notifications</strong>. You can set different preferences for urgent vs. normal priority handoffs.
      </DocCallout>

      <h2 id="response-timing">Response Time Expectations</h2>
      <p>
        Once you accept a conversation, the user is waiting for a human response. Set expectations:
      </p>
      <ul>
        <li><strong>First response:</strong> Within the SLA target for the conversation's priority level</li>
        <li><strong>Follow-up responses:</strong> Keep the user engaged; if you need time to investigate, tell them</li>
        <li><strong>Status updates:</strong> If the issue takes longer than expected, send periodic updates</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRightLeft}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Returning to AI"
          href="/docs/returning-to-ai"
        />
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Handoff Notifications"
          href="/docs/handoff-notifications"
        />
      </DocCardGrid>
    </DocContent>
  )
}
