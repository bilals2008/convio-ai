import { Clock, AlertTriangle, ArrowRight, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function RateLimitingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Rate Limiting' },
        ]}
        title="Rate Limiting"
        description="Understand rate limits, read rate limit headers, handle 429 responses, and implement best practices for high-throughput integrations."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio enforces rate limits per API key to ensure fair usage and platform stability. Limits are applied at the endpoint tier level. When you exceed a limit, the API returns <code>429 Too Many Requests</code>.
      </p>

      <h2 id="limits-by-tier">Limits by Endpoint Tier</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Standard Endpoints"
          description="1,000 requests per minute. Covers agents, conversations, knowledge bases, and most CRUD operations."
          href="#standard"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Streaming Endpoints"
          description="50 concurrent streams per API key. Separate concurrency limit, not a request count."
          href="#streaming"
        />
      </DocCardGrid>

      <h3 id="standard">Standard Endpoints</h3>
      <ul>
        <li><code>GET /v1/agents</code> — 1,000 req/min</li>
        <li><code>POST /v1/conversations/:id/messages</code> — 1,000 req/min</li>
        <li><code>GET /v1/knowledge-bases/:id/search</code> — 500 req/min</li>
        <li><code>POST /v1/knowledge-bases/:id/documents</code> — 100 req/min</li>
      </ul>

      <h3 id="streaming">Streaming Endpoints</h3>
      <ul>
        <li>50 concurrent streams per API key</li>
        <li>Each stream can run for up to 5 minutes</li>
        <li>Opening a new stream beyond the limit returns <code>429</code></li>
      </ul>

      <h2 id="rate-limit-headers">Rate Limit Headers</h2>
      <p>Every response includes these headers to help you track your usage:</p>
      <pre><code>{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1753526460
Retry-After: 30`}</code></pre>
      <ul>
        <li><code>X-RateLimit-Limit</code> — Maximum requests in the current window</li>
        <li><code>X-RateLimit-Remaining</code> — Requests remaining in the current window</li>
        <li><code>X-RateLimit-Reset</code> — Unix timestamp when the window resets</li>
        <li><code>Retry-After</code> — Seconds to wait (only on <code>429</code> responses)</li>
      </ul>

      <h2 id="handling-429">Handling 429 Responses</h2>
      <p>When you receive a <code>429</code> response, wait for the specified retry duration before retrying:</p>
      <pre><code>{`async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.log(\`Rate limited. Retrying in \${retryAfter}s...\`);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    return response;
  }
  throw new Error('Max retries exceeded');
}`}</code></pre>

      <DocCallout variant="warning" icon={AlertTriangle} title="Respect Retry-After">
        The <code>Retry-After</code> header tells you exactly how many seconds to wait. Ignoring it and retrying immediately will result in repeated <code>429</code> responses and potential temporary bans.
      </DocCallout>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li><strong>Cache responses:</strong> Use ETags and <code>If-None-Match</code> headers to avoid redundant requests</li>
        <li><strong>Batch operations:</strong> Use list endpoints with filters instead of many individual requests</li>
        <li><strong>Monitor headers:</strong> Check <code>X-RateLimit-Remaining</code> and slow down before hitting the limit</li>
        <li><strong>Exponential backoff:</strong> Wait longer between retries on repeated <code>429</code> responses</li>
        <li><strong>Separate keys:</strong> Use different API keys for different services to distribute rate limits</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Error Codes & Handling"
          href="/docs/api-error-codes"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Authentication & API Keys"
          href="/docs/api-authentication"
        />
      </DocCardGrid>
    </DocContent>
  )
}
