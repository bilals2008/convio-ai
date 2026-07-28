import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw, Target, Zap, Clock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function RerankingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Reranking Results' },
        ]}
        title="Reranking Results"
        description="Use a cross-encoder model to re-score retrieved chunks for higher precision and better answer quality."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Vector search is fast but approximate — it finds semantically similar chunks, but doesn't deeply understand the relationship between the query and each result. Reranking fixes this by re-evaluating the top candidates with a more precise model.
      </p>

      <h2 id="what-is-reranking">What is Reranking?</h2>
      <p>
        Reranking is a two-stage retrieval process:
      </p>
      <ol>
        <li><strong>Stage 1 — Retrieval:</strong> Vector search finds the top-k most similar chunks (fast, approximate)</li>
        <li><strong>Stage 2 — Reranking:</strong> A cross-encoder model scores each chunk against the query, producing a more accurate relevance ranking (slower, precise)</li>
      </ol>
      <p>
        The cross-encoder sees the query and chunk <em>together</em>, allowing it to judge relevance more accurately than vector similarity alone. This catches cases where vector search returns semantically related but contextually irrelevant chunks.
      </p>

      <h2 id="how-it-improves-quality">How it Improves Answer Quality</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Target}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Better Precision"
          description="Reranking pushes the most relevant chunks to the top and demotes noise. The model gets higher-quality context, producing more accurate answers."
          href="#"
        />
        <DocFeatureCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Handles Nuance"
          description="Cross-encoders understand subtle differences in relevance that cosine similarity misses — like distinguishing 'how to buy' from 'how to return'."
          href="#"
        />
      </DocCardGrid>

      <h2 id="when-to-enable">When to Enable Reranking</h2>
      <p>
        Reranking is optional. Enable it when:
      </p>
      <ul>
        <li>Your agent's answers are technically related but missing the point</li>
        <li>Vector search returns chunks that are semantically similar but contextually wrong</li>
        <li>You need higher accuracy for critical use cases (medical, legal, financial)</li>
        <li>Your knowledge base has documents with overlapping topics</li>
      </ul>
      <p>
        Skip reranking when:
      </p>
      <ul>
        <li>Latency is critical (reranking adds 50–200ms per query)</li>
        <li>Your knowledge base is small and well-structured</li>
        <li>Vector search results are already accurate enough</li>
      </ul>

      <h2 id="enabling-reranking">Enabling Reranking</h2>
      <ol>
        <li>Open your agent's settings</li>
        <li>Go to <strong>Knowledge Base</strong> → <strong>Retrieval Settings</strong></li>
        <li>Toggle <strong>Reranking</strong> on</li>
        <li>Adjust the rerank depth if needed (default: top 10 candidates reranked)</li>
      </ol>

      <h2 id="performance-tradeoffs">Performance Tradeoffs</h2>
      <ul>
        <li><strong>Latency:</strong> Reranking adds 50–200ms depending on the number of candidates</li>
        <li><strong>Token usage:</strong> Reranking requires processing each candidate, increasing compute cost</li>
        <li><strong>Accuracy gain:</strong> Typically 10–30% improvement in retrieval precision for complex queries</li>
      </ul>

      <DocCallout variant="tip" icon={Zap} title="Rerank depth">
        The default rerank depth is 10 — the top 10 vector search results are re-scored. For most use cases, this is sufficient. Increasing to 20 may catch more relevant chunks but adds latency.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Target}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Vector Search & Embeddings"
          href="/docs/vector-search"
        />
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Statuses"
          href="/docs/document-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
