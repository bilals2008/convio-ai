import { Shield, CheckCircle, Key, Settings, Eye, Lock, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SecurityChecklistPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Security Checklist' },
        ]}
        title="Security Checklist"
        description="Recommended settings and practices for production deployments."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Use this checklist before going live with Convio. Each item addresses a common security risk. Complete all items marked as <strong>Required</strong>; items marked as <strong>Recommended</strong> strengthen your posture but aren't blocking.
      </p>

      <h2 id="api-keys">API Key Management</h2>
      <ul className="space-y-3 my-6">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Never commit API keys to source code. Use environment variables or a secrets manager.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Rotate production API keys every 90 days.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Use separate keys for development, staging, and production.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Rotate keys immediately if a team member with access leaves.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Set up provider spending alerts to detect unauthorized usage.
          </div>
        </li>
      </ul>

      <h2 id="moderation">Moderation Configuration</h2>
      <ul className="space-y-3 my-6">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Enable profanity filtering on all customer-facing agents.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Enable PII detection for agents that handle sensitive data.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Enable prompt injection protection (Standard level minimum).
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Run moderation in flag-only mode for one week before enabling block mode.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Create custom rules for organization-specific content policies.
          </div>
        </li>
      </ul>

      <h2 id="access-control">Access Control</h2>
      <ul className="space-y-3 my-6">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Enable SSO for organizations with 10+ members.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Restrict admin roles to users who need full access.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Remove member access immediately when someone leaves the team.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Review member access quarterly.
          </div>
        </li>
      </ul>

      <h2 id="monitoring">Monitoring</h2>
      <ul className="space-y-3 my-6">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Enable audit logging for all administrative actions.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Review audit logs weekly for suspicious activity.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Export audit logs to your SIEM or log management system.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Set up alerts for bulk data exports and privilege changes.
          </div>
        </li>
      </ul>

      <h2 id="data">Data Protection</h2>
      <ul className="space-y-3 my-6">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Configure data retention policies to prevent unbounded data growth.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Required:</strong> Export and back up data before performing bulk deletions.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground">Recommended:</strong> Schedule regular data exports for compliance archives.
          </div>
        </li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Print this checklist">
        Use your browser's print function to save a copy of this checklist. Review it before each major deployment or quarterly as part of your security review process.
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
          title="API Key Security Best Practices"
          href="/docs/api-key-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
