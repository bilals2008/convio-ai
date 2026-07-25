import { HelpCircle, FileText, Webhook, Key, Gauge, Radio, Server } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function TechnicalFAQsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'FAQs', href: '/docs' },
          { label: 'Technical FAQs' },
        ]}
        title="Technical FAQs"
        description="Deep-dive technical questions about Convio's architecture, integrations, and advanced features."
      />

      <h2 id="overview">Overview</h2>
      <p>
        This page covers the technical side of Convio — how RAG works, file format support, webhooks, API keys, streaming, and self-hosting. For general questions, see the <a href="/docs/faqs">General FAQs</a>.
      </p>

      <h2 id="knowledge-base">Knowledge Base</h2>

      <h3 id="rag-how-it-works">How does RAG work in Convio?</h3>
      <p>
        Convio uses Retrieval-Augmented Generation (RAG) to ground agent responses in your data. When a user sends a message, the system searches your knowledge base for relevant chunks, injects them as context into the prompt, and the model generates a response based on that context. This ensures answers are accurate and traceable to your source documents.
      </p>

      <h3 id="supported-formats">What file formats are supported for the knowledge base?</h3>
      <p>
        Convio supports PDF, DOCX, TXT, CSV, Markdown, and HTML files. URLs can also be crawled to extract page content. Each document is automatically chunked, embedded, and indexed for vector search. Maximum file size is 20MB per document.
      </p>

      <h2 id="integrations">Integrations</h2>

      <h3 id="webhooks">How do webhooks work?</h3>
      <p>
        Webhooks let you receive real-time HTTP POST notifications when events happen in Convio — new conversations, messages, handoffs, or agent state changes. Configure a webhook URL in your agent settings, select the events you want to subscribe to, and Convio will send signed payloads to your endpoint. All payloads include a signature header for verification.
      </p>

      <h3 id="byok">Can I use Convio with my own API keys?</h3>
      <p>
        Yes. Convio supports Bring Your Own Key (BYOK) for all supported AI providers. Add your API key in Settings → Provider Keys, and your agents will use your key instead of Convio's managed credits. This gives you full control over billing, rate limits, and model access directly with the provider.
      </p>

      <h2 id="api">API & Performance</h2>

      <h3 id="rate-limit">What is the API rate limit?</h3>
      <p>
        Rate limits depend on your plan. Free tier: 60 requests per minute. Pro: 300 requests per minute. Enterprise: configurable. Rate limits apply per API key and are enforced at the organization level. Exceeding the limit returns a <code>429</code> status code with a <code>Retry-After</code> header.
      </p>

      <h3 id="streaming">How does streaming work?</h3>
      <p>
        Convio supports Server-Sent Events (SSE) for streaming responses. When enabled, the API sends partial response tokens as they're generated, reducing perceived latency. The client receives a stream of events with delta content that can be rendered incrementally. Streaming is available for all AI providers and all channels.
      </p>

      <h2 id="deployment">Deployment</h2>

      <h3 id="self-hosting">Can I self-host Convio?</h3>
      <p>
        Convio is currently offered as a managed cloud platform. Self-hosting is not available at this time, but we're evaluating it for future releases. In the meantime, you can use BYOK with local models (Ollama, vLLM) to keep inference on your own infrastructure while using Convio's orchestration layer.
      </p>

      <DocCallout variant="info" icon={HelpCircle} title="Enterprise requirements">
        If you have specific compliance or infrastructure requirements, contact us at <a href="mailto:enterprise@convio.ai">enterprise@convio.ai</a>. We work with teams that need custom deployments, dedicated infrastructure, or specific data residency.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhooks Guide"
          href="/docs/webhooks"
        />
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Conventions"
          href="/docs/api-conventions"
        />
      </DocCardGrid>
    </DocContent>
  )
}
