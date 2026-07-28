import { Shield, Key, RefreshCw, Eye, Trash2, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiKeySecurityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Security Best Practices' },
        ]}
        title="API Key Security Best Practices"
        description="Protect your API keys with rotation schedules, access controls, and monitoring."
      />

      <h2 id="overview">Overview</h2>
      <p>
        API keys grant access to paid AI services. A compromised key can lead to unauthorized usage, unexpected charges, and data exposure. Following security best practices protects your organization from these risks.
      </p>

      <h2 id="key-rotation">Key Rotation Schedule</h2>
      <p>
        Rotate API keys regularly to limit the window of exposure if a key is compromised. Recommended rotation schedules:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Scenario</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Rotation Frequency</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Reason</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Production keys</td>
              <td className="py-2 pr-4">Every 90 days</td>
              <td className="py-2">Limits exposure window for undetected leaks.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Development keys</td>
              <td className="py-2 pr-4">Every 90 days</td>
              <td className="py-2">Dev keys often have broader access.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">After team member leaves</td>
              <td className="py-2 pr-4">Immediately</td>
              <td className="py-2">Prevents unauthorized access by former team members.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">After suspected compromise</td>
              <td className="py-2 pr-4">Immediately</td>
              <td className="py-2">Stops ongoing unauthorized usage.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">After code repository leak</td>
              <td className="py-2 pr-4">Immediately</td>
              <td className="py-2">Keys in git history are considered compromised.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="rotation-process">Rotation Process</h3>
      <ol>
        <li>Generate a new key in the provider's dashboard.</li>
        <li>Update the key in Convio (Settings → Provider Keys → Update).</li>
        <li>Verify agents work with the new key (test in Playground).</li>
        <li>Revoke the old key in the provider's dashboard.</li>
        <li>Log the rotation in your team's security documentation.</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Zero-downtime rotation">
        Convio replaces keys atomically. Agents continue using the old key until the update is saved, then immediately switch to the new key. There's no downtime during rotation.
      </DocCallout>

      <h2 id="access-control">Access Control</h2>
      <p>
        Limit who can manage provider keys in your organization:
      </p>
      <ul>
        <li><strong>Restrict key management to admins:</strong> Only organization admins should be able to add, update, or delete provider keys.</li>
        <li><strong>Use org-level isolation:</strong> Keep different projects in separate Convio organizations to isolate keys.</li>
        <li><strong>Review access regularly:</strong> Audit who has admin access to your Convio organization and remove unnecessary permissions.</li>
      </ul>

      <h2 id="never-share">Never Share Keys</h2>
      <p>
        API keys are like passwords — they should never be shared or exposed:
      </p>
      <ul>
        <li><strong>Don't commit keys to git:</strong> Use environment variables or secret managers. Never hardcode keys in source code.</li>
        <li><strong>Don't share keys via chat or email:</strong> Use a secure secret sharing tool if you must transfer a key.</li>
        <li><strong>Don't embed keys in client-side code:</strong> API keys should only be used server-side. Client-side exposure is a critical security risk.</li>
        <li><strong>Don't use the same key across projects:</strong> Use separate keys for different environments (dev, staging, production).</li>
      </ul>

      <DocCallout variant="destructive" icon={Shield} title="Keys in git are compromised">
        If you accidentally commit an API key to a git repository, assume it's compromised — even if you delete it immediately. Git history preserves the key, and bots scan public repositories for exposed keys. Rotate the key immediately.
      </DocCallout>

      <h2 id="monitoring">Monitoring Usage</h2>
      <p>
        Regular monitoring helps you detect unauthorized usage early:
      </p>
      <ul>
        <li><strong>Check provider dashboards weekly:</strong> Review token usage and request counts for unusual spikes.</li>
        <li><strong>Set up spending alerts:</strong> Most providers let you configure email alerts when spending exceeds a threshold.</li>
        <li><strong>Review Convio logs:</strong> Check agent activity logs for unexpected patterns or unfamiliar agents making requests.</li>
        <li><strong>Compare expected vs actual usage:</strong> If costs are higher than expected, investigate before it becomes a large bill.</li>
      </ul>

      <h2 id="revoking">Revoking Compromised Keys</h2>
      <p>
        If you suspect a key has been compromised:
      </p>
      <ol>
        <li><strong>Revoke immediately at the provider:</strong> Go to the provider's dashboard and delete or disable the key.</li>
        <li><strong>Check usage logs:</strong> Review recent activity for unauthorized requests.</li>
        <li><strong>Generate a new key:</strong> Create a fresh key and update it in Convio.</li>
        <li><strong>Notify your team:</strong> Let relevant team members know about the incident.</li>
        <li><strong>Investigate the cause:</strong> Determine how the key was exposed and take steps to prevent it from happening again.</li>
      </ol>

      <DocCallout variant="warning" icon={Eye} title="Review billing after revocation">
        After revoking a compromised key, check your provider billing for any unauthorized charges. Most providers have fraud protection policies that may cover unauthorized usage if reported promptly.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Provider Keys"
          href="/docs/managing-provider-keys"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limits & Quotas"
          href="/docs/rate-limits"
        />
      </DocCardGrid>
    </DocContent>
  )
}
