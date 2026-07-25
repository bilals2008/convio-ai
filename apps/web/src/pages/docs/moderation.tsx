import { Shield, Filter, CheckCircle, AlertTriangle, Settings, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ModerationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Content Moderation' },
        ]}
        title="Content Moderation"
        description="Filter and block harmful, inappropriate, or policy-violating content in conversations."
      />

      <h2 id="overview">How Moderation Works</h2>
      <p>
        Convio's moderation system evaluates both incoming user messages and outgoing AI responses against configurable rules. When a rule is triggered, the system can block the message, redact sensitive content, or flag it for review — depending on your configuration.
      </p>

      <p>
        Moderation runs in real-time before messages are stored or forwarded. This means violations are caught instantly, without post-processing delays.
      </p>

      <h2 id="pipeline">Moderation Pipeline</h2>
      <p>
        Every message passes through the moderation pipeline in this order:
      </p>
      <ol>
        <li><strong>Profanity filter:</strong> Checks for blocked words and phrases.</li>
        <li><strong>PII detection:</strong> Identifies personal information like emails, phone numbers, and SSNs.</li>
        <li><strong>Prompt injection:</strong> Detects attempts to manipulate AI behavior through crafted prompts.</li>
        <li><strong>Custom rules:</strong> Applies your organization's custom regex and keyword rules.</li>
        <li><strong>Action:</strong> Executes the configured action (block, redact, flag, or allow).</li>
      </ol>

      <DocCallout variant="tip" icon={Filter} title="Pipeline order matters">
        Rules are evaluated in sequence. If a message is blocked by an earlier rule, later rules are not evaluated. This reduces processing time and gives you predictable behavior.
      </DocCallout>

      <h2 id="checks">Supported Checks</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Filter}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Profanity Filtering"
          description="Block or redact profanity, slurs, and offensive language using built-in and custom word lists."
          href="/docs/profanity-filter"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="PII Detection"
          description="Detect and handle personal information: emails, phone numbers, SSNs, credit card numbers, and addresses."
          href="/docs/pii-detection"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Prompt Injection"
          description="Protect against prompt injection attacks that attempt to override system instructions."
          href="/docs/prompt-injection"
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Custom Rules"
          description="Create custom moderation rules with regex patterns, keyword matching, and priority levels."
          href="/docs/custom-moderation"
        />
      </DocCardGrid>

      <h2 id="actions">Moderation Actions</h2>
      <p>
        When a rule is triggered, the system can take one of these actions:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Action</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Behavior</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Block</td>
              <td className="py-2">Message is not sent. User sees a violation notice.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Redact</td>
              <td className="py-2">Matching content is replaced with [REDACTED]. Message is sent.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Flag</td>
              <td className="py-2">Message is sent but logged as flagged for later review.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Allow</td>
              <td className="py-2">No action taken. Useful for logging-only rules.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="configuring">Configuring Moderation</h2>
      <p>
        Enable and configure moderation from your agent's settings:
      </p>
      <ol>
        <li>Go to <strong>Agents</strong> and select an agent.</li>
        <li>Open the <strong>Moderation</strong> tab.</li>
        <li>Toggle on the checks you want to enable.</li>
        <li>Set the action for each check (block, redact, or flag).</li>
        <li>Save your changes. Moderation is active immediately.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Test before enabling in production">
        Run moderation in flag-only mode first to understand what gets caught. This prevents false positives from blocking legitimate conversations.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Filter}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Profanity Filtering"
          href="/docs/profanity-filter"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="PII Detection"
          href="/docs/pii-detection"
        />
      </DocCardGrid>
    </DocContent>
  )
}
