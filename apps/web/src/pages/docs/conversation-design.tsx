import { MessageSquare, Smile, AlertCircle, ArrowRight, GitBranch, Lightbulb, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ConversationDesignPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Conversation Design' },
        ]}
        title="Conversation Design Best Practices"
        description="Design natural conversation flows, effective welcome messages, and robust error recovery strategies."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Conversation design is the difference between an agent that feels helpful and one that feels robotic. Good conversation design anticipates user needs, handles errors gracefully, and guides users toward their goals without friction.
      </p>

      <h2 id="welcome-messages">Welcome Messages</h2>
      <p>
        The welcome message sets expectations for the entire conversation. It should accomplish three things in one or two sentences:
      </p>
      <ol>
        <li><strong>Identify:</strong> Tell the user who they're talking to. "Hi, I'm Convio's support assistant."</li>
        <li><strong>Scope:</strong> Explain what the agent can help with. "I can help with billing questions, account setup, and technical troubleshooting."</li>
        <li><strong>Guide:</strong> Prompt the user to start. "What can I help you with today?"</li>
      </ol>

      <DocCallout variant="tip" icon={Smile} title="Keep it brief">
        Users want to solve their problem, not read a welcome essay. One to two sentences max. Avoid listing every feature — mention the top 2–3 use cases and let the user ask for more.
      </DocCallout>

      <h2 id="follow-ups">Follow-Up Prompts</h2>
      <p>
        Follow-up prompts keep conversations productive after the initial exchange. Use them to:
      </p>
      <ul>
        <li><strong>Clarify ambiguity:</strong> If the user's question could apply to multiple topics, ask a clarifying question. "Are you asking about your monthly plan or your annual subscription?"</li>
        <li><strong>Offer next steps:</strong> After answering a question, suggest related actions. "Would you like me to walk you through updating your payment method?"</li>
        <li><strong>Confirm resolution:</strong> Before closing, verify the user's issue is resolved. "Did that answer your question, or is there anything else I can help with?"</li>
      </ul>

      <h2 id="error-recovery">Error Recovery</h2>
      <p>
        Errors will happen — the agent misunderstands, retrieval fails, or the user asks something outside scope. Design for graceful recovery:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={AlertCircle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Misunderstanding"
          description="When the agent's answer misses the mark, acknowledge it and ask the user to rephrase. Never double down on a wrong answer."
          href="#"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Out of Scope"
          description="When the question falls outside the agent's knowledge, say so honestly and offer a path forward — human support, documentation link, or related topic."
          href="#"
        />
        <DocFeatureCard
          icon={AlertCircle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Tool Failure"
          description="When a tool call fails, don't expose the error to the user. Say the information isn't available right now and offer an alternative."
          href="#"
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Repeated Failures"
          description="If the same question fails twice, escalate to a human agent or provide a direct contact. Don't loop the user in a broken conversation."
          href="#"
        />
      </DocCardGrid>

      <DocCallout variant="warning" icon={AlertTriangle} title="Never blame the user">
        Phrases like "I didn't understand your question" are acceptable. "You weren't clear" or "Your question doesn't make sense" are not. Take responsibility for the misunderstanding.
      </DocCallout>

      <h2 id="conversation-flow">Conversation Flow Design</h2>
      <p>
        Design conversation flows that feel natural, not scripted. Follow these principles:
      </p>
      <ul>
        <li><strong>One topic per turn:</strong> Don't ask multiple questions in a single response. Handle one topic, then move to the next.</li>
        <li><strong>Progressive disclosure:</strong> Start with simple answers and offer to provide more detail. Don't overwhelm users with information they didn't ask for.</li>
        <li><strong>Contextual awareness:</strong> Reference previous messages in the conversation. If the user mentioned their plan tier earlier, use that context in your response.</li>
        <li><strong>Natural transitions:</strong> When switching topics, acknowledge the transition. "Moving on to your billing question..."</li>
      </ul>

      <h2 id="edge-cases">Handling Edge Cases</h2>
      <p>
        Anticipate and prepare for common edge cases:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Edge Case</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Strategy</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">User sends images/files</td>
              <td className="py-2">If the agent doesn't support vision, acknowledge the file and ask the user to describe it in text.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Multi-language input</td>
              <td className="py-2">Detect the language and respond in it, or explain which languages are supported.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Empty or spam messages</td>
              <td className="py-2">Detect non-substantive messages and prompt the user politely: "How can I help you?"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">User changes topic mid-flow</td>
              <td className="py-2">Acknowledge the new topic and pivot. Don't force the user back to the previous thread.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Sensitive information</td>
              <td className="py-2">If a user shares a password or API key, instruct them to change it immediately and never repeat it.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Prompt Engineering"
          href="/docs/prompt-engineering"
        />
        <DocNextStepCard
          icon={GitBranch}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Human Handoff"
          href="/docs/human-handoff"
        />
      </DocCardGrid>
    </DocContent>
  )
}
