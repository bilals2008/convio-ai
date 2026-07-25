import { ArrowDown, Filter, ArrowUpDown, BookOpen, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiConventionsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'API Conventions' },
        ]}
        title="API Conventions"
        description="Consistent patterns for pagination, filtering, sorting, and error handling across all API endpoints."
      />

      <h2 id="pagination">Cursor-Based Pagination</h2>
      <p>
        List endpoints use cursor-based pagination instead of page numbers. This provides stable, efficient traversal of large datasets without the offset drift problem.
      </p>
      <pre><code>GET /v1/conversations?limit=20&cursor=eyJpZCI6ImN2XzEyMzQ1In0</code></pre>
      <p>The response includes pagination metadata:</p>
      <pre><code>{`{
  "data": [...],
  "meta": {
    "total": 150,
    "has_more": true,
    "cursor": "eyJpZCI6ImN2XzY3ODkwIn0"
  }
}`}</code></pre>
      <ul>
        <li><code>limit</code> — Number of items per page (default: 20, max: 100)</li>
        <li><code>cursor</code> — Opaque cursor from the previous response's <code>meta.cursor</code></li>
        <li><code>has_more</code> — Boolean indicating more pages exist</li>
        <li><code>total</code> — Total count of matching items</li>
      </ul>

      <DocCallout variant="tip" icon={ArrowDown} title="First request omits cursor">
        On the first request, omit the <code>cursor</code> parameter. The API returns the first page. Use the returned <code>meta.cursor</code> for subsequent pages.
      </DocCallout>

      <h2 id="response-format">Response Format</h2>
      <p>
        Every response returns JSON. Successful responses (2xx) include a <code>data</code> field. List responses also include <code>meta</code>. The response structure is consistent across all endpoints.
      </p>
      <pre><code>{`// Single resource
{
  "data": {
    "id": "agent_abc123",
    "name": "Support Agent",
    "status": "active"
  }
}

// List of resources
{
  "data": [
    { "id": "agent_abc123", "name": "Support Agent" },
    { "id": "agent_def456", "name": "Sales Agent" }
  ],
  "meta": {
    "total": 2,
    "has_more": false,
    "cursor": null
  }
}`}</code></pre>

      <h2 id="error-format">Error Format</h2>
      <p>
        Error responses include an <code>error</code> object with a machine-readable <code>code</code>, a human-readable <code>message</code>, and optional <code>details</code> for validation errors:
      </p>
      <pre><code>{`{
  "error": {
    "code": "validation_error",
    "message": "Name is required",
    "details": [
      {
        "field": "name",
        "message": "This field is required",
        "type": "required"
      }
    ]
  }
}`}</code></pre>

      <h2 id="filtering">Filtering</h2>
      <p>
        List endpoints support filtering via query parameters. Filter parameters are resource-specific. Common filters include <code>status</code>, <code>created_at</code>, and <code>model</code>:
      </p>
      <pre><code>GET /v1/agents?status=active&model=gpt-4o
GET /v1/conversations?status=active&created_after=2026-01-01
GET /v1/messages?conversation_id=cv_abc123</code></pre>

      <h2 id="sorting">Sorting</h2>
      <p>
        Use the <code>sort</code> and <code>order</code> query parameters to control sort order:
      </p>
      <pre><code>GET /v1/conversations?sort=created_at&order=desc
GET /v1/agents?sort=name&order=asc</code></pre>
      <ul>
        <li><code>sort</code> — The field to sort by (e.g., <code>created_at</code>, <code>name</code>, <code>updated_at</code>)</li>
        <li><code>order</code> — <code>asc</code> (default) or <code>desc</code></li>
      </ul>

      <h2 id="http-methods">HTTP Methods</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={ArrowDown}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="GET"
          description="Retrieve resources. Safe and idempotent. No request body."
          href="#get"
        />
        <DocFeatureCard
          icon={Filter}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="POST"
          description="Create resources or trigger actions. Request body required. Returns the created resource."
          href="#post"
        />
      </DocCardGrid>
      <ul>
        <li><code>GET</code> — Retrieve resources or lists</li>
        <li><code>POST</code> — Create new resources or trigger actions</li>
        <li><code>PATCH</code> — Partially update existing resources</li>
        <li><code>DELETE</code> — Remove resources</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agents API"
          href="/docs/api-agents"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Error Codes & Handling"
          href="/docs/api-error-codes"
        />
      </DocCardGrid>
    </DocContent>
  )
}
