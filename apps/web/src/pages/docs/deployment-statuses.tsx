import { Settings, CheckCircle2, AlertTriangle, PauseCircle, Loader2, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DeploymentStatusesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Deployment Statuses' },
        ]}
        title="Deployment Statuses"
        description="Every deployment has a status that reflects its current state. Understanding each status helps you diagnose issues quickly."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Deployments transition through four statuses. The dashboard shows the current status for each deployment with a color-coded indicator.
      </p>

      <h2 id="configuring">Configuring</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-500"
          title="Configuring"
          description="Setup is in progress. The deployment exists but the channel connection has not been established yet."
          href="#configuring"
        />
      </DocCardGrid>

      <h3 id="configuring-what">What This Means</h3>
      <ul>
        <li>You have created the deployment but haven't completed channel setup</li>
        <li>Required credentials or tokens are missing or invalid</li>
        <li>Webhook verification is pending</li>
        <li>The deployment cannot receive messages in this state</li>
      </ul>

      <h3 id="configuring-fix">How to Resolve</h3>
      <p>
        Complete the channel configuration form. Ensure all required fields are filled, credentials are valid, and webhook URLs are correctly configured. Once all requirements are met, the status will automatically transition to <strong>Active</strong> after a successful connection test.
      </p>

      <h2 id="active">Active</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={CheckCircle2}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Active"
          description="Live and serving. The channel connection is established and the deployment is receiving and responding to messages."
          href="#active"
        />
      </DocCardGrid>

      <h3 id="active-what">What This Means</h3>
      <ul>
        <li>The channel connection is healthy</li>
        <li>Webhook is verified and receiving events</li>
        <li>Messages are being delivered and responses sent</li>
        <li>The deployment appears in the active deployments list</li>
      </ul>

      <h3 id="active-monitoring">Monitoring</h3>
      <p>
        Active deployments show real-time metrics — messages received, response times, and error rates. Check the deployment dashboard for ongoing health monitoring.
      </p>

      <h2 id="error">Error</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Error"
          description="Connection issues detected. The deployment cannot process messages until the underlying problem is resolved."
          href="#error"
        />
      </DocCardGrid>

      <h3 id="error-causes">Common Causes</h3>
      <ul>
        <li><strong>Invalid credentials:</strong> Bot token expired, API key revoked, or phone number deactivated</li>
        <li><strong>Webhook failure:</strong> Webhook URL unreachable, SSL certificate expired, or endpoint returning errors</li>
        <li><strong>Rate limiting:</strong> Channel provider has temporarily blocked the connection due to excessive requests</li>
        <li><strong>Account suspension:</strong> The channel account has been suspended or restricted by the platform</li>
      </ul>

      <h3 id="error-fix">How to Resolve</h3>
      <p>
        Check the error message displayed on the deployment card for specific details. Common fixes include refreshing credentials, verifying webhook URLs, and checking channel provider dashboards for account status.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Automatic retries">
        Convio automatically retries failed connections with exponential backoff. If the issue is transient (rate limiting, temporary outage), the deployment may recover on its own within a few minutes.
      </DocCallout>

      <h2 id="paused">Paused</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={PauseCircle}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Paused"
          description="Temporarily disabled. The deployment exists and is configured but not receiving or processing messages."
          href="#paused"
        />
      </DocCardGrid>

      <h3 id="paused-why">Why Pause</h3>
      <ul>
        <li><strong>Maintenance:</strong> Temporarily disable while updating agent configuration</li>
        <li><strong>Cost control:</strong> Pause low-priority deployments during off-hours</li>
        <li><strong>Incident response:</strong> Stop processing while investigating an issue</li>
        <li><strong>Staged rollout:</strong> Pause before enabling for a new audience segment</li>
      </ul>

      <h3 id="paused-resume">Resuming</h3>
      <p>
        Click <strong>Resume</strong> on the deployment card. The status transitions to <strong>Active</strong> and the channel connection is re-established. No configuration changes are needed.
      </p>

      <h2 id="status-transitions">Status Transitions</h2>
      <ul>
        <li><strong>Configuring → Active:</strong> All channel requirements met and connection verified</li>
        <li><strong>Active → Error:</strong> Connection issue detected by health checks</li>
        <li><strong>Active → Paused:</strong> Manually paused by user</li>
        <li><strong>Error → Active:</strong> Issue resolved and connection re-verified</li>
        <li><strong>Paused → Active:</strong> Manually resumed by user</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Deployment"
          href="/docs/creating-deployment"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
