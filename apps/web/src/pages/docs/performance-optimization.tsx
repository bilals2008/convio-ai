import { Gauge, Zap, Database, Clock, Server, Settings, AlertTriangle, Lightbulb } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function PerformanceOptimizationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Performance Optimization' },
        ]}
        title="Performance Optimization"
        description="Reduce response times and improve throughput by optimizing model selection, caching, and token usage."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Response time directly impacts user satisfaction. A delay of more than 2–3 seconds causes users to disengage. Performance optimization in AI agents involves three levers: choosing the right model, reducing the amount of data processed per request, and caching repeated work.
      </p>

      <h2 id="model-selection">Model Selection for Speed vs Quality</h2>
      <p>
        Different models have different latency profiles. Select models based on your performance requirements:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model Tier</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Examples</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Latency</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Best For</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Fast</td>
              <td className="py-2 pr-4">GPT-4o-mini, Claude Haiku, Gemini Flash</td>
              <td className="py-2 pr-4">&lt; 1s</td>
              <td className="py-2">Simple Q&A, FAQ responses, quick lookups</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Balanced</td>
              <td className="py-2 pr-4">GPT-4o, Claude Sonnet, Gemini Pro</td>
              <td className="py-2 pr-4">1–2s</td>
              <td className="py-2">General support, multi-step reasoning, tool use</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Powerful</td>
              <td className="py-2 pr-4">GPT-4, Claude Opus, Gemini Ultra</td>
              <td className="py-2 pr-4">2–5s</td>
              <td className="py-2">Complex analysis, nuanced reasoning, research tasks</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={Zap} title="Use model routing">
        Convio supports model selection per agent. Consider using a fast model for initial responses and escalating to a more powerful model when the query requires deeper reasoning.
      </DocCallout>

      <h2 id="caching">Caching Strategies</h2>
      <p>
        Many conversations involve repeated queries. Caching avoids redundant processing:
      </p>
      <ul>
        <li><strong>Response caching:</strong> Cache responses to identical or semantically similar questions. This is effective for FAQ-type content where the answer doesn't change frequently.</li>
        <li><strong>Knowledge retrieval caching:</strong> Cache vector search results for common queries. Reusing retrieval results saves embedding lookups and reduces latency.</li>
        <li><strong>Session caching:</strong> Within a conversation, cache the conversation history and tool results. Avoid re-processing the same context on each message.</li>
      </ul>

      <h2 id="token-usage">Reducing Token Usage</h2>
      <p>
        Tokens are the unit of both cost and latency. Fewer tokens mean faster responses and lower bills:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Optimize Knowledge Retrieval"
          description="Tune chunk sizes and retrieval limits to return only the most relevant content. Over-retrieving wastes tokens on irrelevant context."
          href="/docs/kb-best-practices"
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Trim Conversation History"
          description="Limit the conversation history sent to the model. Keep the last 5–10 messages for most use cases rather than the full history."
          href="#"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Concise System Prompts"
          description="Keep system prompts under 800 tokens. Every token in the prompt is sent with every message — a 2,000-token prompt adds latency to every turn."
          href="/docs/prompt-engineering"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Structured Output"
          description="Request structured JSON output when the caller needs to parse responses. Structured output reduces wasted tokens from verbose explanations."
          href="#"
        />
      </DocCardGrid>

      <h2 id="response-times">Optimizing Response Times</h2>
      <p>
        End-to-end response time includes retrieval, model inference, and post-processing. Target optimizations at the biggest bottleneck:
      </p>
      <ol>
        <li><strong>Measure first:</strong> Use Convio's analytics to identify where time is spent — retrieval vs. inference vs. post-processing.</li>
        <li><strong>Parallelize where possible:</strong> Run retrieval and moderation checks in parallel when the pipeline allows it.</li>
        <li><strong>Stream responses:</strong> Enable streaming so users see tokens as they're generated rather than waiting for the complete response.</li>
        <li><strong>Optimize retrieval:</strong> Use filters and metadata to narrow vector search scope. A smaller search space means faster retrieval.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't sacrifice accuracy for speed">
        A fast response that's wrong is worse than a slightly slower response that's correct. Always validate that performance optimizations don't degrade answer quality.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Gauge}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Available Models"
          href="/docs/available-models"
        />
        <DocNextStepCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Message Streaming"
          href="/docs/message-streaming"
        />
      </DocCardGrid>
    </DocContent>
  )
}
