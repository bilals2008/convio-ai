import { DollarSign, BarChart3, Zap, Database, Settings, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CostOptimizationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Cost Optimization' },
        ]}
        title="Cost Optimization"
        description="Manage token usage, select cost-effective models, and monitor spending to stay within budget."
      />

      <h2 id="overview">Overview</h2>
      <p>
        AI agent costs scale with usage. A single conversation can cost anywhere from a fraction of a cent to several dollars depending on the model, token count, and tools invoked. Cost optimization isn't about cutting corners — it's about spending your budget where it has the most impact.
      </p>

      <h2 id="token-management">Token Management Strategies</h2>
      <p>
        Tokens are the fundamental unit of cost. Every token in your system prompt, conversation history, knowledge base context, and response contributes to your bill:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Component</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Impact</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Optimization</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">System Prompt</td>
              <td className="py-2 pr-4">Sent with every message</td>
              <td className="py-2">Keep under 800 tokens. Every extra token multiplies across all messages.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Conversation History</td>
              <td className="py-2 pr-4">Grows with each turn</td>
              <td className="py-2">Limit to last 5–10 messages. Summarize older messages if needed.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Knowledge Retrieval</td>
              <td className="py-2 pr-4">Added per query</td>
              <td className="py-2">Tune retrieval limits. Return 3–5 relevant chunks instead of 10.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Response</td>
              <td className="py-2 pr-4">Generated per message</td>
              <td className="py-2">Set response length limits. Use concise prompts that request brief answers.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="model-selection">Model Selection for Cost</h2>
      <p>
        Model pricing varies significantly. Choose the cheapest model that meets your quality requirements:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Fast Models"
          description="GPT-4o-mini, Claude Haiku — best for simple Q&A and FAQ responses. Costs 10–50x less than flagship models."
          href="/docs/available-models"
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Balanced Models"
          description="GPT-4o, Claude Sonnet — good balance of quality and cost. Use for most support conversations and tool-calling scenarios."
          href="/docs/available-models"
        />
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Premium Models"
          description="GPT-4, Claude Opus — highest quality. Reserve for complex reasoning, research tasks, or when accuracy is critical."
          href="/docs/available-models"
        />
      </DocCardGrid>

      <DocCallout variant="tip" icon={Lightbulb} title="Match model to task">
        Not every conversation needs a premium model. Use a fast model for initial triage and escalate to a powerful model only when the query requires it. This can reduce costs by 50–70% without sacrificing quality where it matters.
      </DocCallout>

      <h2 id="usage-monitoring">Usage Monitoring</h2>
      <p>
        You can't optimize what you don't measure. Track these metrics to identify cost drivers:
      </p>
      <ul>
        <li><strong>Tokens per conversation:</strong> Average tokens consumed per conversation. High values indicate bloated prompts or over-retrieval.</li>
        <li><strong>Cost per resolution:</strong> Total cost divided by resolved conversations. This is your true cost metric.</li>
        <li><strong>Tool call frequency:</strong> Frequent tool calls increase both tokens and latency. Identify unnecessary tool invocations.</li>
        <li><strong>Model usage distribution:</strong> Track which models are used and how often. Ensure premium models are used selectively.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Set spending limits">
        Configure monthly budget alerts on your AI provider accounts. An unexpected spike — whether from a bug, abuse, or a successful product launch — should trigger a notification before it becomes a crisis.
      </DocCallout>

      <h2 id="reducing-calls">Reducing Unnecessary API Calls</h2>
      <p>
        Every API call has a fixed overhead beyond token costs. Reduce calls where possible:
      </p>
      <ol>
        <li><strong>Cache common responses:</strong> FAQ-type questions don't need fresh inference every time.</li>
        <li><strong>Batch tool calls:</strong> When multiple tools can answer a question, invoke them in parallel rather than sequentially.</li>
        <li><strong>Use retrieval over generation:</strong> If the answer exists in your knowledge base, retrieve it rather than generating from the model.</li>
        <li><strong>Short-circuit simple queries:</strong> Detect simple greetings or single-word queries and respond without invoking the full pipeline.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Analytics"
          href="/docs/analytics"
        />
        <DocNextStepCard
          icon={TrendingDown}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Performance Optimization"
          href="/docs/performance-optimization"
        />
      </DocCardGrid>
    </DocContent>
  )
}
