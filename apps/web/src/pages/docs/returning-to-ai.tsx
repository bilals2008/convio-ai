import { Link } from 'react-router-dom'
import { ArrowRightLeft, MessageSquare, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ReturningToAiPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Returning to AI' },
        ]}
        title="Returning to AI"
        description="How human agents hand control back to the AI and what context the AI receives when it resumes."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Not every escalated conversation needs to stay with a human. Once the complex part is resolved, hand the conversation back to the AI for follow-up, confirmation, or closure. The AI picks up seamlessly with full context of everything that happened.
      </p>

      <h2 id="handback-process">Handing Back Control</h2>
      <p>
        The process is the reverse of taking over:
      </p>
      <ol>
        <li><strong>Agent clicks "Return to AI":</strong> In the conversation header, click the return action</li>
        <li><strong>Optionally add a note:</strong> Tell the AI what was resolved or what to do next</li>
        <li><strong>AI resumes:</strong> The AI receives the full conversation including the human's messages and begins responding again</li>
        <li><strong>Status updated:</strong> The conversation status returns to "Active" under AI management</li>
      </ol>

      <DocCallout variant="info" icon={ArrowRightLeft} title="Seamless for the user">
        The user sees no interruption. The conversation continues naturally — the AI picks up the thread as if it never left.
      </DocCallout>

      <h2 id="ai-context">AI Resumption Context</h2>
      <p>
        When the AI resumes, it receives a complete context package:
      </p>
      <ul>
        <li><strong>Full conversation history:</strong> Including all human agent messages, with clear attribution</li>
        <li><strong>Human agent notes:</strong> Any notes the agent added before returning the conversation</li>
        <li><strong>Resolution summary:</strong> What was addressed and what remains</li>
        <li><strong>User sentiment update:</strong> Current sentiment state after human interaction</li>
        <li><strong>Metadata changes:</strong> Any tags, priority changes, or status updates made by the human</li>
      </ul>

      <h3 id="ai-behavior-after-return">AI Behavior After Return</h3>
      <p>
        The AI adjusts its behavior based on the human interaction:
      </p>
      <ul>
        <li>It acknowledges the human agent's involvement naturally ("I see you spoke with my colleague...")</li>
        <li>It avoids repeating questions the human already answered</li>
        <li>It follows any instructions the human left in the notes</li>
        <li>It can resolve the conversation if the issue is fully addressed</li>
      </ul>

      <h2 id="when-to-return">When to Return vs. Stay Human</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Return to AI</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Stay Human</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">The complex issue is resolved and follow-up is routine</td>
              <td className="py-2">The user explicitly requests to continue with a human</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">The user is satisfied and just needs confirmation</td>
              <td className="py-2">The issue requires ongoing human judgment</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">The conversation is about to resolve (closing the loop)</td>
              <td className="py-2">The user's sentiment is still negative</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Your team is at capacity and needs to focus on new escalations</td>
              <td className="py-2">The issue is sensitive (legal, compliance, PR)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={CheckCircle} title="Default to return">
        When in doubt, return to AI. The AI is always available, scales infinitely, and handles follow-ups faster than humans. Reserve human time for what genuinely needs it.
      </DocCallout>

      <h2 id="re-escalation">Re-Escalation</h2>
      <p>
        If the AI encounters the same issue after resuming, it can escalate again:
      </p>
      <ul>
        <li>The AI remembers the previous handoff and avoids repeating the same failure</li>
        <li>Escalation count increments; the conversation may lock to human after the configured limit</li>
        <li>The re-escalation includes a note about what happened after the first handoff</li>
      </ul>

      <DocCallout variant="warning" icon={RotateCcw} title="Escalation loops">
        If a conversation bounces between AI and human multiple times, it's a signal the issue needs dedicated attention. After 3 escalations, the conversation locks to human-only by default.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Handoff Best Practices"
          href="/docs/handoff-best-practices"
        />
        <DocNextStepCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Handoff Notifications"
          href="/docs/handoff-notifications"
        />
      </DocCardGrid>
    </DocContent>
  )
}
