import { Key, Shield, Users, RefreshCw, Lock, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SsoPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'SSO / Single Sign-On' },
        ]}
        title="SSO / Single Sign-On"
        description="Authenticate users through your identity provider with SAML or OIDC."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Single Sign-On (SSO) lets your team authenticate using your organization's identity provider instead of separate Convio credentials. Users log in with the same credentials they use for other corporate applications, centralizing access control and simplifying offboarding.
      </p>

      <h2 id="protocols">Supported Protocols</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="SAML 2.0"
          description="Enterprise standard for SSO. Supported by Azure AD, Okta, OneLogin, PingFederate, and most enterprise identity providers."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="OpenID Connect (OIDC)"
          description="Modern protocol built on OAuth 2.0. Supported by Google Workspace, Auth0, and most cloud identity providers."
        />
      </DocCardGrid>

      <h2 id="saml-setup">SAML Setup</h2>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Security</strong> → <strong>SSO</strong>.</li>
        <li>Select <strong>SAML 2.0</strong> as the protocol.</li>
        <li>Enter your Identity Provider's metadata URL or upload the metadata XML file.</li>
        <li>Convio will automatically extract the SSO URL, certificate, and entity ID.</li>
        <li>Configure your identity provider with Convio's SP metadata (available on the SSO settings page).</li>
        <li>Test the connection with <strong>Test SSO Login</strong>.</li>
      </ol>

      <h2 id="oidc-setup">OIDC Setup</h2>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Security</strong> → <strong>SSO</strong>.</li>
        <li>Select <strong>OpenID Connect</strong> as the protocol.</li>
        <li>Enter your identity provider's discovery URL (e.g., <code>https://accounts.google.com/.well-known/openid-configuration</code>).</li>
        <li>Enter the Client ID and Client Secret from your identity provider.</li>
        <li>Configure the callback URL in your identity provider's application settings.</li>
        <li>Test the connection.</li>
      </ol>

      <h2 id="jit">Just-in-Time Provisioning</h2>
      <p>
        When SSO is enabled, Convio can automatically create user accounts when team members log in for the first time:
      </p>
      <ul>
        <li>New users are provisioned with the <strong>Member</strong> role by default.</li>
        <li>User information (name, email) is synced from the identity provider on each login.</li>
        <li>When a user is removed from the identity provider, their Convio access is revoked on next login attempt.</li>
      </ul>

      <DocCallout variant="tip" icon={Users} title="Configure default role">
        Set the default role for JIT-provisioned users in SSO settings. Choose between Member (limited access) and Admin (full access) based on your team's needs.
      </DocCallout>

      <h2 id="vs-password">SSO vs Password Auth</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Feature</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">SSO</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Password Auth</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Centralized control</td>
              <td className="py-2">Yes — manage access from your IdP</td>
              <td className="py-2">No — each user manages their own credentials</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Offboarding</td>
              <td className="py-2">Immediate — remove from IdP</td>
              <td className="py-2">Manual — revoke access in Convio</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">MFA</td>
              <td className="py-2">Handled by IdP</td>
              <td className="py-2">Not available</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Setup complexity</td>
              <td className="py-2">Requires IdP configuration</td>
              <td className="py-2">Zero configuration</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Best for</td>
              <td className="py-2">Teams of 10+ or regulated industries</td>
              <td className="py-2">Small teams, quick onboarding</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="warning" icon={AlertTriangle} title="Enforcing SSO">
        When SSO is enabled, password login is disabled for your organization. All members must authenticate through the identity provider. Ensure SSO is fully configured and tested before enforcing.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Overview"
          href="/docs/security"
        />
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Members"
          href="/docs/managing-members"
        />
      </DocCardGrid>
    </DocContent>
  )
}
