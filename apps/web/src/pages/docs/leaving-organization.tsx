import { LogOut, AlertTriangle, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function LeavingOrganizationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Leaving an Organization' },
        ]}
        title="Leaving an Organization"
        description="Remove yourself from an organization you no longer need access to. This action is voluntary and requires confirmation."
      />

      <h2 id="overview">Overview</h2>
      <p>
        If you no longer need access to an organization, you can leave it from the Members page. Once you leave, you lose all access to that org's agents, knowledge bases, and conversations.
      </p>

      <h2 id="how-to-leave">How to Leave</h2>
      <ol>
        <li>Open <strong>Settings - Members</strong> in the org you want to leave.</li>
        <li>Find your own name in the member list.</li>
        <li>Click the actions menu and select <strong>Leave Organization</strong>.</li>
        <li>Confirm by typing the organization name.</li>
      </ol>
      <p>
        Your membership is removed immediately. The sidebar switches to your personal org or your next most recently used org.
      </p>

      <DocCallout variant="destructive" icon={AlertTriangle} title="You cannot undo this">
        Once you leave, you must be re-invited to regain access. Your role and any pending work in the org are lost.
      </DocCallout>

      <h2 id="restrictions">When You Cannot Leave</h2>
      <p>
        You cannot leave an organization if you are its <strong>sole Owner</strong>. The org must have at least one Owner at all times. To leave, either transfer ownership first or promote another member to Owner.
      </p>
      <p>
        If you're the only member, you cannot leave — you must delete the org instead.
      </p>

      <h2 id="access-after-leaving">What Happens to Your Access</h2>
      <ul>
        <li><strong>Immediate</strong> — you can no longer open the org in the sidebar.</li>
        <li><strong>API keys</strong> — any API keys you generated for the org stop working.</li>
        <li><strong>Embeds</strong> — web widgets and channel integrations you set up remain active (they belong to the org, not you).</li>
        <li><strong>Conversations</strong> — conversations you started stay in the org and are visible to remaining members.</li>
      </ul>

      <h2 id="data-access">Data Access After Leaving</h2>
      <p>
        You retain access to any data you exported or downloaded before leaving. However, you cannot access the org's data through Convio after your membership ends.
      </p>
      <p>
        If you need data from the org after leaving, ask the Owner or an Admin to export it for you before you go.
      </p>

      <DocCallout variant="tip" icon={Shield} title="Tip: export first">
        Before leaving, export any conversation logs, agent configs, or documents you want to keep. Once you leave, there is no way to retrieve this data without being re-invited.
      </DocCallout>
    </DocContent>
  )
}
