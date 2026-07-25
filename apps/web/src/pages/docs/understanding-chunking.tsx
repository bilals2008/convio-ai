import { Link } from 'react-router-dom'
import { ArrowRight, Layers, Split, Target, AlertCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UnderstandingChunkingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Understanding Chunking' },
        ]}
        title="Understanding Chunking"
        description="How documents are split into chunks, and why chunk size and strategy directly affect answer quality."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Chunking is the process of splitting a document into smaller pieces for indexing. It's one of the most important factors in RAG quality — get it right, and your agent retrieves precise, relevant context. Get it wrong, and the model receives either too much noise or too little information.
      </p>

      <h2 id="what-is-chunking">What is Chunking?</h2>
      <p>
        When you upload a 50-page PDF, Convio doesn't index the entire document as one unit. That would be like searching a book by looking at the cover — the model would get the whole book as context for every question, most of it irrelevant.
      </p>
      <p>
        Instead, Convio splits the document into smaller chunks — typically a few hundred words each. Each chunk is independently embedded and indexed, so when a question comes in, only the most relevant chunks are retrieved.
      </p>

      <h2 id="why-chunking-matters">Why Chunking Matters</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Target}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Too Large"
          description="Large chunks contain irrelevant context mixed with relevant content. The model wastes tokens on noise and may produce vague, unfocused answers."
          href="#"
        />
        <DocFeatureCard
          icon={Split}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Too Small"
          description="Tiny chunks lose context. A sentence extracted from the middle of a paragraph may not make sense on its own, leading to fragmented answers."
          href="#"
        />
      </DocCardGrid>

      <DocCallout variant="info" icon={Layers} title="The sweet spot">
        Convio's default chunking targets 200–500 tokens (roughly 150–375 words) with semantic boundary detection. This captures enough context to be meaningful while staying focused enough to be relevant.
      </DocCallout>

      <h2 id="chunk-strategies">Chunking Strategies</h2>

      <h3 id="fixed-size">Fixed-Size Splitting</h3>
      <p>
        The simplest approach: split text every N characters or tokens. Fast and predictable, but can cut sentences and paragraphs in half, breaking context.
      </p>

      <h3 id="semantic-boundary">Semantic Boundary Splitting</h3>
      <p>
        Convio's primary strategy. It splits at natural boundaries — paragraph breaks, heading levels, sentence endings — while respecting a maximum chunk size. This produces chunks that are self-contained and coherent.
      </p>

      <h3 id="recursive">Recursive Splitting</h3>
      <p>
        When a section exceeds the maximum chunk size, Convio recursively splits it at the next level of boundary: first by heading, then by paragraph, then by sentence. This preserves as much structure as possible.
      </p>

      <h2 id="chunk-size-guide">Optimal Chunk Sizes by Content Type</h2>
      <p>
        Different content types benefit from different chunk sizes:
      </p>
      <ul>
        <li><strong>FAQ content:</strong> 100–200 tokens. Questions and answers are naturally short and self-contained.</li>
        <li><strong>Documentation:</strong> 300–500 tokens. Technical explanations need context to be meaningful.</li>
        <li><strong>Legal/policy text:</strong> 200–400 tokens. Specific clauses and conditions need to stay together.</li>
        <li><strong>Conversational data:</strong> 150–300 tokens. Dialogue turns or chat logs work best in shorter chunks.</li>
        <li><strong>Product catalogs:</strong> 100–200 tokens. Each product is its own chunk with key attributes.</li>
      </ul>

      <h2 id="overlap">Chunk Overlap</h2>
      <p>
        Convio applies a small overlap between consecutive chunks (typically 10–20%). This ensures that information spanning a chunk boundary isn't lost. For example, if a sentence starts at the end of one chunk and continues into the next, the overlap ensures both chunks capture it.
      </p>

      <h2 id="impact-on-quality">Impact on Answer Quality</h2>
      <p>
        Chunking strategy directly affects three aspects of retrieval quality:
      </p>
      <ul>
        <li><strong>Precision:</strong> How relevant the retrieved chunks are to the query</li>
        <li><strong>Recall:</strong> Whether all relevant information is captured</li>
        <li><strong>Context coherence:</strong> Whether the chunks make sense to the model when used as context</li>
      </ul>

      <DocCallout variant="tip" icon={Target} title="Test and iterate">
        If your agent's answers are vague or missing key details, try adjusting chunk sizes. Smaller chunks improve precision; larger chunks improve context coherence. There's no one-size-fits-all — test with real questions and measure accuracy.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Vector Search & Embeddings"
          href="/docs/vector-search"
        />
        <DocNextStepCard
          icon={AlertCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Reranking Results"
          href="/docs/reranking"
        />
      </DocCardGrid>
    </DocContent>
  )
}
