import { TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Target, Users, MessageCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SuccessRatePage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Success Rate' },
        ]}
        title="Conversation Success Rate"
        description="How success rate is calculated, what affects it, and how to improve it."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Success rate measures the percentage of conversations your AI agent resolves without human escalation. It is the primary indicator of agent quality and knowledge base completeness.
      </p>

      <h2 id="calculation">How It Is Calculated</h2>
      <p>
        <code>Success Rate = (Conversations resolved by AI / Total conversations) x 100</code>
      </p>
      <p>
        A conversation is counted as successful when:
      </p>
      <ul>
        <li>The AI agent handled the entire conversation</li>
        <li>The conversation reached Resolved status</li>
        <li>No escalation to a human agent occurred</li>
        <li>No handoff was triggered at any point</li>
      </ul>

      <DocCallout variant="info" icon={Target} title="What does not count">
        Conversations that are escalated, transferred to a human agent, or abandoned by the user are not counted as successful — even if the AI provided a partial answer.
      </DocCallout>

      <h2 id="factors">What Affects Success Rate</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Base Quality"
          description="Incomplete or outdated knowledge bases are the most common cause of low success rates. If the agent cannot find the answer, it escalates."
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="System Prompt Configuration"
          description="Overly restrictive prompts cause unnecessary escalations. Too-permissive prompts cause incorrect answers and user frustration."
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="User Intent Complexity"
          description="Some queries are inherently complex or require human judgment. These will always need escalation regardless of agent quality."
        />
        <DocFeatureCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Model Selection"
          description="More capable models handle nuanced queries better. If success rate is low, upgrading the model may help before other changes."
        />
      </DocCardGrid>

      <h2 id="improving">Improving Success Rate</h2>
      <h3 id="quick-wins">Quick Wins</h3>
      <ul>
        <li>Review conversations with the lowest success rate and identify common failure patterns</li>
        <li>Add missing knowledge base entries for frequently escalated topics</li>
        <li>Adjust the system prompt to reduce unnecessary escalations</li>
        <li>Enable tool usage for queries that need real-time data</li>
      </ul>

      <h3 id="long-term">Long-Term Improvements</h3>
      <ul>
        <li>Regularly audit and update the knowledge base with new information</li>
        <li>Analyze user feedback to identify recurring pain points</li>
        <li>A/B test different system prompts and measure success rate impact</li>
        <li>Consider fine-tuning for domain-specific queries</li>
      </ul>

      <DocCallout variant="tip" icon={TrendingUp} title="Iterative improvement">
        Improve success rate incrementally. Make one change at a time and measure the impact over at least 7 days before making the next change.
      </DocCallout>

      <h2 id="benchmarks">Benchmarks</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Range</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Assessment</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">90%+</td>
              <td className="py-2 pr-4">Excellent</td>
              <td className="py-2">Maintain. Focus on edge cases and user satisfaction.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">80-90%</td>
              <td className="py-2 pr-4">Good</td>
              <td className="py-2">Review escalation reasons. Fill knowledge gaps.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">70-80%</td>
              <td className="py-2 pr-4">Needs Work</td>
              <td className="py-2">Audit knowledge base. Review system prompt. Consider model upgrade.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Under 70%</td>
              <td className="py-2 pr-4">Critical</td>
              <td className="py-2">Major review needed. Agent configuration or knowledge base has significant gaps.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Metrics"
          href="/docs/key-metrics"
        />
        <DocNextStepCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Per-Agent Analytics"
          href="/docs/per-agent-analytics"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="System Prompts"
          href="/docs/system-prompts"
        />
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Base"
          href="/docs/managing-knowledge-bases"
        />
      </DocCardGrid>
    </DocContent>
  )
}
