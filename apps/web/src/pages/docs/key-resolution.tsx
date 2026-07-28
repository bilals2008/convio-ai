import { GitBranch, ArrowRight, AlertTriangle, Key } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function KeyResolutionPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Key Resolution' },
        ]}
        title="How Key Resolution Works"
        description="Understand the priority chain Convio uses to find the right API key for each request."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When an agent makes a request to an AI provider, Convio needs to find the right API key. Key resolution is the process of determining which key to use, following a specific priority chain. This ensures agents always have a working key while giving you control over which keys are used where.
      </p>

      <h2 id="resolution-chain">Resolution Chain</h2>
      <p>
        Convio resolves API keys using a three-level priority chain. The first match wins:
      </p>

      <div className="my-6 space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[12px] font-heading font-semibold">1</div>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-[13px]">Agent-Level Key</h3>
            <p className="text-muted-foreground text-[12px] mt-1">If the agent has a specific provider key assigned directly, that key is used. This overrides all other settings.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[12px] font-heading font-semibold">2</div>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-[13px]">Organization Provider Key</h3>
            <p className="text-muted-foreground text-[12px] mt-1">If no agent-level key is set, Convio looks for a provider key stored in your organization's Settings → Provider Keys.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[12px] font-heading font-semibold">3</div>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-[13px]">Environment Variable (Fallback)</h3>
            <p className="text-muted-foreground text-[12px] mt-1">If no org key exists, Convio falls back to environment variables configured on the server (e.g., OPENAI_API_KEY). This is the managed API fallback.</p>
          </div>
        </div>
      </div>

      <h2 id="priority-order">Priority Order</h2>
      <p>
        The resolution always follows this order — it never skips a level:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Priority</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Source</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Scope</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Use Case</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">1 (Highest)</td>
              <td className="py-2 pr-4">Agent config</td>
              <td className="py-2 pr-4">Single agent</td>
              <td className="py-2">Per-agent key override</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">2</td>
              <td className="py-2 pr-4">Org Provider Keys</td>
              <td className="py-2 pr-4">All agents in org</td>
              <td className="py-2">Org-wide BYOK</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">3 (Lowest)</td>
              <td className="py-2 pr-4">Environment variable</td>
              <td className="py-2 pr-4">Server-wide</td>
              <td className="py-2">Managed API / default</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="fallback-behavior">Fallback Behavior</h2>
      <p>
        If the key at a given level is invalid, expired, or missing, Convio does not automatically skip to the next level. The behavior depends on the failure:
      </p>
      <ul>
        <li><strong>No key configured at any level:</strong> The agent request fails with an error indicating no API key is available for the provider.</li>
        <li><strong>Key present but invalid:</strong> The request fails with a provider authentication error. Convio does not fall back to lower-priority keys.</li>
        <li><strong>Key present but rate-limited:</strong> The request fails with a rate limit error. Consider rotating keys or using a different provider.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="No automatic fallback between levels">
        Convio uses the first key it finds in the resolution chain. If that key is invalid, it does not automatically try the next level. This prevents accidental use of the wrong key and makes debugging easier.
      </DocCallout>

      <h2 id="debugging">Debugging Key Issues</h2>
      <p>
        If an agent fails to connect to a provider, check these common issues:
      </p>
      <ol>
        <li><strong>Check agent config:</strong> Verify the agent has the correct provider and model set. If a specific key is assigned, ensure it's valid.</li>
        <li><strong>Check org keys:</strong> Go to Settings → Provider Keys and verify the key for the provider is present and the preview shows the expected last 4 characters.</li>
        <li><strong>Check provider status:</strong> Verify the provider's API is operational. Check their status page for outages.</li>
        <li><strong>Test in Playground:</strong> Use the Agent Playground to send a test message. The error message will indicate whether the issue is authentication, rate limiting, or something else.</li>
        <li><strong>Check usage:</strong> Verify you haven't hit spending limits at the provider level.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Adding a Provider Key"
          href="/docs/adding-provider-key"
        />
        <DocNextStepCard
          icon={GitBranch}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Using Different Providers"
          href="/docs/using-different-providers"
        />
      </DocCardGrid>
    </DocContent>
  )
}
