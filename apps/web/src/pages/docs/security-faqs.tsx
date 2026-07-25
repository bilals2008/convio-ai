import { HelpCircle, Shield, Lock, Database, Trash2, Key, FileCheck } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function SecurityFAQsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'FAQs', href: '/docs' },
          { label: 'Security FAQs' },
        ]}
        title="Security FAQs"
        description="How Convio handles encryption, data storage, compliance, and API key security."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Security is a core priority at Convio. This page explains how we protect your data, handle API keys, and maintain compliance. For a full security overview, see the <a href="/docs/security">Security</a> page.
      </p>

      <h2 id="data-protection">Data Protection</h2>

      <h3 id="encryption">Is my data encrypted?</h3>
      <p>
        Yes. All data is encrypted in transit using TLS 1.3 and at rest using AES-256. This includes conversations, knowledge base documents, API keys, and all other data stored in Convio. Our encryption keys are managed through a dedicated key management service (KMS) with automatic rotation.
      </p>

      <h3 id="data-storage">Where is my data stored?</h3>
      <p>
        All data is stored in SOC 2-compliant data centers located in the United States (AWS us-east-1). We use managed database services with automatic backups, replication, and point-in-time recovery. Enterprise customers can request dedicated infrastructure in specific regions.
      </p>

      <h3 id="data-deletion">Can I delete my data?</h3>
      <p>
        Yes. You can delete individual documents, knowledge bases, agents, or your entire account from the dashboard. When you delete an account, all associated data — conversations, documents, API keys, and configuration — is permanently removed within 30 days. You can also request immediate deletion by contacting <a href="mailto:security@convio.ai">security@convio.ai</a>.
      </p>

      <h2 id="authentication">Authentication & Access</h2>

      <h3 id="sso-support">Do you support SSO?</h3>
      <p>
        Yes. Convio supports Single Sign-On (SSO) via SAML 2.0 for Enterprise plans. This integrates with your existing identity provider (Okta, Azure AD, Google Workspace, etc.) and enforces your organization's authentication policies. SSO configuration is available in Settings → Security.
      </p>

      <h3 id="api-key-handling">How do you handle API keys?</h3>
      <p>
        API keys are encrypted at rest using AES-256 and never exposed in plaintext after creation. When you add a provider key via BYOK, it's encrypted immediately and stored in a dedicated secrets vault. Keys are only decrypted in memory during request processing and are never logged. You can revoke any key instantly from the dashboard.
      </p>

      <h2 id="compliance">Compliance</h2>

      <h3 id="soc2">Are you SOC 2 compliant?</h3>
      <p>
        Yes. Convio is SOC 2 Type II compliant. Our security controls are independently audited annually, covering physical security, logical access, data integrity, encryption, and incident response. Compliance reports are available upon request for Enterprise customers under NDA.
      </p>

      <DocCallout variant="info" icon={Shield} title="Security contact">
        For security inquiries, vulnerability reports, or compliance questions, contact <a href="mailto:security@convio.ai">security@convio.ai</a>. We operate a responsible disclosure program and respond to reports within 48 hours.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Overview"
          href="/docs/security"
        />
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="SSO Setup"
          href="/docs/sso"
        />
      </DocCardGrid>
    </DocContent>
  )
}
