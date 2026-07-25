import { AlertTriangle, Lock, Mail, Shield, RefreshCw, Key, LogIn, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function LoginIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Login & Auth Issues' },
        ]}
        title="Login & Auth Issues"
        description="Fix authentication problems — session expiration, OAuth failures, email verification, and password reset."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Login issues prevent access to the Convio dashboard. Common causes include expired sessions, OAuth provider failures, unverified email accounts, or broken password reset flows. Most issues resolve with a few verification steps.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Try an incognito/private window to rule out cached session issues</li>
        <li>Check the browser console for authentication-related errors</li>
        <li>Clear cookies for <code>convio.app</code> and retry</li>
        <li>Check if you can access the login page at <code>/login</code></li>
        <li>Verify your email address is correct in the login form</li>
      </ol>

      <h2 id="session-expiration">Session Expiration</h2>
      <p>
        Sessions expire after inactivity or when the session token is invalidated.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Inactivity Timeout"
          description="Sessions expire after 7 days of inactivity. You'll be redirected to the login page automatically."
          href="/docs/login-activity"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Token Revoked"
          description="Sessions are revoked if you log in from another device or change your password. All other sessions are invalidated."
          href="/docs/security"
        />
      </DocCardGrid>

      <h3 id="fix-session">Fix Session Issues</h3>
      <ol>
        <li>Log out and log back in to create a fresh session</li>
        <li>If the login page loops, clear all cookies for <code>convio.app</code></li>
        <li>Disable browser extensions that block cookies (e.g., privacy extensions)</li>
        <li>Check that cookies are enabled in your browser settings</li>
      </ol>

      <h2 id="oauth-failures">OAuth Failures</h2>
      <p>
        OAuth login with Google or GitHub fails during the redirect flow.
      </p>

      <h3 id="common-oauth-errors">Common OAuth Errors</h3>
      <ul>
        <li><strong>Redirect URI mismatch:</strong> The OAuth callback URL doesn't match what's registered in the provider</li>
        <li><strong>Provider unavailable:</strong> Google or GitHub may be experiencing an outage</li>
        <li><strong>Pop-up blocked:</strong> The OAuth pop-up is blocked by the browser — allow pop-ups for <code>convio.app</code></li>
        <li><strong>Access denied:</strong> You denied permission during the OAuth flow — retry and approve</li>
      </ul>

      <DocCallout variant="info" icon={Shield} title="OAuth troubleshooting">
        If OAuth consistently fails, try email/password login instead. This bypasses the OAuth flow entirely. If you don't have a password set, use the password reset flow to create one.
      </DocCallout>

      <h3 id="google-oauth-fix">Google OAuth Fix</h3>
      <ol>
        <li>Ensure you're logged into the correct Google account</li>
        <li>Clear Google cookies if the wrong account is being used</li>
        <li>Check that third-party cookies are enabled for the OAuth redirect</li>
        <li>Try the login in a different browser</li>
      </ol>

      <h2 id="email-verification">Email Verification Issues</h2>
      <p>
        New accounts require email verification before full access is granted.
      </p>

      <h3 id="verification-steps">Verification Steps</h3>
      <ul>
        <li>Check your inbox for the verification email from Convio</li>
        <li>Check spam/junk folders — verification emails are sometimes filtered</li>
        <li>Click the verification link within 24 hours (links expire after 24 hours)</li>
        <li>Request a new verification email from the dashboard if the link expired</li>
      </ul>

      <DocCallout variant="warning" icon={Mail} title="Still no email?">
        Verify the email address is correct during signup. If you used a typo, contact support to update the email address on your account.
      </DocCallout>

      <h2 id="password-reset">Password Reset Problems</h2>
      <p>
        The password reset flow fails or the reset email doesn't arrive.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Reset Email Not Received"
          description="Check spam, verify the email address is correct, and wait 5 minutes. Rate limits apply to reset requests."
          href="/docs/login-issues"
        />
        <DocFeatureCard
          icon={Key}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Reset Link Expired"
          description="Password reset links expire after 1 hour. Request a new one from the login page."
          href="/docs/login-issues"
        />
      </DocCardGrid>

      <h3 id="reset-flow">Password Reset Flow</h3>
      <ol>
        <li>Go to the login page and click <strong>Forgot Password</strong></li>
        <li>Enter your registered email address</li>
        <li>Check your inbox for the reset link</li>
        <li>Click the link and set a new password (minimum 8 characters)</li>
        <li>Log in with the new password</li>
      </ol>

      <DocCallout variant="destructive" icon={AlertTriangle} title="Account locked">
        Too many failed login attempts temporarily lock the account for 15 minutes. Wait and try again, or use the password reset flow to regain access.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Settings"
          href="/docs/security"
        />
        <DocNextStepCard
          icon={LogIn}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="SSO Configuration"
          href="/docs/sso"
        />
      </DocCardGrid>
    </DocContent>
  )
}
