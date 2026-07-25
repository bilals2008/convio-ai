import { Link } from 'react-router-dom'
import { BookOpen, Lightbulb, MessageSquare, Database, Globe, Gauge, Shield, DollarSign, Bot, Puzzle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function BestPracticesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Best Practices Overview' },
        ]}
        title="Best Practices"
        description="Proven guidelines for building reliable, cost-effective, and high-performing AI agents on Convio."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Building an AI agent is easy. Building one that consistently delivers accurate answers, stays within budget, and scales to thousands of conversations requires deliberate design choices. These best practices distill lessons from production deployments into actionable guidance.
      </p>
      <p>
        Each section covers a specific domain — from prompt engineering to cost optimization. Read them in order for a comprehensive foundation, or jump to the topic most relevant to your current challenge.
      </p>

      <DocCallout variant="tip" icon={Lightbulb} title="Start here">
        If you're new to Convio, begin with <strong>Prompt Engineering</strong> and <strong>Knowledge Base Best Practices</strong>. These two areas have the most immediate impact on agent quality.
      </DocCallout>

      <h2 id="categories">Best Practice Categories</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Prompt Engineering"
          description="Write effective system prompts that guide agent behavior, tone, and response quality."
          href="/docs/prompt-engineering"
        />
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Base"
          description="Structure, organize, and maintain your knowledge base for accurate retrieval."
          href="/docs/kb-best-practices"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Multi-Channel Strategy"
          description="Deliver consistent experiences across WhatsApp, web, Discord, and other channels."
          href="/docs/multi-channel-strategy"
        />
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Performance"
          description="Optimize response times, model selection, and caching for fast interactions."
          href="/docs/performance-optimization"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security"
          description="Protect API keys, configure moderation, and control access to your agents."
          href="/docs/security-best-practices"
        />
        <DocFeatureCard
          icon={DollarSign}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Cost Optimization"
          description="Manage token usage, select cost-effective models, and monitor spending."
          href="/docs/cost-optimization"
        />
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Design Patterns"
          description="Decide when to use one agent vs. many, and how to compose them effectively."
          href="/docs/agent-design-patterns"
        />
        <DocFeatureCard
          icon={Puzzle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Design"
          description="Design conversation flows, welcome messages, and error recovery strategies."
          href="/docs/conversation-design"
        />
      </DocCardGrid>

      <h2 id="why-best-practices">Why Best Practices Matter</h2>
      <p>
        AI agents are probabilistic by nature. Unlike traditional software where the same input always produces the same output, LLMs can vary in quality based on how they're configured. Best practices reduce this variance by establishing patterns that produce consistently good results.
      </p>
      <ul>
        <li><strong>Accuracy:</strong> Well-structured prompts and knowledge bases reduce hallucinations and incorrect answers.</li>
        <li><strong>Cost control:</strong> Optimized token usage and model selection prevent unexpected bills.</li>
        <li><strong>Performance:</strong> Caching and efficient retrieval keep response times low under load.</li>
        <li><strong>Security:</strong> Proper access controls and moderation prevent abuse and data leaks.</li>
        <li><strong>Scalability:</strong> Clean agent design patterns make it easier to add features and channels over time.</li>
      </ul>

      <h2 id="applying-best-practices">Applying These Guidelines</h2>
      <p>
        These practices are guidelines, not rigid rules. Every deployment has unique requirements — a customer support agent for a SaaS product has different constraints than a sales qualification bot for an agency. Apply what makes sense, measure results, and iterate.
      </p>

      <DocCallout variant="info" icon={BookOpen} title="Measure and iterate">
        After implementing changes, use Convio's analytics to track key metrics: resolution rate, response accuracy, token usage per conversation, and customer satisfaction. Let data guide your next iteration.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Prompt Engineering"
          href="/docs/prompt-engineering"
        />
        <DocNextStepCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Base Best Practices"
          href="/docs/kb-best-practices"
        />
      </DocCardGrid>
    </DocContent>
  )
}
