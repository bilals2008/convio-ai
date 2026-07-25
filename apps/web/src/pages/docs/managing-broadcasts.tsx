import { Radio, BarChart3, Pause, XCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ManagingBroadcastsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Broadcasts' },
        ]}
        title="Managing Broadcasts"
        description="View broadcast history, monitor delivery in real time, pause or cancel active campaigns, and analyze performance."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Broadcasts dashboard gives you full visibility into every campaign — from scheduled drafts to completed sends. Track delivery rates, manage active broadcasts, and learn from past performance.
      </p>

      <h2 id="broadcast-history">Broadcast History</h2>
      <p>
        Every broadcast is logged with its full lifecycle. The history view shows:
      </p>
      <ul>
        <li><strong>Status:</strong> Draft, scheduled, sending, completed, or cancelled</li>
        <li><strong>Schedule:</strong> When it was created and when it sent (or will send)</li>
        <li><strong>Audience:</strong> Total recipients, delivered, failed, and pending counts</li>
        <li><strong>Template:</strong> Which template was used and its approval status</li>
        <li><strong>Performance:</strong> Delivery rate, read rate, and response rate</li>
      </ul>

      <h2 id="real-time-monitoring">Real-Time Monitoring</h2>
      <p>
        While a broadcast is sending, the dashboard shows live progress:
      </p>
      <ul>
        <li>Messages delivered counter updating in real time</li>
        <li>Delivery queue depth and estimated completion time</li>
        <li>Failed message count with error breakdown</li>
        <li>Pause/resume controls for active sends</li>
      </ul>

      <h2 id="pause-cancel">Pause & Cancel</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Pause}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Pausing a Broadcast"
          description="Pause an active broadcast to stop further delivery. Already-sent messages cannot be recalled. Resume to continue sending."
          href="#pause"
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Cancelling a Broadcast"
          description="Cancel a scheduled or active broadcast. Scheduled broadcasts can be cancelled before the send window opens."
          href="#cancel"
        />
      </DocCardGrid>

      <h3 id="pause">Pausing</h3>
      <p>
        Click "Pause" on any sending broadcast. The system stops queueing new messages but finishes any that are already in WhatsApp's delivery pipeline. Click "Resume" to continue.
      </p>

      <h3 id="cancel">Cancelling</h3>
      <p>
        Scheduled broadcasts can be cancelled at any time before the send window. Active broadcasts can be cancelled to stop further delivery — but messages already sent cannot be recalled.
      </p>

      <DocCallout variant="warning" icon={XCircle} title="No recall on sent messages">
        WhatsApp doesn't support message recall for delivered messages. Cancelling a broadcast stops future delivery only.
      </DocCallout>

      <h2 id="delivery-reports">Delivery Reports</h2>
      <p>
        After a broadcast completes, download a detailed delivery report:
      </p>
      <ul>
        <li>Per-recipient delivery status: delivered, read, failed, or undeliverable</li>
        <li>Failure reasons: invalid number, opted out, template rejected, rate limited</li>
        <li>Read timestamps for delivered messages</li>
        <li>Response data: which recipients replied and when</li>
      </ul>

      <h2 id="analytics">Analytics</h2>
      <p>
        Each broadcast generates analytics you can compare across campaigns:
      </p>
      <ul>
        <li><strong>Delivery rate:</strong> Percentage of messages successfully delivered</li>
        <li><strong>Read rate:</strong> Percentage of delivered messages that were read</li>
        <li><strong>Response rate:</strong> Percentage of recipients who replied</li>
        <li><strong>Opt-out rate:</strong> Percentage who blocked or reported after receiving</li>
        <li><strong>Cost:</strong> Total cost based on message volume and destination country</li>
      </ul>

      <DocCallout variant="tip" icon={BarChart3} title="Benchmark your performance">
        Track delivery and response rates over time. A sudden drop in delivery rate often means your list needs cleaning — too many invalid or opted-out numbers.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Broadcast"
          href="/docs/creating-broadcast"
        />
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Templates"
          href="/docs/whatsapp-templates"
        />
      </DocCardGrid>
    </DocContent>
  )
}
