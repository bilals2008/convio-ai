import { Eye, Mail, Phone, CreditCard, Shield, AlertTriangle, Settings } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function PiiDetectionPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'PII Detection' },
        ]}
        title="PII Detection"
        description="Detect and handle personally identifiable information in conversations."
      />

      <h2 id="overview">Overview</h2>
      <p>
        PII detection identifies personal information in messages — such as email addresses, phone numbers, Social Security numbers, and credit card numbers — and lets you choose how to handle it. This helps you comply with privacy regulations and protects your users.
      </p>

      <h2 id="supported-types">Supported PII Types</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Mail}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Email Addresses"
          description="Detects standard email formats (user@domain.com). Matches common patterns including subdomains and plus-addressing."
        />
        <DocFeatureCard
          icon={Phone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Phone Numbers"
          description="Detects US and international phone formats. Handles parentheses, dashes, spaces, and country codes."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Social Security Numbers"
          description="Detects SSN formats (XXX-XX-XXXX) and ITIN variations. Flags any 9-digit number matching SSN patterns."
        />
        <DocFeatureCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Credit Card Numbers"
          description="Detects major card formats (Visa, Mastercard, Amex, Discover) using Luhn algorithm validation."
        />
      </DocCardGrid>

      <h2 id="blocking-vs-redacting">Blocking vs Redacting</h2>
      <p>
        Choose how PII is handled when detected:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Mode</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Behavior</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Use When</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Block</td>
              <td className="py-2">Message is not sent. User sees an error.</td>
              <td className="py-2">Strict compliance. No PII allowed in conversations.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Redact</td>
              <td className="py-2">PII is replaced with [EMAIL], [PHONE], etc. Message is sent.</td>
              <td className="py-2">You need conversations to continue but want PII removed from logs.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Flag</td>
              <td className="py-2">Message is sent but logged as containing PII.</td>
              <td className="py-2">Audit purposes. You want visibility without blocking.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={Eye} title="Redaction is recommended for most teams">
        Redaction removes PII from stored conversations while allowing the conversation to flow naturally. This is the most common choice for teams that need both compliance and usability.
      </DocCallout>

      <h2 id="configuration">Configuration</h2>
      <ol>
        <li>Go to <strong>Agents</strong> and select your agent.</li>
        <li>Open the <strong>Moderation</strong> tab.</li>
        <li>Toggle on <strong>PII Detection</strong>.</li>
        <li>Select which PII types to detect (email, phone, SSN, credit card).</li>
        <li>Choose the action: Block, Redact, or Flag.</li>
      </ol>

      <h3 id="selective-detection">Selective Detection</h3>
      <p>
        You don't have to detect all PII types. For example, if your application legitimately collects email addresses but you want to block SSNs, enable only the SSN check.
      </p>

      <h2 id="logging">PII Audit Logging</h2>
      <p>
        When PII is detected, Convio logs the event in your audit trail. The log entry includes:
      </p>
      <ul>
        <li>Timestamp of detection</li>
        <li>PII type detected</li>
        <li>Action taken (blocked, redacted, flagged)</li>
        <li>Agent and organization context</li>
      </ul>
      <p>
        The actual PII value is never stored in logs — only the fact that it was detected and the action taken.
      </p>

      <DocCallout variant="destructive" icon={AlertTriangle} title="PII in logs is never stored">
        Convio's logging system explicitly excludes detected PII values. This prevents audit logs from becoming a compliance liability.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Retention & Deletion"
          href="/docs/data-retention"
        />
        <DocNextStepCard
          icon={Eye}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audit Logs (Security Focus)"
          href="/docs/audit-logs-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
