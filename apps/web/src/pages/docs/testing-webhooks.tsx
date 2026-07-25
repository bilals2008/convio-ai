import { Webhook, Play, RefreshCw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function TestingWebhooksPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Testing Webhooks' },
        ]}
        title="Testing Webhooks"
        description="Use Convio's test tools to send sample events, inspect payloads, and debug delivery failures before going live."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio provides built-in tools to test your webhook endpoint without affecting real data. Send test events, inspect the exact payloads your server receives, and debug issues before subscribing to live events.
      </p>

      <h2 id="test-delivery">Test Delivery Tool</h2>
      <p>
        The webhook test tool lets you send sample events on demand:
      </p>
      <ul>
        <li>Go to your webhook settings and click "Send Test Event"</li>
        <li>Select the event type to simulate (e.g., message.received, conversation.created)</li>
        <li>Convio sends the event with a sample payload to your endpoint</li>
        <li>Check the delivery log for the response status and timing</li>
      </ul>

      <DocCallout variant="tip" icon={Play} title="Test with real data">
        Use the test tool with your actual endpoint code — not a mock. This catches signature verification issues, timeout problems, and parsing errors.
      </DocCallout>

      <h2 id="inspecting-payloads">Inspecting Payloads</h2>
      <p>
        Every delivery — test or live — is logged with its full details:
      </p>
      <ul>
        <li><strong>Request headers:</strong> All headers sent with the delivery, including the signature</li>
        <li><strong>Request body:</strong> The exact JSON payload sent to your endpoint</li>
        <li><strong>Response status:</strong> The HTTP status code your server returned</li>
        <li><strong>Response body:</strong> Your server's response (if any)</li>
        <li><strong>Timing:</strong> How long your server took to respond</li>
      </ul>

      <h2 id="debugging-failures">Debugging Failures</h2>
      <p>
        Common failure modes and how to fix them:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Webhook}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="4xx / 5xx Response"
          description="Your endpoint returned an error. Check your server logs, verify the URL is correct, and ensure your endpoint handles POST requests."
          href="#debug-status"
        />
        <DocFeatureCard
          icon={Webhook}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Timeout (>30s)"
          description="Your endpoint didn't respond in time. Avoid heavy processing in the webhook handler — acknowledge immediately, process asynchronously."
          href="#debug-timeout"
        />
      </DocCardGrid>

      <h3 id="debug-status">HTTP Errors</h3>
      <p>
        If your endpoint returns 4xx or 5xx, check:
      </p>
      <ul>
        <li>Server logs for exceptions or unhandled errors</li>
        <li>Content-Type handling — Convio sends <code>application/json</code></li>
        <li>Body parsing — some frameworks don't auto-parse JSON</li>
        <li>Route configuration — ensure your endpoint is registered for POST</li>
      </ul>

      <h3 id="debug-timeout">Timeouts</h3>
      <p>
        Convio expects a response within 30 seconds. If your handler does heavy work:
      </p>
      <ul>
        <li>Acknowledge immediately with 200</li>
        <li>Queue the event for async processing</li>
        <li>Use a message queue (Redis, SQS, etc.) for the actual work</li>
      </ul>

      <h2 id="replaying-events">Replaying Events</h2>
      <p>
        Failed deliveries are automatically retried (see Webhook Retry Policy). But you can also manually replay any past event:
      </p>
      <ul>
        <li>Go to the delivery log for any event</li>
        <li>Click "Replay" to resend the exact same payload</li>
        <li>Replayed events get a new delivery ID but the same event data</li>
        <li>Use this after fixing bugs in your handler to verify the fix</li>
      </ul>

      <DocCallout variant="info" icon={RefreshCw} title="Idempotent replay">
        Event IDs are unique per event, not per delivery. If your handler is idempotent (processes the same event ID only once), replayed events won't create duplicates.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Verifying Signatures"
          href="/docs/webhook-security"
        />
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Retry Policy"
          href="/docs/webhook-retry"
        />
      </DocCardGrid>
    </DocContent>
  )
}
