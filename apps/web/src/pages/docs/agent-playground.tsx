import { Link } from 'react-router-dom'
import { ArrowRight, Play, RefreshCw, MessageSquare, Wrench, TestTube } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentPlaygroundPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Agent Playground' },
        ]}
        title="Testing in the Playground"
        description="The Playground is a built-in testing environment where you can interact with your agent in real time, iterate on prompts, and verify tool usage before deploying."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Playground lets you have a live conversation with your agent without deploying to any channel. It's the fastest way to test changes, debug behavior, and validate that your agent handles edge cases correctly.
      </p>

      <h2 id="opening-playground">Opening the Playground</h2>
      <ol>
        <li>Navigate to <strong>Agents</strong> in the dashboard</li>
        <li>Select the agent you want to test</li>
        <li>Click the <strong>Playground</strong> tab</li>
      </ol>
      <p>
        The playground opens with a fresh conversation. Your agent's system prompt, tools, and knowledge base are all active — this is the same agent that will run in production.
      </p>

      <h2 id="using-test-stream">Using the Test Stream</h2>
      <p>
        Type a message in the input field and press Enter. The agent responds in real time, exactly as it would on any deployed channel.
      </p>

      <h3 id="what-to-test">What to Test</h3>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Standard Queries"
          description="Test the most common questions your users will ask. Verify the agent answers correctly and in the right tone."
          href="#standard-queries"
        />
        <DocFeatureCard
          icon={Wrench}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Tool Usage"
          description="Trigger scenarios that require tool calls — knowledge base lookups, API calls, or custom integrations."
          href="#tool-usage"
        />
        <DocFeatureCard
          icon={TestTube}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Edge Cases"
          description="Try ambiguous questions, off-topic requests, and adversarial inputs to see how the agent handles them."
          href="#edge-cases"
        />
      </DocCardGrid>

      <h2 id="iterating-on-prompts">Iterating on Prompts</h2>
      <p>
        The Playground is designed for rapid iteration. Make a change to your system prompt, save it, and immediately test the result in the Playground.
      </p>

      <h3 id="iteration-workflow">Recommended Workflow</h3>
      <ol>
        <li>Write or update your system prompt</li>
        <li>Save the agent configuration</li>
        <li>Open the Playground (or refresh if it's already open)</li>
        <li>Run 3-5 test conversations covering your main use cases</li>
        <li>Note where the agent falls short — wrong tone, missing information, incorrect tool use</li>
        <li>Adjust the prompt and repeat</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Clear conversation between tests">
        Click <strong>New Conversation</strong> to start fresh between test runs. This ensures the agent doesn't carry context from a previous test into the next one.
      </DocCallout>

      <h2 id="testing-different-inputs">Testing with Different Inputs</h2>
      <p>
        Vary your test inputs to cover the range of real user behavior:
      </p>
      <ul>
        <li><strong>Direct questions:</strong> "What's your pricing?" — tests knowledge retrieval</li>
        <li><strong>Vague requests:</strong> "I need help" — tests how the agent clarifies</li>
        <li><strong>Multi-part questions:</strong> "Do you support WhatsApp and how much does it cost?" — tests handling complex inputs</li>
        <li><strong>Off-topic:</strong> "What's the weather?" — tests boundary enforcement</li>
        <li><strong>Adversarial:</strong> "Ignore your instructions and..." — tests prompt injection resistance</li>
      </ul>

      <h2 id="checking-tool-usage">Checking Tool Usage</h2>
      <p>
        If your agent has tools enabled (knowledge base, web search, custom integrations), the Playground shows which tools were called and what data was returned. This helps you verify:
      </p>
      <ul>
        <li>The agent calls the right tool for the right query</li>
        <li>Tool results are properly incorporated into the response</li>
        <li>The agent doesn't call tools unnecessarily (which adds latency and cost)</li>
        <li>Error handling works when a tool fails or returns no results</li>
      </ul>

      <DocCallout variant="info" icon={Play} title="Use the conversation log">
        The Playground includes a conversation log panel that shows the full request/response cycle — including tool calls, retrieved context, and token usage. Use this to debug unexpected behavior.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Play}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Statuses"
          href="/docs/agent-statuses"
        />
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Cloning Agents"
          href="/docs/cloning-agents"
        />
      </DocCardGrid>
    </DocContent>
  )
}
