import { Shield, Lock, Server, ShieldCheck, Database, Key, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SecurityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Security Overview' },
        ]}
        title="Security Overview"
        description="How Convio protects your data, infrastructure, and conversations."
      />

      <h2 id="architecture">Security Architecture</h2>
      <p>
        Convio's security is built on defense-in-depth: multiple layers of controls so no single failure compromises your data. Every component — from the API gateway to the database — operates under least-privilege principles.
      </p>

      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Encryption at Rest"
          description="All data is encrypted with AES-256-GCM. Database volumes, object storage, and backups are encrypted at rest."
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Encryption in Transit"
          description="All network traffic uses TLS 1.3. Internal service-to-service communication uses mTLS with short-lived certificates."
        />
        <DocFeatureCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Isolated Infrastructure"
          description="Each organization runs in isolated compute and database namespaces. Cross-tenant data access is architecturally impossible."
        />
      </DocCardGrid>

      <h2 id="data-encryption">Data Encryption</h2>

      <h3 id="at-rest">At Rest</h3>
      <p>
        All persistent data is encrypted using AES-256-GCM. Encryption keys are managed through a dedicated key management service (KMS) with automatic key rotation. This covers:
      </p>
      <ul>
        <li>PostgreSQL database volumes and backups</li>
        <li>Object storage (documents, uploads)</li>
        <li>Logs and audit trails</li>
        <li>Temporary files and caches</li>
      </ul>

      <h3 id="in-transit">In Transit</h3>
      <p>
        All external connections require TLS 1.3. Internal services communicate over mTLS with certificates rotated every 24 hours. Plain HTTP connections are rejected at the load balancer.
      </p>

      <DocCallout variant="tip" icon={Lock} title="Certificate transparency">
        Convio monitors certificate transparency logs for unauthorized certificates issued against our domains.
      </DocCallout>

      <h2 id="infrastructure">Infrastructure Security</h2>
      <p>
        Convio runs on hardened infrastructure with the following controls:
      </p>
      <ul>
        <li><strong>Regular patching:</strong> OS and dependency patches applied within 48 hours of release.</li>
        <li><strong>Network segmentation:</strong> Services communicate through private networks. No direct internet access for data stores.</li>
        <li><strong>Container hardening:</strong> Running containers use non-root users, read-only filesystems, and minimal base images.</li>
        <li><strong>Secrets management:</strong> No secrets in code, environment variables, or configuration files. All secrets stored in a dedicated vault with audit logging.</li>
      </ul>

      <h2 id="compliance">Compliance Certifications</h2>
      <p>
        Convio maintains compliance with industry standards to protect your organization's data:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Standard</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Status</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Scope</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">SOC 2 Type II</td>
              <td className="py-2 pr-4">Certified</td>
              <td className="py-2">Platform operations, data handling</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">GDPR</td>
              <td className="py-2 pr-4">Compliant</td>
              <td className="py-2">Data processing, user rights, retention</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">CCPA</td>
              <td className="py-2 pr-4">Compliant</td>
              <td className="py-2">California consumer data protection</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">ISO 27001</td>
              <td className="py-2 pr-4">In Progress</td>
              <td className="py-2">Information security management</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="access-control">Access Control</h2>
      <p>
        Convio enforces strict access controls across the platform:
      </p>
      <ul>
        <li><strong>Role-based access:</strong> Organization owners, admins, and members have distinct permission levels.</li>
        <li><strong>API authentication:</strong> All API requests require Bearer tokens. Keys are scoped to specific organizations.</li>
        <li><strong>Session management:</strong> Sessions expire after inactivity. Suspicious login attempts trigger additional verification.</li>
        <li><strong>Audit logging:</strong> All administrative actions are logged with timestamps, user identity, and IP address.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ShieldCheck}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Checklist"
          href="/docs/security-checklist"
        />
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="SSO / Single Sign-On"
          href="/docs/sso"
        />
      </DocCardGrid>
    </DocContent>
  )
}
