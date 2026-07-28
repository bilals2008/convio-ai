import { Key, RefreshCw, Trash2, Eye, Shield, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ManagingProviderKeysPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Provider Keys' },
        ]}
        title="Managing Provider Keys"
        description="View, update, rotate, and delete your provider API keys in the Convio dashboard."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Provider keys are managed from <strong>Settings → Provider Keys</strong> in your Convio dashboard. You can view which keys are stored, update them with new values, rotate keys for security, or delete them entirely.
      </p>

      <h2 id="viewing-keys">Viewing Stored Keys</h2>
      <p>
        The Provider Keys page lists all keys stored for your organization. For each key, you'll see:
      </p>
      <ul>
        <li><strong>Provider:</strong> The AI provider (OpenAI, Anthropic, Google, etc.).</li>
        <li><strong>Key preview:</strong> The last 4 characters (e.g., <code>...a3b7</code>) for identification.</li>
        <li><strong>Label:</strong> An optional description you assigned when adding the key.</li>
        <li><strong>Created:</strong> When the key was added to Convio.</li>
        <li><strong>Status:</strong> Whether the key is active or has encountered errors.</li>
      </ul>

      <DocCallout variant="info" icon={Eye} title="Full keys are hidden">
        Convio only shows the last 4 characters of each key. The full key is encrypted and never displayed after the initial save. If you've lost your key, you'll need to generate a new one from the provider's dashboard.
      </DocCallout>

      <h2 id="updating-keys">Updating Keys</h2>
      <p>
        To update a stored key (e.g., you've generated a new key from the provider):
      </p>
      <ol>
        <li>Go to <strong>Settings → Provider Keys</strong>.</li>
        <li>Find the provider key you want to update.</li>
        <li>Click the <strong>"Update"</strong> action.</li>
        <li>Paste the new API key.</li>
        <li>Click <strong>"Save"</strong>.</li>
      </ol>
      <p>
        The old key is immediately replaced. All subsequent agent requests will use the new key.
      </p>

      <h2 id="deleting-keys">Deleting Keys</h2>
      <p>
        To remove a provider key from Convio:
      </p>
      <ol>
        <li>Go to <strong>Settings → Provider Keys</strong>.</li>
        <li>Find the key you want to delete.</li>
        <li>Click the <strong>"Delete"</strong> action.</li>
        <li>Confirm the deletion.</li>
      </ol>

      <DocCallout variant="warning" icon={Trash2} title="Agents will fall back to defaults">
        Deleting a provider key means agents configured to use that provider will fall back to Convio's managed API (if available) or fail if no managed credit is allocated. Make sure you have a fallback plan before deleting keys.
      </DocCallout>

      <h2 id="key-rotation">Key Rotation Best Practices</h2>
      <p>
        Rotating API keys regularly reduces the risk of compromised credentials. Follow these best practices:
      </p>
      <ul>
        <li><strong>Rotate every 90 days:</strong> Generate a new key from the provider, update it in Convio, then revoke the old key at the provider.</li>
        <li><strong>Rotate after team changes:</strong> If someone with key access leaves the team, rotate immediately.</li>
        <li><strong>Rotate on suspected compromise:</strong> If you suspect a key has been exposed, rotate immediately and check provider usage logs for unauthorized activity.</li>
        <li><strong>Use descriptive labels:</strong> Label keys with their purpose (e.g., "Production - Main") so rotation is easy to track.</li>
      </ul>

      <h3 id="rotation-process">Rotation Process</h3>
      <ol>
        <li>Generate a new key in the provider's dashboard.</li>
        <li>Add the new key in Convio (Settings → Provider Keys → Update).</li>
        <li>Verify agents are working with the new key by testing in the Playground.</li>
        <li>Revoke the old key in the provider's dashboard.</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Zero-downtime rotation">
        Because Convio replaces the key atomically, there's no downtime during rotation. Agents continue using the old key until the update is saved, then immediately switch to the new key.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Key Security"
          href="/docs/api-key-security"
        />
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Resolution"
          href="/docs/key-resolution"
        />
      </DocCardGrid>
    </DocContent>
  )
}
