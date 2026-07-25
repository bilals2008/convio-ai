import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Shield, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function CreatingAccountPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating an Account' },
        ]}
        title="Creating an Account"
        description="Get started with Convio by creating your account. Sign up with email or use Google OAuth for one-click access."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio supports two sign-up methods: traditional email/password and Google OAuth. Both give you full access to the platform. Your account is the top-level identity — you can belong to multiple organizations under one account.
      </p>

      <h2 id="sign-up-with-email">Sign Up with Email</h2>
      <p>
        The fastest way to get started. Enter your email and password on the sign-up page.
      </p>
      <ol>
        <li>Navigate to <code>/auth/signup</code> or click <strong>Get Started</strong> on the homepage.</li>
        <li>Enter your full name, email address, and a password (minimum 8 characters).</li>
        <li>Click <strong>Create Account</strong>.</li>
        <li>Check your inbox for a verification email and click the link to confirm your account.</li>
      </ol>

      <DocCallout variant="info" icon={Mail} title="Email Verification">
        You must verify your email before accessing the dashboard. The verification link expires after 24 hours. If you don't see the email, check your spam folder.
      </DocCallout>

      <h2 id="sign-up-with-google">Sign Up with Google</h2>
      <p>
        Use your existing Google account for instant access — no password to remember.
      </p>
      <ol>
        <li>Click <strong>Continue with Google</strong> on the sign-up page.</li>
        <li>Select the Google account you want to use.</li>
        <li>Authorize Convio to access your name and email.</li>
        <li>You're redirected to the dashboard — no email verification needed.</li>
      </ol>

      <DocCallout variant="tip" icon={Shield} title="OAuth Accounts">
        Google OAuth accounts are automatically verified. You can still set a password later in Settings → Security to enable email/password login as a backup.
      </DocCallout>

      <h2 id="after-signup">What Happens After Sign Up</h2>
      <p>
        Once your account is created and verified, you'll land on the dashboard. Here's what's ready for you immediately:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Default Organization"
          description="Convio creates a personal organization for you automatically. You can rename or delete it later."
          href="/docs/creating-organization"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Free Tier Access"
          description="Start building agents immediately with the free tier — no credit card required."
          href="/docs/what-is-convio"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Invite Team Members"
          description="Go to Settings → Members to invite colleagues to your organization."
          href="/docs/creating-organization"
        />
      </DocCardGrid>

      <h2 id="account-settings">Account Settings</h2>
      <p>
        After signing up, you can manage your account from <strong>Settings → Profile</strong>:
      </p>
      <ul>
        <li><strong>Name</strong> — Update your display name across all organizations.</li>
        <li><strong>Email</strong> — Change your login email (requires re-verification).</li>
        <li><strong>Password</strong> — Set or reset your password.</li>
        <li><strong>Two-Factor Authentication</strong> — Enable TOTP-based 2FA for extra security.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Your account is set up. Now create your first organization to start collaborating.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          to="/docs/creating-organization"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Create your first organization <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/dashboard-tour"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Take the dashboard tour <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocContent>
  )
}
