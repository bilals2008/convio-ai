import { Shield, Key, Filter, Lock, Eye, AlertTriangle, Bell, Settings } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SecurityBestPracticesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Security Best Practices' },
        ]}
        title="Security Best Practices"
        description="Protect your API keys, configure moderation, control access, and monitor for abuse."
      />

      <h2 id="overview">Overview</h2>
      <p>
        AI agents handle sensitive data and have access to external services. A security breach can expose customer data, incur unexpected costs, or damage your reputation. These practices establish defense-in-depth across your Convio deployment.
      </p>

      <h2 id="api-key-management">API Key Management</h2>
      <p>
        API keys grant access to your AI providers, tools, and integrations. Treat them like passwords:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Use BYOK"
          description="Bring your own keys (BYOK) to control access directly. Store keys in Convio's encrypted provider key vault instead of embedding them in prompts."
          href="/docs/byok"
        />
        <DocFeatureCard
          icon={Eye}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rotate Regularly"
          description="Rotate API keys every 90 days. Convio supports key rotation without downtime — add the new key before removing the old one."
          href="/docs/managing-provider-keys"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Principle of Least Privilege"
          description="Grant each integration only the permissions it needs. A read-only CRM integration shouldn't have write access."
          href="#"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audit Key Usage"
          description="Review provider key usage in the audit log. Identify unusual patterns — unexpected volume spikes or calls from unfamiliar IP addresses."
          href="/docs/audit-logs"
        />
      </DocCardGrid>

      <DocCallout variant="warning" icon={AlertTriangle} title="Never commit keys to source control">
        Add all API keys and secrets to your environment variables, not your codebase. Use .env.local for development and your hosting platform's secret management for production.
      </DocCallout>

      <h2 id="moderation">Moderation Configuration</h2>
      <p>
        Moderation is your first line of defense against abuse. Configure it proactively:
      </p>
      <ul>
        <li><strong>Enable prompt injection detection:</strong> This catches attempts to override your system prompt or extract sensitive information.</li>
        <li><strong>Configure PII detection:</strong> Prevent users from submitting personal information that your agent shouldn't process or store.</li>
        <li><strong>Set up custom rules:</strong> Block domain-specific threats — competitor names used for data extraction, social engineering patterns, or off-topic abuse.</li>
        <li><strong>Start in flag-only mode:</strong> Run moderation in logging mode first to understand false positive rates before enabling blocking.</li>
      </ul>

      <DocCallout variant="tip" icon={Filter} title="Layer your defenses">
        No single check catches everything. Enable multiple moderation checks and let them work together — profanity filtering, PII detection, and prompt injection are complementary, not redundant.
      </DocCallout>

      <h2 id="access-control">Access Control</h2>
      <p>
        Control who can create, modify, and deploy agents:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Role</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Permissions</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">When to Assign</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Owner</td>
              <td className="py-2 pr-4">Full access to all settings, billing, and API keys</td>
              <td className="py-2">Organization administrators only</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Admin</td>
              <td className="py-2 pr-4">Create/edit agents, manage knowledge bases, view analytics</td>
              <td className="py-2">Team leads and technical managers</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Editor</td>
              <td className="py-2 pr-4">Edit agent prompts and knowledge bases</td>
              <td className="py-2">Content creators and support managers</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Viewer</td>
              <td className="py-2 pr-4">Read-only access to agents and analytics</td>
              <td className="py-2">Stakeholders and auditors</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="monitoring">Monitoring and Alerts</h2>
      <p>
        Detect and respond to security events quickly:
      </p>
      <ul>
        <li><strong>Monitor usage anomalies:</strong> Set up alerts for unusual token consumption, conversation volume spikes, or repeated tool call failures.</li>
        <li><strong>Review audit logs:</strong> Check audit logs weekly for unauthorized changes to agents, knowledge bases, or API keys.</li>
        <li><strong>Track failed authentications:</strong> Multiple failed login attempts may indicate credential stuffing or brute force attacks.</li>
        <li><strong>Alert on moderation triggers:</strong> Configure alerts when moderation blocks exceed normal thresholds — this may indicate a targeted attack.</li>
      </ul>

      <DocCallout variant="destructive" icon={Bell} title="Set up alerts for cost spikes">
        An compromised API key or runaway agent can generate thousands of dollars in minutes. Set up billing alerts and usage limits on your AI provider accounts.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Key Security"
          href="/docs/api-key-security"
        />
        <DocNextStepCard
          icon={Filter}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Content Moderation"
          href="/docs/moderation"
        />
      </DocCardGrid>
    </DocContent>
  )
}
