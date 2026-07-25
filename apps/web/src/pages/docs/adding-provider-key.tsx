import { Key, Shield, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AddingProviderKeyPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Adding a Provider Key' },
        ]}
        title="Adding a Provider Key"
        description="Connect your own API keys from AI providers to use with Convio agents."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Adding your own provider keys lets you use BYOK (Bring Your Own Key) mode. Your agents will use your API keys for all requests, and you pay providers directly. Navigate to <strong>Settings → Provider Keys</strong> in your Convio dashboard to manage keys.
      </p>

      <h2 id="getting-api-keys">Getting API Keys from Providers</h2>

      <h3 id="openai">OpenAI</h3>
      <ol>
        <li>Go to <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a> and sign in.</li>
        <li>Navigate to <strong>API Keys</strong> in the sidebar.</li>
        <li>Click <strong>"Create new secret key"</strong>.</li>
        <li>Give it a descriptive name (e.g., "Convio Production").</li>
        <li>Copy the key immediately — it won't be shown again.</li>
      </ol>
      <p>
        <strong>Key format:</strong> <code>sk-...</code>
      </p>

      <h3 id="anthropic">Anthropic</h3>
      <ol>
        <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> and sign in.</li>
        <li>Navigate to <strong>API Keys</strong> under Settings.</li>
        <li>Click <strong>"Create Key"</strong>.</li>
        <li>Name the key and set an optional spending limit.</li>
        <li>Copy the key — it's only shown once.</li>
      </ol>
      <p>
        <strong>Key format:</strong> <code>sk-ant-...</code>
      </p>

      <h3 id="google">Google (Gemini)</h3>
      <ol>
        <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>.</li>
        <li>Click <strong>"Get API key"</strong> in the sidebar.</li>
        <li>Create a new key or use an existing one.</li>
        <li>Copy the key value.</li>
      </ol>
      <p>
        <strong>Key format:</strong> <code>AIza...</code>
      </p>

      <h3 id="groq">Groq</h3>
      <ol>
        <li>Go to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">console.groq.com</a> and sign in.</li>
        <li>Navigate to <strong>API Keys</strong>.</li>
        <li>Click <strong>"Create API Key"</strong>.</li>
        <li>Name and copy the key.</li>
      </ol>
      <p>
        <strong>Key format:</strong> <code>gsk_...</code>
      </p>

      <h3 id="openrouter">OpenRouter</h3>
      <ol>
        <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">openrouter.ai</a> and sign in.</li>
        <li>Navigate to <strong>Keys</strong> in settings.</li>
        <li>Click <strong>"Create Key"</strong>.</li>
        <li>Copy the generated key.</li>
      </ol>
      <p>
        <strong>Key format:</strong> <code>sk-or-...</code>
      </p>

      <h2 id="adding-to-convio">Adding Keys in Convio</h2>
      <ol>
        <li>Go to <strong>Settings → Provider Keys</strong>.</li>
        <li>Click <strong>"Add Provider Key"</strong>.</li>
        <li>Select the provider from the dropdown.</li>
        <li>Paste your API key in the input field.</li>
        <li>Optionally add a label to identify the key's purpose.</li>
        <li>Click <strong>"Save"</strong>.</li>
      </ol>

      <DocCallout variant="tip" icon={Key} title="One key per provider">
        Convio stores one key per provider per organization. Adding a new key for the same provider replaces the previous one. All agents in the organization will use the new key.
      </DocCallout>

      <h2 id="key-preview">Key Preview and Security</h2>
      <p>
        Convio never displays your full API key after saving. The dashboard shows only the last 4 characters (e.g., <code>...a3b7</code>) so you can identify which key is stored. The full key is encrypted at rest using AES-256 and is only decrypted at request time.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Eye}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Preview"
          description="Only the last 4 characters are visible in the dashboard. Full keys are never displayed after initial save."
          href="#key-preview"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Encryption"
          description="Keys are encrypted at rest with AES-256. Decrypted only in memory at request time, never logged or stored in plaintext."
          href="#key-preview"
        />
      </DocCardGrid>

      <h2 id="per-org-storage">Per-Org Key Storage</h2>
      <p>
        Provider keys are scoped to your organization. Each organization in Convio has its own set of provider keys. This means:
      </p>
      <ul>
        <li>Teams within an org share the same keys and billing.</li>
        <li>Different organizations can use different keys for the same provider.</li>
        <li>Keys are isolated between organizations — one org cannot access another's keys.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Provider Keys"
          href="/docs/managing-provider-keys"
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

