import { Link } from 'react-router-dom'
import { List, Filter, Search, ArrowUpDown, Eye } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ViewingConversationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Viewing Conversations' },
        ]}
        title="Viewing Conversations"
        description="Navigate, filter, and sort conversations to find exactly what you need — whether it's a specific user's thread or all unresolved tickets from today."
      />

      <h2 id="conversation-list">Conversation List</h2>
      <p>
        The Conversations page shows all conversations in your organization. The list displays each conversation's key information at a glance:
      </p>
      <ul>
        <li><strong>Contact name</strong> or identifier (email, phone, or anonymous ID)</li>
        <li><strong>Channel</strong> — web, WhatsApp, Telegram, API</li>
        <li><strong>Status</strong> — Active, Waiting, Resolved, Closed</li>
        <li><strong>Last message preview</strong> — truncated to one line</li>
        <li><strong>Timestamp</strong> — when the last message was sent or received</li>
        <li><strong>Assigned agent</strong> — the human agent handling the conversation (if any)</li>
      </ul>

      <DocCallout variant="tip" icon={Eye} title="Real-time updates">
        The conversation list updates in real time. New messages and status changes appear without refreshing the page.
      </DocCallout>

      <h2 id="filters">Filters</h2>
      <p>
        Use the filter bar at the top of the conversation list to narrow results. Filters combine with AND logic — selecting "Active" status and "WhatsApp" channel shows only active WhatsApp conversations.
      </p>

      <h3 id="status-filter">Status Filter</h3>
      <p>
        Filter by conversation status. Select one or multiple statuses to include:
      </p>
      <ul>
        <li><strong>Active</strong> — conversations with ongoing engagement</li>
        <li><strong>Waiting</strong> — conversations escalated to human agents</li>
        <li><strong>Resolved</strong> — closed conversations still in retention</li>
        <li><strong>Closed</strong> — conversations removed from the active view</li>
      </ul>

      <h3 id="agent-filter">Agent Filter</h3>
      <p>
        Show only conversations assigned to a specific human agent. Useful for workload distribution and individual performance review.
      </p>

      <h3 id="channel-filter">Channel Filter</h3>
      <p>
        Filter by the channel where the conversation originated:
      </p>
      <ul>
        <li>Web Widget</li>
        <li>WhatsApp</li>
        <li>Telegram</li>
        <li>API / Custom</li>
      </ul>

      <h3 id="date-filter">Date Filter</h3>
      <p>
        Filter conversations by creation date or last activity date. Preset options include Today, Last 7 Days, Last 30 Days, and Custom Range.
      </p>

      <h2 id="search">Search</h2>
      <p>
        The search bar performs full-text search across conversation content and metadata. It searches:
      </p>
      <ul>
        <li>Message text (user and agent messages)</li>
        <li>Contact names and email addresses</li>
        <li>Conversation tags and custom metadata</li>
        <li>Agent names</li>
      </ul>

      <DocCallout variant="info" icon={Search} title="Search is indexed">
        Convio indexes conversation content in near real-time. Messages typically appear in search results within 2 seconds of being sent.
      </DocCallout>

      <h2 id="sorting">Sorting Options</h2>
      <p>
        Sort the conversation list by clicking column headers or using the sort dropdown:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Sort By</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Default Order</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Last Activity</td>
              <td className="py-2">Newest first</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Created Date</td>
              <td className="py-2">Newest first</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Message Count</td>
              <td className="py-2">Most messages first</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Token Usage</td>
              <td className="py-2">Highest usage first</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Wait Time</td>
              <td className="py-2">Longest wait first (Waiting status only)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="conversation-detail">Opening a Conversation</h2>
      <p>
        Click any row in the conversation list to open the full conversation view. This shows:
      </p>
      <ul>
        <li>The complete message history in chronological order</li>
        <li>Message metadata — timestamps, token counts, model used</li>
        <li>Conversation metadata — channel, contact info, tags</li>
        <li>Status and assignment controls</li>
        <li>Action buttons — resolve, archive, assign, tag</li>
      </ul>

      <h2 id="bulk-actions">Bulk Actions</h2>
      <p>
        Select multiple conversations using the checkboxes on the left. Bulk actions include:
      </p>
      <ul>
        <li><strong>Resolve:</strong> Close multiple conversations at once</li>
        <li><strong>Archive:</strong> Move selected conversations to the archive</li>
        <li><strong>Assign:</strong> Reassign multiple conversations to a human agent</li>
        <li><strong>Tag:</strong> Add or remove tags from selected conversations</li>
        <li><strong>Export:</strong> Download conversation data as CSV</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={List}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Reading Messages"
          href="/docs/reading-messages"
        />
        <DocNextStepCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Search"
          href="/docs/conversation-search"
        />
      </DocCardGrid>
    </DocContent>
  )
}
