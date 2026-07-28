import { Link } from 'react-router-dom'
import { ArrowRight, Settings, Trash2, Plus, RefreshCw, Bot, FileText } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ManagingKnowledgeBasesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Knowledge Bases' },
        ]}
        title="Managing Knowledge Bases"
        description="Edit settings, add or remove documents, reprocess content, and delete knowledge bases."
      />

      <h2 id="overview">Overview</h2>
      <p>
        After creating a knowledge base, you'll manage it over time — adding new documents, removing outdated ones, reprocessing content, and adjusting settings. This guide covers day-to-day KB management.
      </p>

      <h2 id="editing-settings">Editing KB Settings</h2>
      <p>
        To update a knowledge base's name or description:
      </p>
      <ol>
        <li>Open the knowledge base from the list</li>
        <li>Click the <strong>Settings</strong> tab</li>
        <li>Edit the name or description</li>
        <li>Click <strong>Save</strong></li>
      </ol>
      <p>
        Changing the name doesn't affect processing or retrieval — it's purely organizational.
      </p>

      <h2 id="adding-documents">Adding Documents</h2>
      <p>
        Add content at any time after creation:
      </p>
      <ol>
        <li>Open the knowledge base</li>
        <li>Go to the <strong>Documents</strong> tab</li>
        <li>Click <strong>Upload Files</strong> or drag files into the upload zone</li>
        <li>New documents are processed and indexed automatically</li>
      </ol>
      <p>
        See <Link to="/docs/uploading-documents" className="text-primary hover:underline">Uploading Documents</Link> and <Link to="/docs/adding-web-pages" className="text-primary hover:underline">Adding Web Pages</Link> for details.
      </p>

      <h2 id="removing-documents">Removing Documents</h2>
      <p>
        Remove individual documents without affecting the rest of the knowledge base:
      </p>
      <ol>
        <li>Open the knowledge base → <strong>Documents</strong> tab</li>
        <li>Find the document in the list</li>
        <li>Click the <strong>⋮</strong> menu → <strong>Delete</strong></li>
        <li>Confirm the deletion</li>
      </ol>
      <p>
        The document's chunks and embeddings are immediately removed from the vector index. The agent can no longer retrieve content from the deleted document.
      </p>

      <DocCallout variant="warning" icon={Trash2} title="Permanent deletion">
        Deleting a document is permanent. There's no undo. If you might need the document later, keep a copy in your local files.
      </DocCallout>

      <h2 id="reprocessing">Reprocessing Content</h2>
      <p>
        Reprocessing re-runs the full pipeline (text extraction → chunking → embedding) on existing documents. Use it when:
      </p>
      <ul>
        <li>A document failed to process and you've fixed the source file</li>
        <li>You've changed chunking settings and want to re-index with the new configuration</li>
        <li>The document's content has been updated and you've re-uploaded the file</li>
      </ul>

      <h3 id="reprocess-single">Reprocess a Single Document</h3>
      <ol>
        <li>Open the knowledge base → <strong>Documents</strong> tab</li>
        <li>Click the <strong>⋮</strong> menu on the document → <strong>Reprocess</strong></li>
      </ol>

      <h3 id="reprocess-all">Reprocess All Documents</h3>
      <ol>
        <li>Open the knowledge base → <strong>Settings</strong> tab</li>
        <li>Click <strong>Reprocess All</strong></li>
        <li>Confirm the action</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Batch reprocessing">
        Reprocessing all documents may take several minutes depending on the KB size. You can continue working while it runs in the background.
      </DocCallout>

      <h2 id="deleting-a-kb">Deleting a Knowledge Base</h2>
      <p>
        Deleting a knowledge base removes all its documents, chunks, and embeddings permanently. To delete:
      </p>
      <ol>
        <li>Open the knowledge base → <strong>Settings</strong> tab</li>
        <li>Scroll to the bottom and click <strong>Delete Knowledge Base</strong></li>
        <li>Type the knowledge base name to confirm</li>
        <li>Click <strong>Delete</strong></li>
      </ol>

      <h2 id="impact-on-agents">Impact on Agents</h2>
      <p>
        When you modify a knowledge base, the changes affect all linked agents:
      </p>
      <ul>
        <li><strong>Adding documents:</strong> Agents immediately gain access to the new content (after processing)</li>
        <li><strong>Removing documents:</strong> Agents can no longer retrieve the removed content</li>
        <li><strong>Reprocessing:</strong> Agents temporarily use stale results until reprocessing completes</li>
        <li><strong>Deleting a KB:</strong> All linked agents lose the knowledge base entirely</li>
      </ul>

      <DocCallout variant="warning" icon={Bot} title="Agent fallback">
        If an agent's knowledge base is deleted or unavailable, it falls back to its system prompt and model training data. It won't error out — it just won't have factual context for retrieval.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Base Templates"
          href="/docs/knowledge-base-templates"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Statuses"
          href="/docs/document-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
