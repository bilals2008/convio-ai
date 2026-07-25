import { Terminal, ArrowRight, FileCode, BookOpen } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function FirstApiRequestPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Making Your First API Request' },
        ]}
        title="Making Your First API Request"
        description="Get up and running with the Convio API in minutes. This guide walks you through your first authenticated request."
      />

      <h2 id="prerequisites">Prerequisites</h2>
      <ul>
        <li>A Convio account with an active organization</li>
        <li>An API key from <strong>Settings → API Keys</strong> (read-write permissions)</li>
        <li>cURL, Postman, or any HTTP client</li>
      </ul>

      <h2 id="curl-example">cURL Example</h2>
      <p>
        The simplest way to test the API is with cURL. Replace <code>conv_your_key</code> with your actual API key.
      </p>
      <pre><code>curl -X GET https://api.convio.com/v1/agents \
  -H "Authorization: Bearer conv_your_key" \
  -H "Content-Type: application/json"</code></pre>
      <p>You should receive a JSON response listing your agents:</p>
      <pre><code>{`{
  "data": [
    {
      "id": "agent_abc123",
      "name": "Support Agent",
      "status": "active",
      "model": "gpt-4o",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "has_more": false
  }
}`}</code></pre>

      <h2 id="common-headers">Common Headers</h2>
      <p>Every request should include these headers:</p>
      <pre><code>Authorization: Bearer conv_your_key
Content-Type: application/json
Accept: application/json</code></pre>

      <DocCallout variant="tip" icon={Terminal} title="Postman collection">
        Import the Convio Postman collection from our GitHub repository for pre-configured requests, environment variables, and example responses. Search for "Convio API" in Postman's public workspace.
      </DocCallout>

      <h2 id="response-format">Response Format</h2>
      <p>All responses follow a consistent structure:</p>
      <pre><code>{`{
  "data": { ... },       // Single object or array
  "meta": {              // Pagination and metadata
    "total": 42,
    "has_more": true,
    "cursor": "eyJpZCI..."
  }
}`}</code></pre>
      <p>
        Successful operations return the data directly. List endpoints include <code>meta</code> with pagination info. Error responses return an <code>error</code> object — see <a href="/docs/api-error-codes">Error Codes & Handling</a>.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileCode}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Conventions"
          href="/docs/api-conventions"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agents API"
          href="/docs/api-agents"
        />
      </DocCardGrid>
    </DocContent>
  )
}
