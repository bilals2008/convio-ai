import { Link } from 'react-router-dom'
import { ArrowRightLeft, MessageSquareWarning, Shield, Users, Clock, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function HumanHandoffPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'What is Human Handoff?' },
        ]}
        title="What is Human Handoff?"
        description="Human handoff transfers an active conversation from the AI agent to a human agent when the situation demands human judgment, empathy, or authority."
      />

      <h2 id="overview">Overview</h2>
      <p>
        AI agents handle the vast majority of support conversations independently. But some situations require a human — a billing dispute, an emotional customer, or a question that falls outside the agent's training. Convio's handoff system gives you a seamless bridge from AI to human, without losing context or making the user repeat themselves.
      </p>

      <DocCallout variant="info" icon={ArrowRightLeft} title="Human-in-the-loop">
        Handoff is not a failure of the AI. It's a feature — the agent recognizes its limits and escalates to the right person at the right time.
      </DocCallout>

      <h2 id="when-to-escalate">When to Escalate</h2>
      <p>
        Escalate when the AI cannot resolve the conversation with confidence. Common triggers:
      </p>
      <ul>
        <li><strong>Complex issues:</strong> Multi-step problems that require investigation, internal lookups, or judgment calls</li>
        <li><strong>Billing disputes:</strong> Chargebacks, refund requests over a threshold, or pricing disagreements</li>
        <li><strong>Angry or frustrated users:</strong> Sentiment analysis detects escalation or the user explicitly demands a human</li>
        <li><strong>Legal or compliance topics:</strong> Data deletion requests, GDPR inquiries, or contractual questions</li>
        <li><strong>Technical failures:</strong> The agent's tools return errors or the agent cannot complete an action</li>
      </ul>

      <h2 id="scenarios">Common Escalation Scenarios</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageSquareWarning}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Billing Disputes"
          description="Refund requests, chargeback threats, or subscription issues that require account-level access and judgment."
          href="#scenarios-billing"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Compliance & Legal"
          description="GDPR requests, data deletion, legal holds, or regulatory inquiries that need specialized handling."
          href="#scenarios-compliance"
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Emotional Escalation"
          description="Users expressing anger, frustration, or dissatisfaction who need empathetic human support."
          href="#scenarios-emotional"
        />
      </DocCardGrid>

      <h3 id="scenarios-billing">Billing Disputes</h3>
      <p>
        When a user questions a charge, requests a refund above your configured threshold, or threatens a chargeback, the conversation is escalated to a billing specialist. The agent captures the dispute details, order number, and user sentiment before handing off.
      </p>

      <h3 id="scenarios-compliance">Compliance & Legal</h3>
      <p>
        Requests involving personal data, regulatory requirements, or legal matters are routed to your compliance team. The agent confirms the request type, captures relevant identifiers, and flags the conversation with a compliance priority tag.
      </p>

      <h3 id="scenarios-emotional">Emotional Escalation</h3>
      <p>
        Sentiment analysis monitors every user message. When negative sentiment crosses a threshold — or the user uses explicit escalation phrases like "speak to a human" or "this is unacceptable" — the agent offers immediate transfer to a human agent.
      </p>

      <h2 id="architecture">Convio's Handoff Architecture</h2>
      <p>
        The handoff system has four components:
      </p>
      <ul>
        <li><strong>Trigger Engine:</strong> Monitors conversations for escalation conditions — keyword matches, sentiment thresholds, failed attempts, and explicit requests</li>
        <li><strong>Routing Layer:</strong> Assigns the escalated conversation to the right human agent based on availability, skill, and load</li>
        <li><strong>Context Bridge:</strong> Transfers the full conversation history, user metadata, and agent context to the human agent's inbox</li>
        <li><strong>Notification System:</strong> Alerts the assigned agent via email, in-app notification, or webhook</li>
      </ul>

      <DocCallout variant="tip" icon={Zap} title="Zero context loss">
        The human agent sees everything the AI saw — full message history, user metadata, previous interactions, and the reason for escalation. No "can you repeat that?"
      </DocCallout>

      <h2 id="benefits">Benefits of Human-in-the-Loop</h2>
      <ul>
        <li><strong>Higher CSAT:</strong> Users reach a real person when they need one, reducing frustration</li>
        <li><strong>Faster resolution:</strong> Complex issues get expert attention instead of AI loops</li>
        <li><strong>Compliance confidence:</strong> Sensitive requests are handled by trained staff</li>
        <li><strong>Agent improvement:</strong> Handoff data reveals where the AI falls short, informing training</li>
        <li><strong>Trust building:</strong> Knowing a human is available makes users more comfortable with AI</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRightLeft}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Setting Up Handoff Triggers"
          href="/docs/handoff-setup"
        />
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Assigning Conversations"
          href="/docs/assigning-conversations"
        />
      </DocCardGrid>
    </DocContent>
  )
}
