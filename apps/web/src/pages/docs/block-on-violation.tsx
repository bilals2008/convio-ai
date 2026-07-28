import { Shield, AlertTriangle, Ban, MessageSquare, Settings, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function BlockOnViolationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Block-on-Violation Mode' },
        ]}
        title="Block-on-Violation Mode"
        description="Strict mode that blocks messages triggering any moderation rule."
      />

      <h2 id="overview">Strict Mode Explained</h2>
      <p>
        Block-on-violation mode is the strictest moderation setting. When enabled, any message (incoming or outgoing) that triggers a moderation rule is immediately blocked and never reaches the AI or the conversation log.
      </p>
      <p>
        This is the default mode for high-security deployments where even flagged messages pose unacceptable risk.
      </p>

      <DocCallout variant="destructive" icon={Shield} title="Block mode is irreversible">
        Once a message is blocked, it cannot be recovered. The user receives a generic violation notice, and the message is not stored. Make sure your rules are well-tested before enabling strict mode.
      </DocCallout>

      <h2 id="how-it-works">How Blocking Works</h2>
      <ol>
        <li>User sends a message.</li>
        <li>Moderation pipeline evaluates the message against all active rules.</li>
        <li>If any rule matches with action "Block", the message is discarded.</li>
        <li>The user receives: "Your message was blocked by our content policy."</li>
        <li>The AI never sees the message.</li>
      </ol>

      <p>
        Blocking applies to both directions:
      </p>
      <ul>
        <li><strong>Incoming messages:</strong> User messages that violate rules are blocked before reaching the AI.</li>
        <li><strong>Outgoing messages:</strong> AI responses that violate rules are blocked before reaching the user.</li>
      </ul>

      <h2 id="user-feedback">User Feedback</h2>
      <p>
        When a message is blocked, users see a generic notice. You can customize the feedback message:
      </p>
      <ol>
        <li>Go to <strong>Agents</strong> → <strong>Moderation</strong>.</li>
        <li>Expand <strong>Block-on-Violation Settings</strong>.</li>
        <li>Enter a custom <strong>Blocked Message Notice</strong>.</li>
      </ol>

      <p>
        Effective feedback tells the user what happened without revealing the specific rule that was triggered (which could help them evade it).
      </p>

      <h3 id="feedback-best-practices">Feedback Best Practices</h3>
      <ul>
        <li><strong>Be vague about the rule:</strong> "Your message violates our content policy" — don't say "profanity detected".</li>
        <li><strong>Offer alternatives:</strong> "Please rephrase your message."</li>
        <li><strong>Provide escalation:</strong> "If you believe this is an error, contact support."</li>
      </ul>

      <h2 id="when-to-use">When to Use Strict Mode</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Use Strict Mode When"
          description="Handling sensitive data, serving minors, operating in regulated industries, or when any violation is unacceptable."
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Consider Flag Mode Instead"
          description="When you need visibility into violations but don't want to block conversations. Better for most production deployments."
        />
      </DocCardGrid>

      <h2 id="configuring">Configuring Strict Mode</h2>
      <ol>
        <li>Go to <strong>Agents</strong> → <strong>Moderation</strong>.</li>
        <li>Enable your moderation checks (profanity, PII, custom rules).</li>
        <li>Set the action for each check to <strong>Block</strong>.</li>
        <li>Optionally, enable <strong>Block-on-Violation Mode</strong> globally to force all checks to Block.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Start with flag mode">
        Enabling strict mode immediately can break legitimate conversations. Start with flag-only mode, review flagged messages for a week, then switch to block mode with confidence in your rules.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Custom Moderation Rules"
          href="/docs/custom-moderation"
        />
        <DocNextStepCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audit Logs (Security Focus)"
          href="/docs/audit-logs-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
