import { Link } from 'react-router-dom'
import { Search, Filter, Download, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ConversationSearchPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Conversation Search' },
        ]}
        title="Conversation Search"
        description="Search across all conversations and messages with full-text search, apply filters, export results, and understand search limitations."
      />

      <h2 id="full-text-search">Full-Text Search</h2>
      <p>
        The search bar on the Conversations page performs full-text search across your entire conversation history. It indexes and searches:
      </p>
      <ul>
        <li><strong>Message content:</strong> Every user and agent message is indexed in near real-time</li>
        <li><strong>Contact information:</strong> Names, emails, and phone numbers</li>
        <li><strong>Tags:</strong> Conversation tags are searchable by keyword</li>
        <li><strong>Custom metadata:</strong> All custom key-value pairs are indexed</li>
        <li><strong>Agent names:</strong> Filter by the human agent who handled the conversation</li>
      </ul>

      <h3 id="search-syntax">Search Syntax</h3>
      <p>
        Convio supports basic search operators:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Operator</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Example</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Exact phrase</td>
              <td className="py-2 pr-4">"refund policy"</td>
              <td className="py-2">Searches for the exact phrase</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Exclusion</td>
              <td className="py-2 pr-4">-spam</td>
              <td className="py-2">Excludes results containing the word</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Field search</td>
              <td className="py-2 pr-4">tag:billing</td>
              <td className="py-2">Searches within a specific metadata field</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Boolean AND</td>
              <td className="py-2 pr-4">refund AND delay</td>
              <td className="py-2">Both terms must be present</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="filtering">Filtering by Criteria</h2>
      <p>
        Combine search terms with filters for precise results. Filters can be applied independently or layered together:
      </p>

      <h3 id="status-filter">Status Filter</h3>
      <ul>
        <li>Active, Waiting, Resolved, Closed, Archived</li>
        <li>Select multiple statuses to include</li>
      </ul>

      <h3 id="date-filter">Date Filter</h3>
      <ul>
        <li><strong>Presets:</strong> Today, Last 7 days, Last 30 days, Last 90 days</li>
        <li><strong>Custom range:</strong> Pick start and end dates</li>
        <li><strong>Relative:</strong> "Created within the last X days"</li>
      </ul>

      <h3 id="channel-filter">Channel Filter</h3>
      <ul>
        <li>Web, WhatsApp, Telegram, API</li>
        <li>Useful for analyzing channel-specific patterns</li>
      </ul>

      <h3 id="agent-filter">Agent Filter</h3>
      <ul>
        <li>Filter by the human agent assigned to the conversation</li>
        <li>Includes "Unassigned" to find conversations without a human agent</li>
      </ul>

      <h3 id="tag-filter">Tag Filter</h3>
      <ul>
        <li>Filter by one or more tags</li>
        <li>Tags are combinable with AND/OR logic</li>
      </ul>

      <h2 id="exporting">Exporting Search Results</h2>
      <p>
        Export filtered search results for external analysis:
      </p>
      <ul>
        <li><strong>CSV:</strong> Tabular format with conversation metadata and message summaries</li>
        <li><strong>JSON:</strong> Full conversation data including all messages and metadata</li>
        <li><strong>PDF:</strong> Formatted report with conversation history (useful for compliance)</li>
      </ul>

      <h3 id="export-options">Export Options</h3>
      <ul>
        <li><strong>Current view:</strong> Export only the conversations matching your current filters</li>
        <li><strong>All results:</strong> Export all matching conversations (may be large)</li>
        <li><strong>Selected:</strong> Export only the conversations you've manually selected</li>
      </ul>

      <DocCallout variant="tip" icon={Download} title="Large exports">
        Exports with more than 10,000 conversations are processed in the background. You'll receive a download link via email when the export is ready.
      </DocCallout>

      <h2 id="limitations">Search Limitations</h2>
      <p>
        Convio's search has a few known limitations:
      </p>
      <ul>
        <li><strong>Indexing delay:</strong> New messages take up to 2 seconds to appear in search results</li>
        <li><strong>Minimum query length:</strong> Search terms must be at least 2 characters</li>
        <li><strong>No wildcard search:</strong> Prefix/suffix wildcards (*refund) are not supported</li>
        <li><strong>Language support:</strong> Full-text search works best with English content. Other languages use basic tokenization</li>
        <li><strong>Result limit:</strong> Search results are capped at 1,000 conversations per query. Use filters to narrow results</li>
        <li><strong>Archived conversations:</strong> Archived conversations are not included in default search results — use the "Include archived" toggle</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Performance with large datasets">
        If your organization has more than 100,000 conversations, combine search terms with date filters to keep query performance fast.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Filter}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Viewing Conversations"
          href="/docs/viewing-conversations"
        />
        <DocNextStepCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Metadata"
          href="/docs/conversation-metadata"
        />
      </DocCardGrid>
    </DocContent>
  )
}
