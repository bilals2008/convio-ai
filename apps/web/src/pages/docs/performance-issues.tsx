import { AlertTriangle, Gauge, Clock, Cpu, Zap, Settings, RefreshCw, BarChart } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function PerformanceIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Performance Issues' },
        ]}
        title="Performance Issues"
        description="Diagnose and fix slow response times, timeout errors, memory issues, and optimize your Convio setup."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Performance issues manifest as slow agent responses, frequent timeouts, or degraded UI responsiveness. The cause could be in the AI provider, knowledge base configuration, client-side code, or network path. Work through each category to identify the bottleneck.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Check <strong>Analytics → Performance</strong> for response time trends</li>
        <li>Review the conversation logs for timeout errors or slow requests</li>
        <li>Test a simple query to establish a baseline response time</li>
        <li>Check the AI provider's status page for reported slowdowns</li>
        <li>Monitor the browser's Network tab for client-side delays</li>
      </ol>

      <h2 id="slow-responses">Slow Response Times</h2>
      <p>
        Agent responses take several seconds or longer. The bottleneck is usually in the AI provider or knowledge base retrieval.
      </p>

      <h3 id="provider-side">Provider-Side Causes</h3>
      <ul>
        <li><strong>Model selection:</strong> Larger models (GPT-4, Claude 3.5) are slower than smaller ones (GPT-3.5, Haiku)</li>
        <li><strong>Context length:</strong> Long system prompts and conversation histories increase processing time</li>
        <li><strong>Provider load:</strong>高峰期 (peak hours) at the provider can add 1-3 seconds of latency</li>
        <li><strong>Rate limiting:</strong> Queued requests wait for rate limit windows to reset</li>
      </ul>

      <DocCallout variant="info" icon={Zap} title="Quick win">
        Switch to a faster model for time-sensitive interactions. Use GPT-3.5 or Claude Haiku for chat, reserving larger models for complex tasks.
      </DocCallout>

      <h3 id="client-side">Client-Side Causes</h3>
      <ul>
        <li><strong>Large DOM:</strong> Too many elements on the page slow rendering</li>
        <li><strong>Unoptimized images:</strong> Large images without compression delay page load</li>
        <li><strong>Heavy JavaScript:</strong> Third-party scripts compete for resources</li>
        <li><strong>No caching:</strong> Repeated requests without cache headers</li>
      </ul>

      <h2 id="timeout-errors">Timeout Errors</h2>
      <p>
        Requests exceed the allowed time limit and are terminated.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="API Timeout"
          description="The request to the AI provider exceeded 30 seconds. The provider may be overloaded or the prompt too complex."
          href="/docs/usage-limits"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Streaming Timeout"
          description="The SSE stream didn't complete within 5 minutes. Check for infinite loops in tool calls or long-running searches."
          href="/docs/streaming-api"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Webhook Timeout"
          description="Webhook delivery timed out after 30 seconds. Optimize your endpoint to respond faster."
          href="/docs/webhooks"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="KB Search Timeout"
          description="Knowledge base search exceeded the timeout. Reduce the number of documents or optimize chunking."
          href="/docs/vector-search"
        />
      </DocCardGrid>

      <h3 id="reduce-timeouts">How to Reduce Timeouts</h3>
      <ol>
        <li>Shorten system prompts — every token counts toward processing time</li>
        <li>Limit conversation history to the last 10-20 messages</li>
        <li>Use a faster model for initial responses</li>
        <li>Implement conversation truncation for long sessions</li>
        <li>Split large knowledge bases into smaller, focused ones</li>
      </ol>

      <h2 id="memory-issues">Memory Issues</h2>
      <p>
        High memory usage in the browser causes slowdowns, especially on long conversations or pages with many widgets.
      </p>

      <h3 id="memory-symptoms">Symptoms</h3>
      <ul>
        <li>Browser tab memory exceeds 500MB</li>
        <li>Page becomes unresponsive after extended use</li>
        <li>Multiple widget instances on the same page</li>
        <li>Conversation history accumulates without cleanup</li>
      </ul>

      <DocCallout variant="warning" icon={Cpu} title="Memory optimization">
        Limit the number of widget instances per page to 1. If you need widgets on multiple pages, unmount the widget when navigating away to free memory.
      </DocCallout>

      <h3 id="memory-fixes">Memory Fixes</h3>
      <ul>
        <li>Unmount the widget component when the page unmounts</li>
        <li>Clear conversation history periodically for long-running sessions</li>
        <li>Avoid loading multiple widget instances on the same page</li>
        <li>Use React's cleanup functions to remove event listeners</li>
      </ul>

      <h2 id="optimization-tips">Optimization Tips</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Use Streaming"
          description="Enable streaming to show responses as they're generated. Perceived performance improves even if total time is the same."
          href="/docs/streaming-api"
        />
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Cache Responses"
          description="Cache frequent queries on the client side. Avoid re-sending identical messages within short time windows."
          href="/docs/webhooks"
        />
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Optimize Prompts"
          description="Shorter system prompts mean faster responses. Remove unnecessary instructions and examples."
          href="/docs/system-prompts"
        />
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          title="Choose the Right Model"
          description="Use fast models for simple queries and powerful models for complex tasks. Route based on complexity."
          href="/docs/supported-providers"
        />
      </DocCardGrid>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Analytics & Metrics"
          href="/docs/key-metrics"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Usage Limits"
          href="/docs/usage-limits"
        />
      </DocCardGrid>
    </DocContent>
  )
}
