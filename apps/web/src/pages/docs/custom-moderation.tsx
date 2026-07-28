import { Settings, Code, ArrowUp, TestTube, AlertTriangle, Plus } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CustomModerationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Custom Moderation Rules' },
        ]}
        title="Custom Moderation Rules"
        description="Create custom moderation rules with regex patterns, keyword matching, and priority levels."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Custom moderation rules let you define organization-specific content policies beyond the built-in checks. Create rules for competitor mentions, sensitive topics, compliance phrases, or any pattern unique to your use case.
      </p>

      <h2 id="creating">Creating Custom Rules</h2>
      <ol>
        <li>Go to <strong>Agents</strong> and select your agent.</li>
        <li>Open the <strong>Moderation</strong> tab.</li>
        <li>Scroll to <strong>Custom Rules</strong> and click <strong>Add Rule</strong>.</li>
        <li>Configure the rule:
          <ul>
            <li><strong>Name:</strong> A descriptive name for the rule.</li>
            <li><strong>Pattern:</strong> A regex pattern or keyword list.</li>
            <li><strong>Action:</strong> Block, Redact, Flag, or Allow.</li>
            <li><strong>Priority:</strong> Higher priority rules are evaluated first.</li>
          </ul>
        </li>
        <li>Click <strong>Save</strong>. The rule is active immediately.</li>
      </ol>

      <h2 id="patterns">Regex Patterns</h2>
      <p>
        Custom rules support regular expressions for flexible matching. Common patterns:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Pattern</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Matches</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4"><code className="text-xs">competitorA|competitorB</code></td>
              <td className="py-2">Either competitor name</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4"><code className="text-xs">\b(secret|confidential)\b</code></td>
              <td className="py-2">Whole words "secret" or "confidential"</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4"><code className="text-xs">\$\d{1,3}(,\d{3})*</code></td>
              <td className="py-2">Dollar amounts ($100, $1,000,000)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4"><code className="text-xs">https?://[^\s]+</code></td>
              <td className="py-2">URLs (http or https)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={Code} title="Test your patterns">
        Use the built-in test panel to verify your regex matches what you expect before saving. This prevents accidentally blocking legitimate messages.
      </DocCallout>

      <h2 id="priorities">Rule Priorities</h2>
      <p>
        Rules are evaluated in priority order (highest first). When multiple rules match a message, the highest-priority rule's action is applied.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Priority</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Evaluation Order</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Use Case</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">High (1-3)</td>
              <td className="py-2">Evaluated first</td>
              <td className="py-2">Critical violations (PII, security threats)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Medium (4-6)</td>
              <td className="py-2">Evaluated second</td>
              <td className="py-2">Policy violations, competitor mentions</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Low (7-10)</td>
              <td className="py-2">Evaluated last</td>
              <td className="py-2">Soft guidelines, logging-only rules</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="testing">Testing Rules</h2>
      <p>
        Before enabling rules in production, test them using the built-in test panel:
      </p>
      <ol>
        <li>In the <strong>Custom Rules</strong> section, click <strong>Test Rules</strong>.</li>
        <li>Enter a test message.</li>
        <li>The panel shows which rules match and what action would be taken.</li>
        <li>Adjust patterns or priorities based on results.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Test with real conversations">
        Synthetic test messages may not capture the full range of how rules interact with real user input. Run in flag-only mode for a few days to validate rules against actual conversations.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Block-on-Violation Mode"
          href="/docs/block-on-violation"
        />
        <DocNextStepCard
          icon={TestTube}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Profanity Filtering"
          href="/docs/profanity-filter"
        />
      </DocCardGrid>
    </DocContent>
  )
}
