import { MessageSquare, Lightbulb, AlertTriangle, CheckCircle, TestTube, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function PromptEngineeringPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Prompt Engineering' },
        ]}
        title="Prompt Engineering Best Practices"
        description="Write system prompts that produce consistent, accurate, and on-brand responses from your AI agents."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The system prompt is the single most important configuration for your agent. It defines the agent's personality, knowledge boundaries, response format, and behavior rules. A well-crafted prompt reduces hallucinations, improves accuracy, and ensures consistent tone across conversations.
      </p>
      <p>
        Prompt engineering is iterative. Write a draft, test it against real scenarios, observe failures, and refine. Expect to go through 5–10 iterations before a prompt performs reliably in production.
      </p>

      <h2 id="structure">Prompt Structure</h2>
      <p>
        A strong system prompt follows a clear structure. Organize it into sections so the model can parse instructions reliably:
      </p>
      <ol>
        <li><strong>Identity:</strong> Who the agent is, what organization it represents.</li>
        <li><strong>Role:</strong> What the agent does and what it doesn't do.</li>
        <li><strong>Tone:</strong> How the agent communicates — formal, casual, technical, friendly.</li>
        <li><strong>Rules:</strong> Hard constraints — what the agent must never do, edge cases to handle.</li>
        <li><strong>Output format:</strong> How responses should be structured — length, formatting, language.</li>
      </ol>

      <DocCallout variant="tip" icon={Lightbulb} title="Be explicit, not implicit">
        Models don't infer intent well from vague instructions. Write "Always respond in Spanish" instead of "The agent speaks Spanish." Write "Never share internal pricing logic" instead of "Be careful with pricing."
      </DocCallout>

      <h2 id="tone-setting">Setting the Right Tone</h2>
      <p>
        Tone shapes how users perceive your brand. Define it clearly in the prompt with concrete examples:
      </p>
      <ul>
        <li><strong>Formal:</strong> "Use professional language. Avoid contractions, slang, and casual phrases."</li>
        <li><strong>Friendly:</strong> "Be warm and approachable. Use contractions and conversational phrasing."</li>
        <li><strong>Technical:</strong> "Be precise and concise. Use industry terminology without over-explaining."</li>
      </ul>
      <p>
        Include a short example exchange that demonstrates the desired tone. Models learn tone better from examples than from adjectives.
      </p>

      <h2 id="constraints">Adding Constraints</h2>
      <p>
        Constraints prevent the agent from going off-track. Common constraints include:
      </p>
      <ul>
        <li><strong>Scope limits:</strong> "Only answer questions about our product. For unrelated topics, politely decline."</li>
        <li><strong>Length limits:</strong> "Keep responses under 150 words unless the user asks for detail."</li>
        <li><strong>Action limits:</strong> "Never make promises about pricing or discounts. Always direct users to sales."</li>
        <li><strong>Data boundaries:</strong> "Never ask for or store passwords, credit card numbers, or social security numbers."</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't overload with constraints">
        Too many constraints confuse the model and degrade response quality. Prioritize your top 5–8 most critical rules. Group related constraints together rather than listing them individually.
      </DocCallout>

      <h2 id="few-shot">Few-Shot Examples</h2>
      <p>
        Few-shot examples teach the model by demonstration. Include 2–3 example exchanges that cover common scenarios:
      </p>
      <ul>
        <li>A standard question-and-answer exchange.</li>
        <li>A scenario where the agent should decline or redirect.</li>
        <li>A complex query requiring multi-step reasoning.</li>
      </ul>
      <p>
        Keep examples concise. One-turn exchanges are usually sufficient — the model generalizes well from short demonstrations.
      </p>

      <h2 id="common-mistakes">Common Mistakes</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Vague Instructions"
          description="Saying 'be helpful' doesn't tell the model what helpful means. Define specific behaviors for common scenarios."
          href="#"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Contradictory Rules"
          description="If two instructions conflict, the model picks one unpredictably. Review prompts for internal consistency."
          href="#"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Missing Fallbacks"
          description="Without instructions for edge cases, the model improvises. Add explicit guidance for unknown queries."
          href="#"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Overly Long Prompts"
          description="Prompts over 2,000 tokens lose the model's focus. Keep instructions under 800 tokens for best adherence."
          href="#"
        />
      </DocCardGrid>

      <h2 id="testing">Testing Prompts</h2>
      <p>
        Use Convio's Playground to test prompts before deploying them. Follow this workflow:
      </p>
      <ol>
        <li><strong>Write a draft prompt</strong> with the structure outlined above.</li>
        <li><strong>Create 10–15 test scenarios</strong> covering expected use cases and edge cases.</li>
        <li><strong>Run each scenario</strong> in the Playground and evaluate the responses.</li>
        <li><strong>Identify failures</strong> — wrong answers, off-tone responses, constraint violations.</li>
        <li><strong>Refine the prompt</strong> targeting the specific failure mode, then re-test.</li>
      </ol>

      <DocCallout variant="tip" icon={TestTube} title="Test adversarially">
        Don't just test happy paths. Try to trick your agent: ask off-topic questions, request information it shouldn't have, attempt prompt injection. A prompt that only works in ideal conditions isn't production-ready.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Playground"
          href="/docs/agent-playground"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
      </DocCardGrid>
    </DocContent>
  )
}
