import { AlertTriangle, ArrowRight, Shield, RefreshCw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ErrorCodesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Error Codes & Handling' },
        ]}
        title="Error Codes & Handling"
        description="All API error codes, their meanings, and recovery strategies. Build resilient integrations with proper error handling."
      />

      <h2 id="error-format">Error Format</h2>
      <p>All error responses follow a consistent JSON structure:</p>
      <pre><code>{`{
  "error": {
    "code": "validation_error",
    "message": "Human-readable error description",
    "details": [
      {
        "field": "name",
        "message": "This field is required",
        "type": "required"
      }
    ]
  }
}`}</code></pre>

      <h2 id="http-status-codes">HTTP Status Codes</h2>
      <ul>
        <li><code>200 OK</code> — Request succeeded</li>
        <li><code>201 Created</code> — Resource was created</li>
        <li><code>204 No Content</code> — Successful deletion</li>
        <li><code>400 Bad Request</code> — Invalid request body or parameters</li>
        <li><code>401 Unauthorized</code> — Missing or invalid API key</li>
        <li><code>403 Forbidden</code> — API key lacks required permissions</li>
        <li><code>404 Not Found</code> — Resource does not exist</li>
        <li><code>409 Conflict</code> — Resource state conflict (e.g., duplicate name)</li>
        <li><code>422 Unprocessable Entity</code> — Valid JSON but semantically invalid</li>
        <li><code>429 Too Many Requests</code> — Rate limit exceeded</li>
        <li><code>500 Internal Server Error</code> — Unexpected server error</li>
        <li><code>503 Service Unavailable</code> — Temporary maintenance or overload</li>
      </ul>

      <h2 id="error-codes">Error Codes</h2>

      <h3 id="authentication-errors">Authentication Errors</h3>
      <pre><code>{`unauthorized              // 401 - Missing or invalid API key
forbidden                 // 403 - API key lacks required permission
invalid_api_key           // 401 - API key format is invalid
key_expired               // 401 - API key has been revoked`}</code></pre>

      <h3 id="validation-errors">Validation Errors</h3>
      <pre><code>{`validation_error          // 400 - Request body failed validation
required_field            // 400 - A required field is missing
invalid_format            // 400 - Field value doesn't match expected format
invalid_enum_value        // 400 - Field value is not one of the allowed values
string_too_long           // 400 - String exceeds maximum length
string_too_short          // 400 - String is below minimum length
invalid_url               // 400 - URL is not valid
invalid_email             // 400 - Email address is not valid`}</code></pre>

      <h3 id="resource-errors">Resource Errors</h3>
      <pre><code>{`not_found                 // 404 - Resource does not exist
already_exists            // 409 - Resource already exists (e.g., duplicate name)
conflict                  // 409 - Resource state prevents this operation
cannot_delete_active      // 409 - Cannot delete an active resource
invalid_status_transition // 400 - Status change is not allowed`}</code></pre>

      <h3 id="rate-limit-errors">Rate Limit Errors</h3>
      <pre><code>{`rate_limit_exceeded       // 429 - Too many requests
concurrent_limit_exceeded // 429 - Too many concurrent streams`}</code></pre>

      <h3 id="server-errors">Server Errors</h3>
      <pre><code>{`internal_error            // 500 - Unexpected server error
service_unavailable       // 503 - Temporary maintenance
upstream_error            // 502 - External service failure (AI provider)
timeout                   // 504 - Request timed out`}</code></pre>

      <h2 id="recovery-strategies">Recovery Strategies</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Retry with Backoff"
          description="For 429, 500, 502, 503, and 504 errors. Exponential backoff starting at 1s, max 60s, with jitter."
          href="#retry"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Don't Retry Validation Errors"
          description="400, 401, 403, 404, 409, and 422 errors are client-side. Fix the request, don't retry."
          href="#no-retry"
        />
      </DocCardGrid>

      <h3 id="retry">Retry with Backoff</h3>
      <pre><code>{`function getRetryDelay(attempt) {
  const baseDelay = 1000;  // 1 second
  const maxDelay = 60000;  // 60 seconds
  const jitter = Math.random() * 1000;
  return Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);
}`}</code></pre>

      <h3 id="no-retry">When Not to Retry</h3>
      <ul>
        <li><code>400</code> — Fix the request body</li>
        <li><code>401</code> — Verify or regenerate your API key</li>
        <li><code>403</code> — Check key permissions</li>
        <li><code>404</code> — Verify the resource ID</li>
        <li><code>409</code> — Resolve the state conflict first</li>
      </ul>

      <DocCallout variant="tip" icon={AlertTriangle} title="Log all errors">
        Log the full error response including the <code>code</code>, <code>message</code>, and <code>details</code>. This data is invaluable for debugging integration issues and monitoring error rates.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limiting"
          href="/docs/api-rate-limiting"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming API"
          href="/docs/api-streaming"
        />
      </DocCardGrid>
    </DocContent>
  )
}
