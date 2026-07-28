import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Database, FileSearch, Layers, Upload } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WhatIsKnowledgeBasePage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'What is a Knowledge Base?' },
        ]}
        title="What is a Knowledge Base?"
        description="A knowledge base gives your agent factual, up-to-date context beyond its training data — powered by Retrieval-Augmented Generation (RAG)."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Language models are powerful, but they only know what they were trained on. They can't access your product docs, internal policies, or recently published content. A knowledge base solves this by letting you upload your own data and making it searchable at conversation time.
      </p>
      <p>
        Convio's knowledge base uses Retrieval-Augmented Generation — commonly known as RAG — to find the most relevant passages from your documents and inject them into the model's context before it generates a response.
      </p>

      <h2 id="what-is-rag">What is RAG?</h2>
      <p>
        RAG stands for <strong>Retrieval-Augmented Generation</strong>. It's a technique that combines two steps:
      </p>
      <ol>
        <li><strong>Retrieval:</strong> When a user asks a question, the system searches your knowledge base for the most relevant chunks of text.</li>
        <li><strong>Generation:</strong> The retrieved chunks are passed to the language model as context, and the model generates an answer grounded in that context.</li>
      </ol>
      <p>
        This means the model doesn't hallucinate answers — it references your actual content and cites its sources.
      </p>

      <DocCallout variant="info" icon={Brain} title="Why not just use a bigger model?">
        Even the most capable models have a knowledge cutoff date and no access to your proprietary data. RAG bridges that gap without fine-tuning or retraining.
      </DocCallout>

      <h2 id="when-to-use">When to Use a Knowledge Base</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Use a Knowledge Base When"
          description="Your content changes frequently, you need answers grounded in specific documents, you have proprietary or internal data, or compliance requires cited sources."
          href="#"
        />
        <DocFeatureCard
          icon={Brain}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Model Training May Suffice When"
          description="Your use case is general-purpose (creative writing, brainstorming), the data is static and widely known, or latency is critical and retrieval adds unacceptable delay."
          href="#"
        />
      </DocCardGrid>

      <h2 id="how-kb-improves-accuracy">How Knowledge Bases Improve Accuracy</h2>
      <p>
        Without a knowledge base, a model generates answers from its training data — which may be outdated, incomplete, or simply wrong for your specific context. A knowledge base improves accuracy in three ways:
      </p>
      <ul>
        <li><strong>Grounding:</strong> Responses are based on your actual documents, not the model's best guess.</li>
        <li><strong>Recency:</strong> Upload new content anytime — the model sees it immediately without retraining.</li>
        <li><strong>Citations:</strong> Convio includes source references so users (and you) can verify where an answer came from.</li>
      </ul>

      <h2 id="convio-architecture">Convio's KB Architecture</h2>
      <p>
        Convio handles the full RAG pipeline behind the scenes. Here's how your content flows from upload to answer:
      </p>

      <h3 id="step-1-documents">1. Documents</h3>
      <p>
        You upload files (PDF, TXT, Markdown, CSV, JSON) or paste URLs. Convio ingests the raw content from each source.
      </p>

      <h3 id="step-2-chunking">2. Chunking</h3>
      <p>
        Documents are split into smaller, semantically meaningful chunks. This ensures retrieval targets precise passages rather than entire documents — dramatically improving relevance.
      </p>

      <h3 id="step-3-embeddings">3. Embeddings</h3>
      <p>
        Each chunk is converted into a 384-dimensional vector using a text embedding model. These vectors capture the semantic meaning of the text, not just keywords.
      </p>

      <h3 id="step-4-vector-search">4. Vector Search</h3>
      <p>
        At query time, the user's question is also embedded into a vector. Convio performs a similarity search against your stored vectors using pgvector, returning the most relevant chunks.
      </p>

      <DocCallout variant="tip" icon={FileSearch} title="Semantic, not keyword">
        Vector search understands meaning. A query for "how do I reset my password" will match a document that says "account recovery steps" — even though no keywords overlap.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Upload}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Knowledge Base"
          href="/docs/creating-knowledge-base"
        />
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Supported Document Types"
          href="/docs/supported-documents"
        />
      </DocCardGrid>
    </DocContent>
  )
}
