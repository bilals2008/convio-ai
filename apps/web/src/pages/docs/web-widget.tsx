import { Link } from 'react-router-dom'
import { Globe, MessageCircle, Maximize2, Palette, Shield, BarChart3 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebWidgetPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Web Widget' },
        ]}
        title="What is the Web Widget?"
        description="Add an AI-powered chat widget to any website with a single script tag. Visitors get instant support without leaving your page."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Convio Web Widget is a embeddable chat component that connects your website visitors directly to your AI agents. It renders as a floating chat bubble that expands into a full conversation window — no page navigation required.
      </p>

      <h2 id="capabilities">Widget Capabilities</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Real-time Chat"
          description="Instant message delivery with typing indicators. Visitors see responses streaming in as the agent generates them."
          href="#interactions"
        />
        <DocFeatureCard
          icon={Maximize2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Expandable Window"
          description="A compact bubble that expands into a full chat interface. Resizable, draggable, and responsive on all screen sizes."
          href="#interactions"
        />
        <DocFeatureCard
          icon={Palette}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Fully Customizable"
          description="Match your brand with custom colors, positioning, welcome messages, and logo. Every visual element is configurable."
          href="#customization"
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Domain Restricted"
          description="Restrict widget usage to specific domains. Prevent unauthorized embedding on sites you don't control."
          href="/docs/allowed-domains"
        />
      </DocCardGrid>

      <h2 id="interactions">How Visitors Interact</h2>
      <p>
        The widget appears as a circular chat bubble in the corner of your website. When a visitor clicks it, the bubble expands into a conversation panel. The visitor can:
      </p>
      <ul>
        <li>Send messages and receive AI-generated responses in real time</li>
        <li>See typing indicators while the agent processes their query</li>
        <li>Minimize the widget without losing conversation history</li>
        <li>Receive suggested reply buttons for quick navigation</li>
        <li>Upload files or images if the agent supports attachments</li>
      </ul>

      <h2 id="chat-bubble">Chat Bubble Behavior</h2>
      <p>
        The chat bubble is the entry point for all conversations. It renders in the bottom-right corner by default (configurable to bottom-left). Key behaviors:
      </p>
      <ul>
        <li><strong>Closed state:</strong> Displays your brand icon or a default chat icon</li>
        <li><strong>Hover:</strong> Shows a tooltip with the greeting message</li>
        <li><strong>Open state:</strong> Transforms into the full conversation window</li>
        <li><strong>Unread badge:</strong> Shows a count when the agent sends a message while minimized</li>
      </ul>

      <h2 id="customization">Customization Options</h2>
      <p>
        The widget's appearance and behavior are fully configurable through the dashboard or the JavaScript API:
      </p>
      <ul>
        <li><strong>Colors:</strong> Primary accent, background, text, and border colors</li>
        <li><strong>Position:</strong> Bottom-right or bottom-left placement</li>
        <li><strong>Size:</strong> Width and height of the expanded conversation window</li>
        <li><strong>Welcome message:</strong> First message shown when a conversation starts</li>
        <li><strong>Suggested replies:</strong> Quick-action buttons alongside the welcome message</li>
        <li><strong>Branding:</strong> Custom logo, chat icon, and agent avatar</li>
      </ul>

      <DocCallout variant="info" title="Zero dependencies">
        The widget is a self-contained script. It doesn't require React, jQuery, or any other library on the host page. Drop the snippet into any HTML document and it works.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={3}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create a Widget"
          href="/docs/creating-widget"
        />
        <DocNextStepCard
          icon={Palette}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Customize Appearance"
          href="/docs/widget-appearance"
        />
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Analytics"
          href="/docs/widget-analytics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
