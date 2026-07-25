import { Gauge, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function RateLimitsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Rate Limits & Quotas' },
        ]}
        title="Rate Limits & Quotas"
        description="Understand provider rate limits, Convio usage limits, and how to manage costs effectively."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every AI provider enforces rate limits to manage load on their infrastructure. These limits affect how many requests your agents can make per minute or per day. Convio also applies its own usage limits depending on your plan. Understanding both sets of limits helps you plan your agent deployment.
      </p>

      <h2 id="provider-limits">Provider Rate Limits</h2>
      <p>
        Rate limits vary by provider and plan. Here are the typical limits:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Provider</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Requests/min</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Tokens/min</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Daily Limit</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI (Tier 1)</td>
              <td className="py-2 pr-4">500</td>
              <td className="py-2 pr-4">80K</td>
              <td className="py-2">None</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI (Tier 5)</td>
              <td className="py-2 pr-4">10,000</td>
              <td className="py-2 pr-4">2M</td>
              <td className="py-2">None</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Anthropic</td>
              <td className="py-2 pr-4">Varies by model</td>
              <td className="py-2 pr-4">Varies by model</td>
              <td className="py-2">None</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Google</td>
              <td className="py-2 pr-4">Varies by model</td>
              <td className="py-2 pr-4">Varies by model</td>
              <td className="py-2">Free tier limits</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Groq</td>
              <td className="py-2 pr-4">30</td>
              <td className="py-2 pr-4">6K</td>
              <td className="py-2">Varies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="info" icon={Gauge} title="Limits are per API key">
        Rate limits are enforced per API key. If you hit limits on one key, adding a second key for the same provider effectively doubles your quota. This is a common scaling strategy.
      </DocCallout>

      <h2 id="convio-limits">Convio Usage Limits</h2>
      <p>
        Convio applies its own limits based on your subscription plan. These include:
      </p>
      <ul>
        <li><strong>Monthly conversation limit:</strong> The maximum number of conversations your organization can process per month.</li>
        <li><strong>Agent limit:</strong> The maximum number of active agents you can create.</li>
        <li><strong>Storage limit:</strong> The maximum amount of knowledge base storage available.</li>
      </ul>
      <p>
        Convio's limits are separate from provider rate limits. You may hit provider limits before Convio limits, or vice versa. Monitor both to avoid service interruptions.
      </p>

      <h2 id="managing-costs">Managing Costs</h2>
      <p>
        AI costs scale with usage. Here are practical strategies to keep costs under control:
      </p>

      <h3 id="cost-strategies">Cost Control Strategies</h3>
      <ul>
        <li><strong>Use cheaper models for high-volume agents:</strong> GPT-4o Mini, Claude 3.5 Haiku, and Gemini 2.5 Flash offer good quality at low cost.</li>
        <li><strong>Set provider spending limits:</strong> Most providers let you set hard spending caps at the account level.</li>
        <li><strong>Monitor usage regularly:</strong> Check your provider dashboard weekly to catch cost spikes early.</li>
        <li><strong>Optimize prompts:</strong> Shorter, more focused prompts reduce token usage. Remove unnecessary context from system prompts.</li>
        <li><strong>Use BYOK:</strong> With your own keys, you pay providers directly with no markup. This gives you full cost visibility.</li>
      </ul>

      <DocCallout variant="warning" icon={DollarSign} title="Costs scale with conversation volume">
        An agent handling 100 conversations/day costs 10x more than one handling 10 conversations/day. Start with conservative estimates and scale up as you validate value.
      </DocCallout>

      <h2 id="rate-limit-headers">Rate Limit Headers</h2>
      <p>
        Provider APIs include rate limit information in response headers. These headers help you understand your current usage and remaining quota:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Header</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-[12px] text-foreground">X-RateLimit-Remaining</td>
              <td className="py-2">Number of requests remaining in the current window.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-[12px] text-foreground">X-RateLimit-Reset</td>
              <td className="py-2">Time (in seconds) until the rate limit window resets.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-[12px] text-foreground">Retry-After</td>
              <td className="py-2">Seconds to wait before retrying after a 429 error.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-[12px] text-foreground">OpenAI-Usage</td>
              <td className="py-2">Token usage for the current request (OpenAI specific).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Convio automatically handles rate limit retries with exponential backoff. If a request is rate-limited, Convio waits and retries up to 3 times before failing the request.
      </p>

      <h2 id="handling-errors">Handling Rate Limit Errors</h2>
      <p>
        When rate limits are exceeded, Convio returns an error to the user. To handle this gracefully:
      </p>
      <ol>
        <li><strong>Configure fallback models:</strong> Set up a secondary provider as a backup in case the primary is rate-limited.</li>
        <li><strong>Add queuing:</strong> For high-volume agents, implement message queuing to smooth out traffic spikes.</li>
        <li><strong>Distribute across keys:</strong> Use multiple API keys to increase total available quota.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={DollarSign}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Using Different Providers"
          href="/docs/using-different-providers"
        />
        <DocNextStepCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Key Security"
          href="/docs/api-key-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
