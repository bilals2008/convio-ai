import { Link } from 'react-router-dom'
import { Wrench, Settings, ArrowRight, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function AttachingToolsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Attaching Tools to Agents' },
        ]}
        title="Attaching Tools to Agents"
        description="Control which tools each agent can use and how they're configured."
      />

      <h2 id="selecting-tools">Selecting Tools</h2>
      <p>
        Tools are attached at the agent level. Each agent has its own set of available tools, giving you fine-grained control over what each agent can do.
      </p>
      <ol>
        <li>Open your agent's settings page</li>
        <li>Scroll to the <strong>Tools</strong> section</li>
        <li>Toggle on the tools you want this agent to use</li>
        <li>For custom tools, select from your list of defined tools</li>
        <li>Save the agent</li>
      </ol>
      <p>
        An agent can use any combination of built-in and custom tools. A support agent might have web search and calculator enabled, while a sales agent might have web search and a custom CRM tool.
      </p>

      <h2 id="configuring-behavior">Configuring Tool Behavior</h2>
      <p>
        Once attached, tools work automatically. The model decides when to call each tool based on the tool's description and the user's request. You don't need to write instructions in the system prompt to trigger tool use — the model handles this autonomously.
      </p>
      <p>
        However, you can influence tool behavior through the system prompt:
      </p>
      <ul>
        <li><strong>Encourage usage:</strong> "Always search the web for current information before responding"</li>
        <li><strong>Discourage usage:</strong> "Only use the calculator when the user explicitly asks for a calculation"</li>
        <li><strong>Prioritize:</strong> "Prefer the knowledge base over web search for product information"</li>
      </ul>

      <h2 id="tool-priority">Tool Priority and Ordering</h2>
      <p>
        When multiple tools could answer a question, the model selects the most relevant one based on:
      </p>
      <ol>
        <li><strong>Tool description match</strong> — which tool best fits the user's request</li>
        <li><strong>Parameter feasibility</strong> — can the model generate valid inputs</li>
        <li><strong>System prompt guidance</strong> — any explicit instructions about tool preference</li>
      </ol>
      <p>
        The model may also call multiple tools in sequence if one tool's output feeds into another. For example, searching the web for a price, then using the calculator to apply a discount.
      </p>

      <h2 id="testing-integration">Testing Tool Integration</h2>
      <p>
        Always test tool integration before deploying an agent:
      </p>
      <ol>
        <li><strong>Positive test:</strong> Ask questions that should trigger each tool</li>
        <li><strong>Negative test:</strong> Ask questions that shouldn't trigger tools — verify the model doesn't force tool use</li>
        <li><strong>Edge cases:</strong> Ask ambiguous questions where tool use is optional</li>
        <li><strong>Error handling:</strong> Verify the agent handles tool failures gracefully</li>
      </ol>

      <DocCallout variant="tip" icon={CheckCircle} title="Use the Playground">
        The Playground tab shows tool calls in the conversation trace. You can see which tool was called, the parameters used, and the result — making it easy to debug tool behavior.
      </DocCallout>

      <h2 id="removing-tools">Removing Tools</h2>
      <p>
        To remove a tool from an agent, toggle it off in the agent's settings. The model will immediately stop using that tool. No redeployment is needed — changes take effect on the next conversation turn.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li><Link to="/docs/built-in-tools" className="text-primary hover:underline">Built-in Tools</Link> — ready-to-use tools</li>
        <li><Link to="/docs/custom-tools" className="text-primary hover:underline">Custom Tools</Link> — define your own</li>
        <li><Link to="/docs/mcp-overview" className="text-primary hover:underline">MCP Overview</Link> — external tool servers</li>
      </ul>
    </DocContent>
  )
}
