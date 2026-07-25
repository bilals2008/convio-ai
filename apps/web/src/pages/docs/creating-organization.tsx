import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Users, Settings } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function CreatingOrganizationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating Your First Organization' },
        ]}
        title="Creating Your First Organization"
        description="Organizations are workspaces where your agents, knowledge bases, and team members live. Every action in Convio happens inside an organization."
      />

      <h2 id="what-are-organizations">What Are Organizations?</h2>
      <p>
        An organization is the top-level container in Convio. It groups together your agents, knowledge bases, deployments, billing, and team members. Think of it as a workspace or team account — similar to how Slack workspaces or GitHub organizations work.
      </p>
      <p>
        Every Convio account belongs to at least one organization. When you first sign up, Convio creates a personal organization for you automatically.
      </p>

      <h2 id="why-you-need-one">Why You Need an Organization</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Building2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Resource Isolation"
          description="Agents, knowledge bases, and data are scoped to an org. Different projects or clients stay separate."
          href="#creating-org"
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Team Collaboration"
          description="Invite members with different roles — Admin, Editor, Viewer — to collaborate on agents and content."
          href="#creating-org"
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Billing & Usage"
          description="Each org has its own billing plan, usage tracking, and provider key configuration."
          href="#creating-org"
        />
      </DocCardGrid>

      <h2 id="creating-org">Creating an Organization</h2>
      <ol>
        <li>Click the <strong>org switcher</strong> in the top-left of the sidebar.</li>
        <li>Select <strong>Create Organization</strong>.</li>
        <li>Enter an <strong>organization name</strong> (e.g., "Acme Corp" or "Personal Projects").</li>
        <li>The <strong>slug</strong> is auto-generated from the name — you can customize it. This becomes part of your URLs and API identifiers.</li>
        <li>Optionally upload a <strong>logo</strong> for branding across the dashboard and shared links.</li>
        <li>Click <strong>Create</strong>.</li>
      </ol>

      <DocCallout variant="tip" icon={Building2} title="Slug Matters">
        The org slug is used in API endpoints and deployment URLs. Choose something short and stable — changing it later updates all associated URLs.
      </DocCallout>

      <h2 id="org-settings">Organization Settings</h2>
      <p>
        After creating your org, you can configure it from <strong>Settings → Organization</strong>:
      </p>

      <h3 id="general-settings">General</h3>
      <ul>
        <li><strong>Name</strong> — The display name shown in the dashboard and to team members.</li>
        <li><strong>Slug</strong> — The URL-safe identifier (e.g., <code>acme-corp</code>).</li>
        <li><strong>Logo</strong> — Upload an image used in the sidebar and shared pages.</li>
      </ul>

      <h3 id="members-settings">Members</h3>
      <ul>
        <li><strong>Invite members</strong> — Send email invitations with a role (Admin, Editor, or Viewer).</li>
        <li><strong>Manage roles</strong> — Change member roles or remove members.</li>
        <li><strong>Pending invites</strong> — View and revoke unaccepted invitations.</li>
      </ul>

      <h3 id="billing-settings">Billing</h3>
      <ul>
        <li><strong>Plan</strong> — View your current plan and upgrade/downgrade.</li>
        <li><strong>Usage</strong> — Track API calls, storage, and active agents.</li>
        <li><strong>Payment method</strong> — Add or update credit card details.</li>
      </ul>

      <h3 id="provider-keys">Provider Keys</h3>
      <p>
        Connect your own AI provider API keys (OpenAI, Anthropic, Google, etc.) at the org level. Agents in this org will use these keys instead of Convio's default keys — giving you full control over usage and billing with your providers.
      </p>

      <h2 id="multi-org">Working with Multiple Organizations</h2>
      <p>
        You can belong to as many organizations as you need. Use the org switcher in the sidebar to move between them. Each org maintains completely separate:
      </p>
      <ul>
        <li>Agents and configurations</li>
        <li>Knowledge bases and documents</li>
        <li>Deployments and channels</li>
        <li>Team members and permissions</li>
        <li>Billing and usage</li>
      </ul>

      <DocCallout variant="info" icon={Users} title="Common Pattern">
        Many teams create separate orgs for development/staging/production, or for different clients in an agency setup.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Your organization is ready. Now take a tour of the dashboard to learn where everything lives.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          to="/docs/dashboard-tour"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Take the dashboard tour <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/vocabulary"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Learn the Convio vocabulary <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocContent>
  )
}
