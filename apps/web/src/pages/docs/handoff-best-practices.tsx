import { Link } from 'react-router-dom'
import { CheckCircle, MessageSquare, Clock, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function HandoffBestPracticesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Handoff Best Practices' },
        ]}
        title="Handoff Best Practices"
        description="Practical guidelines for effective human handoffs — when to escalate, how to brief agents, and what to document."
      />

      <h2 id="when-to-escalate">When to Escalate</h2>
      <p>
        Not every conversation needs a human. Escalate when:
      </p>
      <ul>
        <li><strong>The AI is genuinely stuck:</strong> It's tried multiple approaches and failed, or the question is outside its training</li>
        <li><strong>The user demands it:</strong> "Speak to a human" should always be honored — don't make users argue</li>
        <li><strong>The issue is sensitive:</strong> Billing, legal, compliance, or PR issues need human judgment</li>
        <li><strong>Sentiment is deteriorating:</strong> The user is getting angrier and the AI isn't de-escalating</li>
        <li><strong>The value is high:</strong> Enterprise clients, large deals, or high-LTV users deserve human attention</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't escalate too early">
        Escalating every conversation defeats the purpose of AI support. Train the AI to handle common cases well, and only escalate the genuinely complex ones.
      </DocCallout>

      <h2 id="briefing-agents">How to Brief Human Agents</h2>
      <p>
        A good handoff includes a clear brief. When a conversation is escalated, the AI should capture:
      </p>
      <ol>
        <li><strong>What the user needs:</strong> One-sentence summary of the request</li>
        <li><strong>What was tried:</strong> Actions the AI took and their results</li>
        <li><strong>Why escalation happened:</strong> The specific trigger (keyword, sentiment, failed attempts)</li>
        <li><strong>Current user state:</strong> Sentiment, frustration level, and any partial progress</li>
        <li><strong>Relevant context:</strong> Account details, order numbers, previous interactions</li>
      </ol>

      <DocCallout variant="tip" icon={Lightbulb} title="The 30-second brief">
        The human agent should be able to understand the situation in 30 seconds or less. If the brief takes longer, it's too detailed. If it's shorter, it's missing critical context.
      </DocCallout>

      <h2 id="response-time">Response Time Expectations</h2>
      <p>
        Set clear SLAs for human response times after escalation:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Priority</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">First Response</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Resolution Target</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Escalation Path</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Urgent</td>
              <td className="py-2 pr-4">Under 5 minutes</td>
              <td className="py-2 pr-4">Under 1 hour</td>
              <td className="py-2">Immediately to team lead</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">High</td>
              <td className="py-2 pr-4">Under 15 minutes</td>
              <td className="py-2 pr-4">Under 4 hours</td>
              <td className="py-2">Team lead after 30 minutes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Normal</td>
              <td className="py-2 pr-4">Under 1 hour</td>
              <td className="py-2 pr-4">Under 24 hours</td>
              <td className="py-2">Team lead after 4 hours</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Low</td>
              <td className="py-2 pr-4">Under 4 hours</td>
              <td className="py-2 pr-4">Under 72 hours</td>
              <td className="py-2">Team lead after 24 hours</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="documentation">Documentation During Handoff</h2>
      <p>
        Every handoff should leave a paper trail. Document:
      </p>
      <ul>
        <li><strong>Internal notes:</strong> Add private notes in the conversation for your team — what you did, what worked, what didn't</li>
        <li><strong>Resolution details:</strong> When you resolve the conversation, document the fix so the AI can learn from it</li>
        <li><strong>Escalation patterns:</strong> If you see the same type of escalation repeatedly, update the agent's training data</li>
        <li><strong>User feedback:</strong> Capture any feedback the user provides about the experience</li>
      </ul>

      <DocCallout variant="info" icon={BookOpen} title="Knowledge base feedback loop">
        Every human-handled conversation is a training opportunity. After resolving a handoff, ask: "Could the AI have handled this with better knowledge?" If yes, add the answer to the knowledge base.
      </DocCallout>

      <h2 id="general-tips">General Tips</h2>
      <ul>
        <li><strong>Don't make users repeat themselves:</strong> Read the full conversation history before responding</li>
        <li><strong>Acknowledge the AI's work:</strong> "I can see you've been working on this with our assistant" builds trust</li>
        <li><strong>Set expectations:</strong> If you need time to investigate, tell the user how long it will take</li>
        <li><strong>Use internal notes liberally:</strong> Your future self and teammates will thank you</li>
        <li><strong>Return to AI when appropriate:</strong> Don't hoard conversations — hand back for routine follow-ups</li>
        <li><strong>Track your patterns:</strong> If you're handling the same type of escalation repeatedly, the AI needs training</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Taking Over from the AI"
          href="/docs/taking-over"
        />
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Returning to AI"
          href="/docs/returning-to-ai"
        />
      </DocCardGrid>
    </DocContent>
  )
}
