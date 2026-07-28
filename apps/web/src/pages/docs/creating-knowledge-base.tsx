import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Link2, FileText, Upload, Settings, Bot } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CreatingKnowledgeBasePage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating a Knowledge Base' },
        ]}
        title="Creating a Knowledge Base"
        description="Set up a knowledge base in minutes — name it, add content, and link it to an agent."
      />

      <h2 id="overview">Overview</h2>
      <p>
        A knowledge base is where your agent's factual content lives. Creating one takes three steps: give it a name, add sources, and link it to an agent.
      </p>

      <h2 id="step-by-step">Step-by-Step</h2>

      <h3 id="step-1-navigate">Step 1 — Navigate to Knowledge Bases</h3>
      <p>
        From the dashboard, click <strong>Knowledge Bases</strong> in the sidebar, then click <strong>New Knowledge Base</strong> in the top-right corner.
      </p>

      <h3 id="step-2-name">Step 2 — Name and Describe</h3>
      <p>
        Give your knowledge base a descriptive name — something like "Product Documentation" or "Internal FAQ". The description is optional but helps your team understand what content it contains.
      </p>

      <h3 id="step-3-agent">Step 3 — Select an Agent (Optional)</h3>
      <p>
        You can link a knowledge base to one or more agents during creation, or do it later from the agent settings. Each agent can use multiple knowledge bases.
      </p>

      <DocCallout variant="tip" icon={Bot} title="Multiple agents, one KB">
        A single knowledge base can be shared across agents. Create it once and link it wherever it's needed — no duplication required.
      </DocCallout>

      <h3 id="step-4-save">Step 4 — Save</h3>
      <p>
        Click <strong>Create Knowledge Base</strong>. You'll be taken to the content page where you can start adding sources.
      </p>

      <h2 id="kb-sources">Knowledge Base Sources</h2>
      <p>
        Convio supports three types of content sources. You can mix and match within a single knowledge base.
      </p>

      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Upload}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="File Upload"
          description="Upload PDFs, text files, Markdown, CSVs, or JSON directly. Drag and drop or use the file picker."
          href="/docs/uploading-documents"
        />
        <DocFeatureCard
          icon={Link2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="URLs"
          description="Paste a URL and Convio will crawl the page, extract the text, and index it. Supports single pages and sitemaps."
          href="/docs/adding-web-pages"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Text Paste"
          description="Paste raw text directly into the editor. Useful for FAQs, short policies, or quick updates without uploading a file."
          href="#"
        />
      </DocCardGrid>

      <h2 id="linking-to-agents">Linking to Agents</h2>
      <p>
        After creating a knowledge base, link it to an agent so the agent can retrieve context during conversations. There are two ways to do this:
      </p>

      <h3 id="from-kb-page">From the Knowledge Base Page</h3>
      <ol>
        <li>Open the knowledge base</li>
        <li>Click the <strong>Linked Agents</strong> tab</li>
        <li>Click <strong>Link Agent</strong> and select from your agents</li>
      </ol>

      <h3 id="from-agent-settings">From Agent Settings</h3>
      <ol>
        <li>Open the agent you want to configure</li>
        <li>Go to <strong>Settings</strong> → <strong>Knowledge Base</strong></li>
        <li>Select the knowledge base from the dropdown</li>
      </ol>

      <DocCallout variant="warning" icon={Settings} title="Processing time">
        After adding content, Convio processes and indexes it in the background. Large documents may take a few minutes. The agent won't retrieve content until processing is complete.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Upload}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Uploading Documents"
          href="/docs/uploading-documents"
        />
        <DocNextStepCard
          icon={Link2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Adding Web Pages"
          href="/docs/adding-web-pages"
        />
      </DocCardGrid>
    </DocContent>
  )
}
