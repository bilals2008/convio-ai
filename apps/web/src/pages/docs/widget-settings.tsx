import { Settings, Clock, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetSettingsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Widget Settings' },
        ]}
        title="Widget Conversation Settings"
        description="Control when the widget opens, how it behaves on mobile, and what happens when your agent is offline."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Widget settings control the conversation lifecycle — from the moment a visitor lands on your page to how they interact with the agent. These settings are independent of the agent's behavior.
      </p>

      <h2 id="auto-open">Auto-Open Behavior</h2>
      <p>
        Auto-open determines whether the chat window opens automatically when a visitor loads the page.
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Disabled (Default)"
          description="The widget shows only the chat bubble. Visitors must click to open. Best for sites where chat is a secondary feature."
        />
        <DocFeatureCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Enabled"
          description="The widget opens automatically on page load. Use for support-focused pages where you want to engage visitors immediately."
        />
      </DocCardGrid>

      <h3 id="auto-open-delay">Auto-Open Delay</h3>
      <p>
        When auto-open is enabled, set a delay (in seconds) before the widget opens. This prevents the widget from interrupting visitors who are still reading the page.
      </p>
      <ul>
        <li><strong>0 seconds:</strong> Opens immediately on page load</li>
        <li><strong>3–5 seconds:</strong> Gives visitors time to orient before the widget appears</li>
        <li><strong>10+ seconds:</strong> Engages only visitors who've been on the page for a while</li>
      </ul>

      <h2 id="greeting-delay">Greeting Delay Timing</h2>
      <p>
        The greeting delay controls when the welcome message appears inside the widget. This is separate from auto-open — the widget can be open before the greeting shows.
      </p>
      <ul>
        <li><strong>0 seconds:</strong> Greeting appears as soon as the widget opens</li>
        <li><strong>1–2 seconds:</strong> Brief pause before the greeting, feels natural</li>
        <li><strong>5+ seconds:</strong> Visitor explores first, greeting appears as a prompt</li>
      </ul>

      <DocCallout variant="tip" icon={Clock} title="Combine delays">
        Use auto-open delay + greeting delay together. For example: auto-open after 5 seconds, then show the greeting 2 seconds later. This creates a non-intrusive engagement flow.
      </DocCallout>

      <h2 id="mobile-settings">Mobile-Specific Settings</h2>
      <p>
        The widget adapts to mobile viewports automatically, but you can override specific behaviors:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Smartphone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Full-Width Mode"
          description="On mobile, the widget opens at near-full width for easier reading. Disable this to keep the desktop dimensions."
        />
        <DocFeatureCard
          icon={Smartphone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Push Content Down"
          description="When the widget opens on mobile, push page content down instead of overlaying it. Useful for single-column layouts."
        />
      </DocCardGrid>

      <h3 id="mobile-position">Mobile Position Override</h3>
      <p>
        Mobile viewports can use a different position than desktop. For example, keep the widget in the bottom-right on desktop but center it at the bottom on mobile for easier thumb access.
      </p>

      <h2 id="offline-behavior">Offline Behavior</h2>
      <p>
        When your agent is unreachable or the API is down, the widget handles the situation gracefully:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WifiOff}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Show Offline Message"
          description="Display a configurable message like 'We're currently offline. Leave your email and we'll get back to you.'"
        />
        <DocFeatureCard
          icon={Wifi}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Queue Messages"
          description="Allow visitors to send messages while offline. Messages are delivered when the agent comes back online."
        />
      </DocCardGrid>

      <h3 id="offline-form">Offline Contact Form</h3>
      <p>
        When offline behavior is enabled, the widget can display a contact form collecting:
      </p>
      <ul>
        <li>Email address (required)</li>
        <li>Name (optional)</li>
        <li>Message (required)</li>
      </ul>
      <p>
        Submissions are stored in the dashboard under <strong>Leads</strong> and can be exported as CSV.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Appearance"
          href="/docs/widget-appearance"
        />
        <DocNextStepCard
          icon={Smartphone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Test Your Widget"
          href="/docs/testing-widget"
        />
      </DocCardGrid>
    </DocContent>
  )
}
