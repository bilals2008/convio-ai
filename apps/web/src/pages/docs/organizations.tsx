import { Link } from 'react-router-dom'
import { Building2, Users, Settings, ArrowRight, Database, Bot, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function OrganizationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Organizations' },
        ]}
        title="Organizations Deep Dive"
        description="Organizations are multi-tenant workspaces that group agents, knowledge bases, members, and settings under one roof. Each org is fully isolated."
      />

      <h2 id="what-are-organizations">What Are Organizations?</h2>
      <p>
        An organization is a workspace that contains everything your team needs: agents, knowledge bases, members, and billing. Every Convio user belongs to at least one organization. If you signed up solo, you already have a personal org.
      </p>
      <p>
        Organizations act as isolation boundaries. Agents in Org A cannot see or access data from Org B. Each org has its own subscription, API keys, and configuration — keeping teams and projects cleanly separated.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Organizations is a Beta feature">
        This feature is currently in beta. Some functionality may change or be incomplete. If you run into issues, please let us know.
      </DocCallout>

      <h2 id="when-to-use-orgs">When to Use Multiple Organizations</h2>
      <p>
        Most users only need one org. Create additional organizations when you need strict separation between projects:
      </p>
      <ul>
        <li><strong>Client work</strong> — keep each client's agents and data in its own org.</li>
        <li><strong>Departments</strong> — separate teams (marketing, support, engineering) with different access levels.</li>
        <li><strong>Personal vs. work</strong> — isolate personal experiments from production workspaces.</li>
      </ul>

      <h2 id="org-settings">Organization Settings</h2>
      <p>
        Each org has configurable settings accessible from the Settings page:
      </p>
      <ul>
        <li><strong>Name</strong> — the display name shown in the dashboard and sidebar.</li>
        <li><strong>Slug</strong> — the URL-safe identifier used in API calls and invite links.</li>
        <li><strong>Logo</strong> — an optional logo displayed in the sidebar and shared conversation pages.</li>
      </ul>

      <DocCallout variant="info" icon={Settings} title="Slug changes are permanent">
        Once set, changing an org slug will break existing embed URLs and API integrations. Choose carefully.
      </DocCallout>

      <h2 id="switching-orgs">Switching Between Organizations</h2>
      <p>
        If you belong to multiple organizations, use the org switcher in the sidebar to move between them. Your active org determines which agents, knowledge bases, and members you see.
      </p>
      <p>
        Your last-used org is remembered across sessions. When you log back in, Convio restores the org you were working in.
      </p>

      <h2 id="org-isolation">What Stays Isolated</h2>
      <DocCardGrid>
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agents"
          description="Each org has its own agents. Agent configs, tool definitions, and system prompts are never shared."
          href="/docs/creating-agent"
        />
        <DocFeatureCard
          icon={Database}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Knowledge Bases"
          description="Documents, URLs, and data sources are scoped to the org. No cross-org data leakage."
          href="/docs/knowledge-bases"
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Members & Roles"
          description="Invitations and role assignments are per-org. A user can be Owner in one org and Viewer in another."
          href="/docs/roles"
        />
      </DocCardGrid>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Organizations are the foundation for team collaboration. Once your org is set up, invite your team and assign roles.
      </p>
      <DocCardGrid columns={2}>
        <DocNextStepCard icon={Users} iconBg="bg-primary/10" iconColor="text-primary" title="Invite team members" href="/docs/inviting-members" />
        <DocNextStepCard icon={Settings} iconBg="bg-info/10" iconColor="text-info" title="Understand roles & permissions" href="/docs/roles" />
      </DocCardGrid>
    </DocContent>
  )
}
