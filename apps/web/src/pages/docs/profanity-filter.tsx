import { Filter, Ban, Settings, AlertTriangle, CheckCircle, List } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard, DocNextStepCard } from '@/components/docs'

export default function ProfanityFilterPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Profanity Filtering' },
        ]}
        title="Profanity Filtering"
        description="Block or redact profanity, slurs, and offensive language in conversations."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The profanity filter scans user messages and AI responses for offensive language. It supports a built-in word list and allows you to add custom words specific to your use case.
      </p>

      <h2 id="enabling">Enabling Profanity Filter</h2>
      <ol>
        <li>Navigate to <strong>Agents</strong> and select your agent.</li>
        <li>Open the <strong>Moderation</strong> tab.</li>
        <li>Toggle on <strong>Profanity Filter</strong>.</li>
        <li>Choose an action: <strong>Block</strong> (prevent the message) or <strong>Redact</strong> (replace with [REDACTED]).</li>
      </ol>

      <DocCallout variant="tip" icon={CheckCircle} title="Start with redact mode">
        Redact mode lets conversations continue while still filtering offensive content. Switch to block mode once you're confident the filter catches what you need.
      </DocCallout>

      <h2 id="built-in-list">Built-in Word List</h2>
      <p>
        Convio includes a comprehensive built-in list covering common profanity, slurs, and offensive phrases. The list:
      </p>
      <ul>
        <li>Covers English profanity and common variations</li>
        <li>Includes racial, ethnic, and gender-based slurs</li>
        <li>Detects common evasion techniques (character substitutions, spacing)</li>
        <li>Is regularly updated with new terms</li>
      </ul>

      <h2 id="custom-words">Custom Word Lists</h2>
      <p>
        Add organization-specific words or phrases to the filter:
      </p>
      <ol>
        <li>In the <strong>Moderation</strong> tab, expand <strong>Custom Profanity Words</strong>.</li>
        <li>Enter words or phrases, one per line.</li>
        <li>Click <strong>Add</strong> to include them in the filter.</li>
      </ol>

      <p>
        Custom words are matched case-insensitively. Partial word matches are supported — adding "ban" will match "banner" and "bandana". To match whole words only, wrap the word in <code>\b</code> regex boundaries.
      </p>

      <h2 id="detection">Detection Accuracy</h2>
      <p>
        The filter uses multiple detection strategies to catch evasion:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Evasion Technique</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Detected?</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Direct match</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Character substitution (e.g., @ for a)</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Extra spaces or punctuation</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Case variation</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Leetspeak (e.g., sh1t)</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Unicode homoglyphs</td>
              <td className="py-2">Partial</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="warning" icon={AlertTriangle} title="No filter is perfect">
        Profanity filters can produce false positives (blocking benign content) and false negatives (missing creative evasion). Combine automated filtering with human review for sensitive applications.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Filter}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="PII Detection"
          href="/docs/pii-detection"
        />
        <DocNextStepCard
          icon={Ban}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Block-on-Violation Mode"
          href="/docs/block-on-violation"
        />
      </DocCardGrid>
    </DocContent>
  )
}
