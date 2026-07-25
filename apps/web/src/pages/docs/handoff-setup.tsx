import { Link } from 'react-router-dom'
import { Settings, MessageSquareWarning, Gauge, RotateCcw, Sliders, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function HandoffSetupPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Setting Up Handoff Triggers' },
        ]}
        title="Setting Up Handoff Triggers"
        description="Configure the conditions that automatically escalate conversations from the AI agent to a human."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Handoff triggers are rules that tell Convio when to transfer a conversation from the AI to a human agent. You can combine multiple triggers, each with its own conditions and escalation path. Configure them in <strong>Settings → Handoff</strong>.
      </p>

      <h2 id="keyword-triggers">Keyword-Based Triggers</h2>
      <p>
        Match specific phrases or keywords in user messages to trigger escalation. Keywords are case-insensitive and match partial phrases.
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Setting</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Description</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Example</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Keywords</td>
              <td className="py-2 pr-4">Exact phrases or words that trigger escalation</td>
              <td className="py-2">"speak to human", "real person", "transfer me"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Match Mode</td>
              <td className="py-2 pr-4">Whether to match exact phrases or any keyword</td>
              <td className="py-2">Exact phrase vs. any of these words</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Sensitivity</td>
              <td className="py-2 pr-4">How strictly to match (strict = exact, loose = fuzzy)</td>
              <td className="py-2">"speak to a human" matches "can i speak to human"</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={MessageSquareWarning} title="Multi-language keywords">
        Add keywords in every language your users speak. A user typing "hable con una persona" should trigger the same handoff as "speak to a human."
      </DocCallout>

      <h2 id="sentiment-triggers">Sentiment Detection</h2>
      <p>
        Convio's sentiment engine analyzes every user message in real time. Configure thresholds for automatic escalation:
      </p>
      <ul>
        <li><strong>Negative sentiment threshold:</strong> Escalate when sentiment score drops below a configurable value (default: -0.7 on a -1 to 1 scale)</li>
        <li><strong>Sustained negativity:</strong> Escalate after N consecutive negative messages, even if individual scores are moderate</li>
        <li><strong>Sentiment drop rate:</strong> Escalate when sentiment worsens rapidly within a short window</li>
      </ul>

      <h3 id="sentiment-config">Configuration Steps</h3>
      <ol>
        <li>Go to <strong>Settings → Handoff → Sentiment Triggers</strong></li>
        <li>Set the <strong>Negative Threshold</strong> (recommended: -0.6 to -0.8)</li>
        <li>Set <strong>Consecutive Negative Messages</strong> count (recommended: 2-3)</li>
        <li>Choose the escalation priority for sentiment-triggered handoffs</li>
        <li>Test with sample conversations in the Playground</li>
      </ol>

      <h2 id="escalation-limits">Escalation Limits</h2>
      <p>
        Prevent infinite loops where the AI fails, hands off, and the human hands back. Configure limits:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Limit</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Default</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Max Handoff Attempts</td>
              <td className="py-2 pr-4">3</td>
              <td className="py-2">Max times a conversation can be handed off before locking to human-only</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Cooldown Period</td>
              <td className="py-2 pr-4">5 minutes</td>
              <td className="py-2">Minimum time between handoff triggers on the same conversation</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Lock to Human After</td>
              <td className="py-2 pr-4">3 escalations</td>
              <td className="py-2">After this many escalations, the conversation stays human-only until resolved</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="user-request">User Request Escalation</h2>
      <p>
        Beyond keywords, Convio recognizes intent patterns that indicate the user wants a human:
      </p>
      <ul>
        <li>Direct requests: "I want to talk to someone", "connect me to an agent"</li>
        <li>Implied requests: "this isn't helping", "I've been going in circles"</li>
        <li>Explicit demands: "get me a manager", "I need to speak to a supervisor"</li>
      </ul>

      <DocCallout variant="warning" icon={Gauge} title="Don't over-escalate">
        Not every frustrated message needs a handoff. Set your thresholds to escalate genuinely stuck conversations, not every user who expresses mild impatience.
      </DocCallout>

      <h2 id="setup-steps">Configuration Steps</h2>
      <ol>
        <li>Navigate to <strong>Settings → Handoff</strong></li>
        <li>Enable <strong>Automatic Handoff</strong></li>
        <li>Configure keyword triggers with your escalation phrases</li>
        <li>Set sentiment thresholds and test in the Playground</li>
        <li>Set escalation limits to prevent loops</li>
        <li>Assign default routing rules for escalated conversations</li>
        <li>Test with a sandbox conversation end-to-end</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Sliders}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Assigning Conversations"
          href="/docs/assigning-conversations"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
      </DocCardGrid>
    </DocContent>
  )
}
