import { Monitor, Globe, Shield, Key, LogOut } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function LoginActivityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Login Activity & Sessions' },
        ]}
        title="Login Activity & Sessions"
        description="Monitor who is accessing your account, review device and location data, and revoke sessions you don't recognize."
      />

      <h2 id="viewing-sessions">Viewing Active Sessions</h2>
      <p>
        Go to <strong>Settings - Security</strong> to see every active session on your account. Each session entry shows:
      </p>
      <ul>
        <li><strong>Device</strong> — browser and operating system (e.g., Chrome on macOS, Safari on iOS).</li>
        <li><strong>IP Address</strong> — the public IP address the session originated from.</li>
        <li><strong>Location</strong> — approximate city and country derived from the IP.</li>
        <li><strong>Last Active</strong> — when the session last made a request.</li>
        <li><strong>Created</strong> — when the session was first established.</li>
      </ul>
      <p>
        Your current session is highlighted. If you see sessions you don't recognize, revoke them immediately.
      </p>

      <h2 id="device-info">Understanding Device Info</h2>
      <p>
        Convio captures basic device metadata to help you identify sessions. We store the browser name, version, and operating system. We do not track screen resolution, installed fonts, or other fingerprinting signals.
      </p>

      <DocCallout variant="info" icon={Globe} title="IP addresses may vary">
        If you use a VPN, your IP address and location may appear different from your actual location. This is expected — check the device info to confirm it's your session.
      </DocCallout>

      <h2 id="revoking-sessions">Revoking Sessions</h2>
      <p>
        To end a session, click <strong>Revoke</strong> next to the session entry. The user logged into that session is immediately signed out and must re-authenticate to regain access.
      </p>
      <p>
        Revoking a session does not affect other sessions. To sign out everywhere, revoke all sessions except your current one.
      </p>

      <DocCallout variant="destructive" icon={LogOut} title="Revoking is instant">
        The session is terminated the next time it makes a request. If the person is actively using Convio, they'll be prompted to log in again within seconds.
      </DocCallout>

      <h2 id="security-tips">Security Tips</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Use a strong password"
          description="Choose a unique password with at least 12 characters. Avoid reusing passwords from other services."
          href="#"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Review sessions regularly"
          description="Check your active sessions at least once a month. Revoke any you don't recognize or no longer need."
          href="#"
        />
        <DocFeatureCard
          icon={Monitor}
          iconBg="bg-info/10"
                  iconColor="text-info"
          title="Sign out on shared devices"
          description="If you used Convio on a shared or public computer, make sure to sign out when you're done."
          href="#"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Watch for unusual locations"
          description="If a session shows a location you haven't been to, it may indicate unauthorized access. Revoke it and change your password."
          href="#"
        />
      </DocCardGrid>

      <h2 id="session-limits">Session Limits</h2>
      <p>
        Convio allows up to <strong>10 concurrent sessions</strong> per account. If you exceed this limit, the oldest session is automatically signed out. This prevents stale sessions from accumulating on devices you no longer use.
      </p>

      <h2 id="api-keys">API Keys and Sessions</h2>
      <p>
        API keys are separate from browser sessions. Revoking a session does not revoke API keys. To manage API keys, go to <strong>Settings - API Keys</strong> and delete the keys you no longer need.
      </p>
    </DocContent>
  )
}
