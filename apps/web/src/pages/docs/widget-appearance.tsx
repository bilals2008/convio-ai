import { Palette, ArrowRight, AlignLeft, Square, Type, MessageCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetAppearancePage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Widget Appearance' },
        ]}
        title="Customizing Widget Appearance"
        description="Match the widget to your brand with custom colors, positioning, welcome messages, and more."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every visual element of the widget is configurable. You control colors, positioning, dimensions, text, and branding through the dashboard or the JavaScript API.
      </p>

      <h2 id="colors">Color Customization</h2>
      <p>
        The widget accepts three core color values that control its entire palette:
      </p>
      <ul>
        <li><strong>Primary Color:</strong> The accent color for the chat bubble, send button, and links. Default: brand blue.</li>
        <li><strong>Background Color:</strong> The conversation window background. Default: white.</li>
        <li><strong>Text Color:</strong> Message text and labels. Default: dark gray.</li>
      </ul>

      <h3 id="color-format">Color Format</h3>
      <p>
        Colors accept hex values (<code>#FF5733</code>), RGB (<code>rgb(255, 87, 51)</code>), or named CSS colors (<code>blue</code>). Hex is recommended for consistency across platforms.
      </p>

      <DocCallout variant="tip" icon={Palette} title="Contrast matters">
        Ensure sufficient contrast between text and background colors. WCAG AA requires a 4.5:1 ratio for normal text. Low contrast makes the widget hard to read.
      </DocCallout>

      <h2 id="position">Position</h2>
      <p>
        Choose where the chat bubble appears on the page:
      </p>
      <ul>
        <li><strong>Bottom-Right (default):</strong> Standard placement, avoids most navigation elements</li>
        <li><strong>Bottom-Left:</strong> Use when the bottom-right corner is occupied by other elements</li>
      </ul>

      <h3 id="position-offset">Offset</h3>
      <p>
        Set horizontal and vertical offsets to fine-tune placement. Useful when the bubble conflicts with cookie banners, floating action buttons, or sticky headers.
      </p>

      <h2 id="size">Size Adjustments</h2>
      <p>
        Control the dimensions of the expanded conversation window:
      </p>
      <ul>
        <li><strong>Width:</strong> 320px–480px (default: 380px)</li>
        <li><strong>Height:</strong> 400px–600px (default: 520px)</li>
        <li><strong>Chat Bubble Size:</strong> 56px–72px diameter (default: 60px)</li>
      </ul>

      <DocCallout variant="info" icon={Square} title="Responsive behavior">
        On mobile devices, the widget automatically adjusts to full-width or near-full-width. Manual size settings apply only to desktop viewports.
      </DocCallout>

      <h2 id="welcome-message">Welcome Message</h2>
      <p>
        The welcome message is the first thing visitors see when the widget opens. It sets the tone and guides the conversation.
      </p>
      <p>
        Configure:
      </p>
      <ul>
        <li><strong>Text:</strong> The greeting content (e.g., "Hi! How can I help you today?")</li>
        <li><strong>Suggested Replies:</strong> Quick-action buttons below the greeting</li>
        <li><strong>Delay:</strong> How many seconds after page load before the greeting appears</li>
      </ul>

      <h3 id="suggested-replies">Suggested Replies</h3>
      <p>
        Suggested replies are pre-written messages visitors can click to start a conversation. They appear as pill-shaped buttons below the welcome message. Each button sends its text as the visitor's first message.
      </p>
      <p>
        Examples:
      </p>
      <ul>
        <li>"Pricing information"</li>
        <li>"Talk to sales"</li>
        <li>"Technical support"</li>
        <li>"Documentation help"</li>
      </ul>

      <h2 id="branding">Branding Options</h2>
      <p>
        Personalize the widget with your brand identity:
      </p>
      <ul>
        <li><strong>Chat Icon:</strong> Replace the default bubble icon with your logo or custom SVG</li>
        <li><strong>Agent Avatar:</strong> Show an avatar next to agent messages in the conversation</li>
        <li><strong>Header Logo:</strong> Display your brand name or logo in the conversation header</li>
        <li><strong>Footer Text:</strong> Add a custom line at the bottom (e.g., "Powered by Convio")</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Embed with Script Tag"
          href="/docs/embedding-script"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="JavaScript API"
          href="/docs/embedding-javascript"
        />
      </DocCardGrid>
    </DocContent>
  )
}
