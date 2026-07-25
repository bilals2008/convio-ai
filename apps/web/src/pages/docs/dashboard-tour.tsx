import { Link } from 'react-router-dom'
import { ArrowRight, LayoutDashboard, Bot, BookOpen, Rocket, MessageSquare, Settings, Building2 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function DashboardTourPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Dashboard Tour' },
        ]}
        title="Dashboard Tour"
        description="Get familiar with the Convio dashboard layout, navigation, and key areas. This page walks you through every section you'll use daily."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Convio dashboard is organized into a sidebar for navigation, a top bar with the org switcher, and a main content area where you build and manage everything. The layout stays consistent across all pages.
      </p>

      <h2 id="sidebar">Sidebar Navigation</h2>
      <p>
        The sidebar on the left is your primary navigation. It stays visible on desktop and collapses into a hamburger menu on mobile. Here's what each item does:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agents"
          description="Create, configure, and manage your AI agents. Each agent has its own system prompt, knowledge base connections, and tool access."
          href="/docs/creating-agent"
        />
        <DocFeatureCard
          icon={BookOpen}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Knowledge"
          description="Upload documents, paste URLs, and manage the knowledge bases that power your agents' responses."
          href="/docs/knowledge-bases"
        />
        <DocFeatureCard
          icon={Rocket}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Deployments"
          description="Connect agents to channels — web widget, WhatsApp, Telegram, Discord, Slack, or API. Manage live deployments from here."
          href="/docs/deployments"
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Conversations"
          description="View and search through all conversations across every deployment. Inspect individual message threads and agent responses."
          href="/docs/conversations"
        />
        <DocFeatureCard
          icon={LayoutDashboard}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Analytics"
          description="Track usage metrics, response times, conversation volumes, and knowledge base hit rates across your org."
          href="/docs/analytics"
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Settings"
          description="Manage your organization, members, billing, provider keys, webhooks, and account preferences."
          href="/docs/settings"
        />
      </DocCardGrid>

      <h2 id="org-switcher">Org Switcher</h2>
      <p>
        Located at the top of the sidebar, the org switcher shows your current organization and lets you:
      </p>
      <ul>
        <li><strong>Switch orgs</strong> — Click to see all organizations you belong to and select one.</li>
        <li><strong>Create org</strong> — Start a new organization from the dropdown.</li>
        <li><strong>Org settings</strong> — Quick access to the current org's settings.</li>
      </ul>

      <DocCallout variant="tip" icon={Building2} title="Context Switching">
        When you switch orgs, the entire dashboard updates — agents, knowledge bases, deployments, and settings all reflect the selected org. Your current org is persisted across sessions.
      </DocCallout>

      <h2 id="quick-stats">Quick Stats Cards</h2>
      <p>
        The dashboard home shows a summary row of stat cards at the top. These give you an at-a-glance view of your org's activity:
      </p>
      <ul>
        <li><strong>Total Agents</strong> — Number of agents in the current org.</li>
        <li><strong>Active Deployments</strong> — How many channel deployments are live.</li>
        <li><strong>Conversations (7d)</strong> — Total conversations in the last 7 days.</li>
        <li><strong>Messages (7d)</strong> — Total messages processed in the last 7 days.</li>
      </ul>
      <p>
        Click any stat card to jump to the relevant section for more detail.
      </p>

      <h2 id="main-content">Main Content Area</h2>
      <p>
        The center of the dashboard is where all the real work happens. The content area updates based on your sidebar selection. Key patterns:
      </p>
      <ul>
        <li><strong>List views</strong> — Agents, knowledge bases, and deployments show as searchable, filterable lists.</li>
        <li><strong>Detail views</strong> — Click any item to open its full configuration page.</li>
        <li><strong>Create flows</strong> — Most sections have a "New" button that opens a creation form or wizard.</li>
      </ul>

      <h2 id="keyboard-shortcuts">Keyboard Shortcuts</h2>
      <p>
        Convio supports keyboard shortcuts for power users:
      </p>
      <ul>
        <li><code>⌘/Ctrl + K</code> — Open the command palette for quick navigation.</li>
        <li><code>⌘/Ctrl + /</code> — Toggle the sidebar on desktop.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        You know your way around the dashboard. Now create your first organization if you haven't already, or jump into building agents.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          to="/docs/creating-organization"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Create an organization <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/vocabulary"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Learn the vocabulary <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocContent>
  )
}
