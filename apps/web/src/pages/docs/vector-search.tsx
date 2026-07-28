import { Link } from 'react-router-dom'
import { ArrowRight, Database, Search, Brain, Layers, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function VectorSearchPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Vector Search & Embeddings' },
        ]}
        title="Vector Search & Embeddings"
        description="How Convio turns text into vectors and finds semantically relevant content at query time."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Vector search is the engine behind Convio's retrieval system. Instead of matching keywords, it matches <em>meaning</em> — finding documents that are semantically similar to a query, even when no words overlap.
      </p>

      <h2 id="what-are-embeddings">What are Embeddings?</h2>
      <p>
        An embedding is a numerical representation of text — a list of numbers (a vector) that captures the semantic meaning of the content. Two pieces of text with similar meanings will have similar vectors, regardless of whether they share any words.
      </p>
      <p>
        For example, these two sentences would produce very similar embeddings:
      </p>
      <ul>
        <li>"How do I reset my password?"</li>
        <li>"What are the steps for account recovery?"</li>
      </ul>
      <p>
        Despite sharing zero keywords, a human would understand they're asking the same thing. Embeddings capture that understanding mathematically.
      </p>

      <h2 id="how-semantic-search-works">How Semantic Search Works</h2>
      <p>
        When a user asks a question, Convio performs this sequence:
      </p>
      <ol>
        <li><strong>Embed the query:</strong> The user's question is converted into a 384-dimensional vector using the same embedding model used for document chunks.</li>
        <li><strong>Similarity search:</strong> Convio searches the pgvector index for the stored vectors most similar to the query vector. Similarity is measured using cosine distance.</li>
        <li><strong>Return top-k:</strong> The top-k most similar chunks (typically 3–10) are returned as candidates.</li>
        <li><strong>Optional reranking:</strong> If reranking is enabled, a cross-encoder model re-scores the candidates for higher precision. See <Link to="/docs/reranking" className="text-primary hover:underline">Reranking</Link>.</li>
        <li><strong>Inject context:</strong> The final chunks are passed to the language model as context alongside the user's question.</li>
      </ol>

      <h2 id="pgvector">384-d pgvector in Convio</h2>
      <p>
        Convio stores embeddings in <strong>pgvector</strong>, a PostgreSQL extension designed for vector similarity search. Key details:
      </p>
      <ul>
        <li><strong>Dimensions:</strong> 384 — a balance between accuracy, storage cost, and search speed</li>
        <li><strong>Index type:</strong> HNSW (Hierarchical Navigable Small World) for fast approximate nearest-neighbor search</li>
        <li><strong>Distance metric:</strong> Cosine similarity — measures the angle between vectors, ignoring magnitude</li>
        <li><strong>Performance:</strong> Sub-millisecond search across thousands of documents</li>
      </ul>

      <DocCallout variant="info" icon={Database} title="Why pgvector?">
        Using pgvector means your vector data lives alongside your relational data in the same PostgreSQL database. No separate vector database to manage, no data syncing, no additional infrastructure.
      </DocCallout>

      <h2 id="relevance-tuning">Search Relevance and Tuning</h2>
      <p>
        Convio provides several levers to tune retrieval quality:
      </p>

      <h3 id="top-k">Top-K Results</h3>
      <p>
        Controls how many chunks are retrieved. More chunks give the model more context but increase token usage. Default is 5 — a good starting point for most use cases.
      </p>

      <h3 id="similarity-threshold">Similarity Threshold</h3>
      <p>
        Sets a minimum similarity score for retrieved chunks. Chunks below the threshold are excluded. This filters out low-relevance noise but may miss marginally relevant content.
      </p>

      <h3 id="reranking">Reranking</h3>
      <p>
        A more powerful (but slower) second-pass scoring that uses a cross-encoder model to re-evaluate retrieved chunks. Greatly improves precision at the cost of latency.
      </p>

      <DocCallout variant="tip" icon={Zap} title="Start simple">
        Begin with default settings (top-k=5, no reranking) and measure accuracy. Only tune these parameters if you observe specific retrieval issues — most use cases work well out of the box.
      </DocCallout>

      <h2 id="keyword-vs-semantic">Keyword vs Semantic Search</h2>
      <p>
        Convio uses semantic search by default, but understanding the difference helps:
      </p>
      <ul>
        <li><strong>Keyword search:</strong> Matches exact words or phrases. Fast but brittle — misses synonyms, paraphrases, and related concepts.</li>
        <li><strong>Semantic search:</strong> Matches meaning. Slower but far more flexible — catches synonyms, paraphrases, and conceptual similarity.</li>
      </ul>
      <p>
        For most knowledge base use cases, semantic search produces significantly better results. Keyword search can be useful as a fallback for highly specific terms (model numbers, codes, proper nouns).
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Understanding Chunking"
          href="/docs/understanding-chunking"
        />
        <DocNextStepCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Reranking Results"
          href="/docs/reranking"
        />
      </DocCardGrid>
    </DocContent>
  )
}
