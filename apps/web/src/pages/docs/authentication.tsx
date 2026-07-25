import { Key, Shield, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiAuthenticationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Authentication & API Keys' },
        ]}
        title="Authentication & API Keys"
        description="Secure your API calls with Bearer tokens. Manage key permissions, rotate keys, and keep your integration safe."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every API request must include an API key in the <code>Authorization</code> header. API keys are scoped to your organization and carry the permissions of the user who created them. There are two types of keys: live keys (for production) and test keys (for development).
      </p>

      <h2 id="creating-keys">Creating API Keys</h2>
      <ol>
        <li>Navigate to <strong>Settings → API Keys</strong> in your dashboard</li>
        <li>Click <strong>Create API Key</strong></li>
        <li>Enter a descriptive name (e.g., "Production Backend", "CI/CD Pipeline")</li>
        <li>Select the permission scope (read-only, read-write, or admin)</li>
        <li>Click <strong>Create</strong> — copy the key immediately, it won't be shown again</li>
      </ol>

      <DocCallout variant="destructive" icon={Key} title="Keys are shown once">
        Convio displays the full API key only at creation time. Store it securely in a secrets manager (AWS Secrets Manager, Vault, .env files). If you lose a key, revoke it and create a new one.
      </DocCallout>

      <h2 id="using-keys">Using Keys in Requests</h2>
      <p>Include the key in the <code>Authorization</code> header as a Bearer token:</p>
      <pre><code>curl -X GET https://api.convio.com/v1/agents \
  -H "Authorization: Bearer conv_live_abc123def456" \
  -H "Content-Type: application/json"</code></pre>
      <p>
        The API rejects requests without a valid <code>Authorization</code> header with a <code>401 Unauthorized</code> response.
      </p>

      <h2 id="key-permissions">Key Permissions</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Read Only"
          description="Can list and retrieve resources (agents, conversations, messages). Cannot create, update, or delete anything."
          href="#read-only"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Read Write"
          description="Full CRUD access to agents, conversations, knowledge bases, and webhooks. Cannot manage API keys or organization settings."
          href="#read-write"
        />
      </DocCardGrid>
      <h3 id="read-only">Read Only</h3>
      <p>
        Use read-only keys for dashboards, analytics pipelines, and monitoring tools that need to query data without modifying it.
      </p>
      <h3 id="read-write">Read Write</h3>
      <p>
        Use read-write keys for backend services that create agents, send messages, manage knowledge bases, and configure webhooks.
      </p>
      <h3 id="admin">Admin</h3>
      <p>
        Admin keys can manage API keys, organization members, and billing. Use these sparingly and only for automation that needs to manage organizational settings.
      </p>

      <h2 id="key-rotation">Key Rotation</h2>
      <p>
        Rotate keys regularly and immediately if you suspect a key has been compromised. The rotation process:
      </p>
      <ol>
        <li>Create a new key in <strong>Settings → API Keys</strong></li>
        <li>Update your application to use the new key</li>
        <li>Verify the new key works in production</li>
        <li>Revoke the old key</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Zero-downtime rotation">
        Convio supports multiple active keys per organization. During rotation, both the old and new key work simultaneously. Revoke the old key only after confirming the new key is active in all your systems.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Making Your First API Request"
          href="/docs/api-first-request"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limiting"
          href="/docs/api-rate-limiting"
        />
      </DocCardGrid>
    </DocContent>
  )
}
