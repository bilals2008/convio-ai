import { Link } from 'react-router-dom'
import { ArrowRight, Settings, Thermometer, Hash, Brain, ToggleLeft, Square } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentSettingsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Agent Settings' },
        ]}
        title="Configuring Agent Settings"
        description="Fine-tune your agent's behavior with model parameters. These settings control response characteristics without changing the system prompt."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Agent settings control how the model generates responses. They don't change what the agent knows — they change how it thinks. Adjust these after you have a working prompt and want to fine-tune output behavior.
      </p>

      <h2 id="temperature">Temperature</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Thermometer}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Range: 0 — 1"
          description="Controls randomness. Lower = more focused and deterministic. Higher = more creative and varied."
          href="#temperature"
        />
        <DocFeatureCard
          icon={Thermometer}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Recommended: 0.3 — 0.7"
          description="Most agents work well at 0.5. Lower for factual tasks, higher for creative writing."
          href="#temperature"
        />
      </DocCardGrid>

      <h3 id="when-to-adjust-temp">When to Adjust Temperature</h3>
      <ul>
        <li><strong>0.0 — 0.2:</strong> Factual Q&A, code generation, data extraction — you want the same answer every time</li>
        <li><strong>0.3 — 0.5:</strong> Customer support, FAQ, onboarding — helpful and natural but consistent</li>
        <li><strong>0.6 — 0.8:</strong> Creative writing, brainstorming, marketing copy — more variation and personality</li>
        <li><strong>0.9 — 1.0:</strong> Experimental use only — responses become unpredictable</li>
      </ul>

      <DocCallout variant="tip" icon={Settings} title="Start at 0.5">
        If you're unsure, start at 0.5 and adjust based on results. Most production agents run between 0.3 and 0.7.
      </DocCallout>

      <h2 id="max-tokens">Max Tokens</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Hash}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Response Length Limit"
          description="Maximum number of tokens the model can generate per response. One token ≈ 4 characters or 0.75 words."
          href="#max-tokens"
        />
        <DocFeatureCard
          icon={Hash}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Default: Model Maximum"
          description="By default, the model uses its maximum. Set a lower value to control response length and cost."
          href="#max-tokens"
        />
      </DocCardGrid>

      <h3 id="when-to-adjust-tokens">When to Adjust Max Tokens</h3>
      <ul>
        <li><strong>Short answers (100-200):</strong> FAQ bots, quick confirmations, status updates</li>
        <li><strong>Medium answers (300-600):</strong> Customer support, product explanations, how-to guides</li>
        <li><strong>Long answers (800-1500):</strong> Detailed documentation, complex troubleshooting, onboarding walkthroughs</li>
      </ul>

      <DocCallout variant="warning" icon={Hash} title="Cost implication">
        Longer max tokens = higher cost per response. A support agent with max_tokens=2000 that could answer in 200 tokens is paying 10x more than necessary. Set a reasonable limit.
      </DocCallout>

      <h2 id="reasoning-effort">Reasoning Effort</h2>
      <p>
        Some models (Claude, o1, o3) support a reasoning effort parameter that controls how much "thinking" the model does before responding.
      </p>
      <ul>
        <li><strong>Low:</strong> Fast responses, good for simple queries — minimal internal reasoning</li>
        <li><strong>Medium:</strong> Balanced — moderate reasoning for most use cases</li>
        <li><strong>High:</strong> Deep reasoning for complex problems — slower but more thorough</li>
      </ul>

      <h2 id="top-p">Top P (Nucleus Sampling)</h2>
      <p>
        Top P controls the diversity of token selection. At 1.0, all tokens are considered. At 0.5, only the top 50% most probable tokens are candidates.
      </p>
      <ul>
        <li><strong>Default (1.0):</strong> Let temperature control randomness</li>
        <li><strong>0.9 — 0.95:</strong> Slightly reduce diversity while keeping responses natural</li>
        <li><strong>Below 0.9:</strong> Generally not recommended — can produce unnatural responses</li>
      </ul>

      <DocCallout variant="info" icon={ToggleLeft} title="Temperature vs Top P">
        Temperature and Top P both control randomness but in different ways. Temperature scales probabilities uniformly; Top P truncates the token list. In practice, adjusting temperature alone is sufficient for most agents.
      </DocCallout>

      <h2 id="stop-sequences">Stop Sequences</h2>
      <p>
        Stop sequences tell the model to stop generating text when it encounters a specific string. This is useful for preventing the model from continuing past a desired endpoint.
      </p>
      <ul>
        <li><strong>Common stops:</strong> <code>Human:</code>, <code>Assistant:</code>, <code>\n\n</code> — prevent the model from generating both sides of a conversation</li>
        <li><strong>Custom stops:</strong> Stop after a specific format like <code>```</code> for code blocks or <code>[END]</code> for structured output</li>
      </ul>

      <h2 id="settings-summary">Settings Quick Reference</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Setting</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Default</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Range</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Best For</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Temperature</td>
              <td className="py-2 pr-4">0.5</td>
              <td className="py-2 pr-4">0 — 1</td>
              <td className="py-2">Control randomness</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Max Tokens</td>
              <td className="py-2 pr-4">Model max</td>
              <td className="py-2 pr-4">1 — 128k</td>
              <td className="py-2">Response length & cost</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Top P</td>
              <td className="py-2 pr-4">1.0</td>
              <td className="py-2 pr-4">0 — 1</td>
              <td className="py-2">Token diversity</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Reasoning Effort</td>
              <td className="py-2 pr-4">Medium</td>
              <td className="py-2 pr-4">Low — High</td>
              <td className="py-2">Thinking depth</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Stop Sequences</td>
              <td className="py-2 pr-4">None</td>
              <td className="py-2 pr-4">Up to 4</td>
              <td className="py-2">Output truncation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Welcome Messages"
          href="/docs/welcome-messages"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing in the Playground"
          href="/docs/agent-playground"
        />
      </DocCardGrid>
    </DocContent>
  )
}
