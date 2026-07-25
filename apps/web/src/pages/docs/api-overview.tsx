import { Globe, Shield, Clock, Code, ArrowRight, BookOpen } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiOverviewPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'API Overview' },
        ]}
        title="API Overview"
        description="Build custom integrations, automate workflows, and extend Convio with a clean RESTful API. Every feature in the dashboard is available via the API."
      />

      <h2 id="design-principles">Design Principles</h2>
      <p>
        Convio's API follows RESTful conventions. Resources are represented as JSON objects, endpoints map to those resources with standard HTTP methods, and responses use predictable status codes. If you've worked with Stripe, GitHub, or similar developer-focused APIs, Convio will feel familiar.
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="RESTful Design"
          description="Standard HTTP methods (GET, POST, PATCH, DELETE) with resource-oriented URLs. No magic, no surprises."
          href="#rest"
        />
        <DocFeatureCard
          icon={Code}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="JSON Everywhere"
          description="All request and response bodies are JSON. Content-Type headers must be application/json."
          href="#json"
        />
      </DocCardGrid>

      <h2 id="base-url">Base URL</h2>
      <p>All API requests go to a single base URL:</p>
      <pre><code>https://api.convio.com/v1</code></pre>
      <p>
        Replace <code>v1</code> with a different version identifier if you're using a pinned API version. The current stable version is <code>v1</code>.
      </p>

      <h2 id="content-type">Content Type</h2>
      <p>
        Every request must include the <code>Content-Type: application/json</code> header. Every response returns JSON. The API does not support XML, form-encoded, or multipart request bodies for mutation endpoints (file uploads are the only exception — see Knowledge Bases API).
      </p>

      <h2 id="authentication">Authentication</h2>
      <p>
        All API requests require a Bearer token in the <code>Authorization</code> header. Generate API keys from your organization's settings page. See <a href="/docs/api-authentication">Authentication & API Keys</a> for details.
      </p>
      <pre><code>curl -H "Authorization: Bearer conv_your_api_key_here" \
  https://api.convio.com/v1/agents</code></pre>

      <DocCallout variant="warning" icon={Shield} title="Never expose API keys client-side">
        API keys have full access to your organization's data. Never embed them in frontend code, mobile apps, or public repositories. Use them only in server-side environments where the key cannot be extracted.
      </DocCallout>

      <h2 id="rate-limits">Rate Limits</h2>
      <p>
        The API enforces rate limits per API key. Limits vary by endpoint tier. When you exceed a limit, the API returns <code>429 Too Many Requests</code> with a <code>Retry-After</code> header. See <a href="/docs/api-rate-limiting">Rate Limiting</a> for full details.
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Standard Endpoints"
          description="1,000 requests per minute per API key. Covers agents, conversations, knowledge bases, and most CRUD operations."
          href="#rate-standard"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming Endpoints"
          description="50 concurrent streams per API key. Streaming uses a separate concurrency limit, not a request count."
          href="#rate-streaming"
        />
      </DocCardGrid>

      <h2 id="versioning">Versioning</h2>
      <p>
        The API is versioned via the URL path (<code>/v1/</code>). When we introduce breaking changes, we release a new version and maintain the previous version for 12 months. Non-breaking additions (new fields, new endpoints) are added to the current version without a version bump.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Authentication & API Keys"
          href="/docs/api-authentication"
        />
        <DocNextStepCard
          icon={BookOpen}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Making Your First API Request"
          href="/docs/api-first-request"
        />
      </DocCardGrid>
    </DocContent>
  )
}
