import { RefreshCw, Clock, AlertTriangle, Zap, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhookRetryPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Webhook Retry Policy' },
        ]}
        title="Webhook Retry Policy"
        description="How Convio handles failed deliveries. Retry schedule, failure handling, and idempotency requirements."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When your webhook endpoint doesn't respond with a 2xx status code, Convio retries the delivery. This ensures transient failures (temporary downtime, network issues, rate limits) don't cause you to miss events.
      </p>

      <h2 id="how-retries-work">How Retries Work</h2>
      <p>
        Convio uses exponential backoff with jitter for retries. Each retry waits longer than the previous one, giving your server time to recover.
      </p>

      <h2 id="retry-schedule">Retry Schedule</h2>
      <p>
        Failed deliveries are retried up to 5 times with the following delays:
      </p>
      <ul>
        <li><strong>Retry 1:</strong> 1 minute after initial failure</li>
        <li><strong>Retry 2:</strong> 5 minutes after previous retry</li>
        <li><strong>Retry 3:</strong> 30 minutes after previous retry</li>
        <li><strong>Retry 4:</strong> 2 hours after previous retry</li>
        <li><strong>Retry 5:</strong> 24 hours after previous retry (final attempt)</li>
      </ul>
      <p>
        After 5 failed retries, the delivery is marked as <strong>permanently failed</strong>. You can manually replay it from the dashboard.
      </p>

      <DocCallout variant="info" icon={Clock} title="Total retry window">
        The full retry cycle spans approximately 27 hours. Your endpoint has multiple chances to recover from brief outages.
      </DocCallout>

      <h2 id="failure-handling">Handling Failures</h2>
      <p>
        A delivery is considered failed when:
      </p>
      <ul>
        <li>Your endpoint returns a 4xx or 5xx HTTP status code</li>
        <li>Your endpoint doesn't respond within 30 seconds (timeout)</li>
        <li>The connection is refused or the URL is unreachable</li>
        <li>The response body is not valid JSON (if a response body is sent)</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="4xx errors are not retried">
        Client errors (400, 401, 403, 404) indicate a configuration problem, not a transient failure. Convio does not retry 4xx responses. Fix your endpoint and replay the event manually.
      </DocCallout>

      <h2 id="idempotency">Idempotency</h2>
      <p>
        Because retries deliver the same event multiple times, your handler must be <strong>idempotent</strong> — processing the same event twice should produce the same result as processing it once.
      </p>
      <ul>
        <li>Each event has a unique <code>event_id</code> in the payload</li>
        <li>Store processed event IDs and skip duplicates</li>
        <li>Use database constraints (unique constraints on event_id) to prevent double-processing</li>
        <li>Design operations to be safely re-runnable (e.g., upsert instead of insert)</li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Simple idempotency pattern">
        <code>INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING;</code> — if the insert succeeds, process the event. If it's a conflict, skip it.
      </DocCallout>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li><strong>Acknowledge fast:</strong> Return 200 immediately, process asynchronously</li>
        <li><strong>Validate signatures:</strong> Reject invalid payloads before processing</li>
        <li><strong>Log everything:</strong> Keep a record of all received events for debugging</li>
        <li><strong>Monitor failures:</strong> Set up alerts for permanently failed deliveries</li>
        <li><strong>Design for idempotency:</strong> Every handler should be safely re-runnable</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Webhooks"
          href="/docs/testing-webhooks"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Building Workflows"
          href="/docs/webhook-workflows"
        />
      </DocCardGrid>
    </DocContent>
  )
}
