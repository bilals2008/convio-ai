import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Cpu, Brain, Wrench, Database, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AIAgentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'AI Agents' },
        ]}
        title="What is an AI Agent?"
        description="An AI agent is an autonomous entity that combines a language model with tools, knowledge, and instructions to hold conversations and take actions on your behalf."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Unlike a simple chatbot that retrieves static answers, an AI agent reasons over context, decides which tools to call, and generates dynamic responses tailored to each conversation. Convio lets you build these agents without writing infrastructure code — you define the behavior, and the platform handles orchestration.
      </p>

      <h2 id="agent-vs-bot-vs-model">Agent vs Bot vs Model</h2>
      <p>
        These terms are often used interchangeably, but they refer to distinct concepts:
      </p>

      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Cpu}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Model"
          description="A language model (GPT-4, Claude, Gemini) is the reasoning engine. It generates text but has no memory, tools, or instructions beyond its training data."
          href="#model"
        />
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Bot"
          description="A bot wraps a model with a fixed set of rules — keyword matching, decision trees, or simple prompt templates. It follows a script but doesn't adapt mid-conversation."
          href="#bot"
        />
        <DocFeatureCard
          icon={Brain}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent"
          description="An agent combines a model, system prompt, tools, and knowledge base into a reasoning loop. It can look up information, call APIs, and adapt its behavior based on context."
          href="#agent"
        />
      </DocCardGrid>

      <DocCallout variant="info" icon={Zap} title="Key distinction">
        An agent doesn't just generate text — it decides <em>what to do</em> at each step. It can retrieve documents, call external services, and chain multiple reasoning steps together before responding.
      </DocCallout>

      <h2 id="architecture">Convio's Agent Architecture</h2>
      <p>
        Every Convio agent is composed of four layers that work together in a reasoning loop:
      </p>

      <h3 id="system-prompt">System Prompt</h3>
      <p>
        The system prompt is the agent's instruction manual. It defines the agent's persona, tone, rules, and priorities. This is where you tell the agent what it should and shouldn't do.
      </p>

      <h3 id="tools">Tools</h3>
      <p>
        Tools are functions the agent can call during a conversation. They range from built-in tools (knowledge base search, web search) to custom integrations (CRM lookups, order tracking, API calls). The model decides when and which tool to invoke.
      </p>

      <h3 id="knowledge-base">Knowledge Base</h3>
      <p>
        The knowledge base gives the agent factual context. Upload documents, paste URLs, or connect data sources. Convio indexes and chunks the content, then retrieves relevant passages at query time using vector search.
      </p>

      <h3 id="model">Model</h3>
      <p>
        The model is the reasoning engine underneath. Convio supports multiple providers — OpenAI, Anthropic, Google, Groq, OpenRouter, and more. You choose the model that fits your latency, quality, and cost requirements.
      </p>

      <h2 id="what-makes-agents-powerful">What Makes Agents Powerful</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Dynamic Retrieval"
          description="Agents pull in relevant context from your knowledge base in real time, instead of relying on a fixed response library."
          href="#"
        />
        <DocFeatureCard
          icon={Wrench}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Tool Use"
          description="Agents call external services mid-conversation — look up orders, create tickets, update records — without human intervention."
          href="#"
        />
      </DocCardGrid>

      <h2 id="use-cases">Use Cases</h2>
      <ul>
        <li><strong>Customer Support:</strong> Answer questions from your knowledge base, escalate complex issues, and create support tickets automatically.</li>
        <li><strong>Sales qualification:</strong> Engage leads, collect information, qualify prospects, and book meetings on your calendar.</li>
        <li><strong>Onboarding:</strong> Walk new users through your product, answer FAQs, and guide them to key features.</li>
        <li><strong>Internal tools:</strong> Build agents that query internal documentation, pull metrics from dashboards, or automate repetitive workflows.</li>
        <li><strong>E-commerce:</strong> Help customers find products, check inventory, track orders, and process returns.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Brain}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating an Agent"
          href="/docs/creating-agent"
        />
        <DocNextStepCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Choosing an AI Model"
          href="/docs/ai-models"
        />
      </DocCardGrid>
    </DocContent>
  )
}
