import { Link } from 'react-router-dom'
import { ArrowRight, LayoutTemplate, FileText, Zap, Settings, Plus } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function KnowledgeBaseTemplatesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Knowledge Base Templates' },
        ]}
        title="Knowledge Base Templates"
        description="Start with pre-built templates for common use cases or create a knowledge base from scratch."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio offers knowledge base templates that come with pre-configured settings, suggested document structures, and recommended chunking strategies for common scenarios. Templates save time and ensure you're following best practices from the start.
      </p>

      <h2 id="how-templates-work">How Templates Work</h2>
      <p>
        A template provides a starting configuration — not pre-loaded content. When you create a KB from a template, you get:
      </p>
      <ul>
        <li><strong>Optimized chunking settings</strong> tuned for the content type</li>
        <li><strong>Suggested folder structure</strong> for organizing documents</li>
        <li><strong>Recommended retrieval settings</strong> (top-k, similarity threshold)</li>
        <li><strong>Sample content</strong> showing how to structure your documents</li>
      </ul>
      <p>
        You still upload your own content — the template just gives you the right configuration to start with.
      </p>

      <h2 id="available-templates">Available Templates</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Product Documentation"
          description="Optimized for technical docs with headings, code blocks, and API references. Uses 300–500 token chunks to preserve context in technical explanations."
          href="#"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="FAQ / Knowledge Base"
          description="Designed for question-answer pairs. Uses 100–200 token chunks to keep each answer self-contained and precise."
          href="#"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Customer Support"
          description="Combines product docs, policies, and troubleshooting guides. Balanced chunking for both detailed guides and quick answers."
          href="#"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Legal & Compliance"
          description="Structured for contracts, policies, and regulatory documents. Uses 200–400 token chunks to keep clauses intact."
          href="#"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Internal Wiki"
          description="For team knowledge, SOPs, and internal documentation. Flexible chunking for mixed content types."
          href="#"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="E-commerce Catalog"
          description="Optimized for product listings with structured attributes. 100–200 token chunks per product."
          href="#"
        />
      </DocCardGrid>

      <h2 id="from-template-vs-scratch">From Template vs From Scratch</h2>

      <h3 id="use-template">Use a Template When</h3>
      <ul>
        <li>You're setting up a knowledge base for the first time</li>
        <li>Your content matches one of the common use cases above</li>
        <li>You want optimized settings without tuning manually</li>
        <li>You're not sure what chunk size or retrieval settings to use</li>
      </ul>

      <h3 id="from-scratch">Create from Scratch When</h3>
      <ul>
        <li>Your content doesn't fit a standard category</li>
        <li>You have specific chunking or retrieval requirements</li>
        <li>You've already experimented with templates and want full control</li>
        <li>You're combining multiple content types in one KB</li>
      </ul>

      <h2 id="creating-from-template">Creating from a Template</h2>
      <ol>
        <li>Go to <strong>Knowledge Bases</strong> → <strong>New Knowledge Base</strong></li>
        <li>Select <strong>From Template</strong></li>
        <li>Browse the template library and select one</li>
        <li>Review the pre-filled settings</li>
        <li>Name your knowledge base and click <strong>Create</strong></li>
        <li>Upload your content — the template settings are already applied</li>
      </ol>

      <DocCallout variant="tip" icon={Zap} title="Templates are fully editable">
        After creation, every setting from the template can be adjusted. The template is a starting point, not a constraint.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Plus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Knowledge Base"
          href="/docs/creating-knowledge-base"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Knowledge Bases"
          href="/docs/managing-knowledge-bases"
        />
      </DocCardGrid>
    </DocContent>
  )
}
