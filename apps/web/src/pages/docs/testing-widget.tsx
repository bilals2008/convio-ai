import { TestTube, Monitor, Smartphone, Terminal, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function TestingWidgetPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Testing Your Widget' },
        ]}
        title="Testing Your Widget"
        description="Verify the widget works correctly across devices, domains, and browsers before going live."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Testing the widget involves three areas: verifying it loads and functions, checking cross-domain behavior, and validating the experience on mobile devices.
      </p>

      <h2 id="demo-page">Widget Demo Page</h2>
      <p>
        Every widget includes a built-in demo page for quick testing. Access it from the dashboard:
      </p>
      <ol>
        <li>Open your widget settings</li>
        <li>Click the <strong>Test</strong> tab</li>
        <li>Click <strong>Open Demo Page</strong></li>
      </ol>
      <p>
        The demo page loads the widget on a blank page with your current configuration. Changes to colors, position, and welcome messages appear here in real time.
      </p>

      <h2 id="cross-domain">Cross-Domain Testing</h2>
      <p>
        If you've configured allowed domains, verify the restrictions work correctly:
      </p>

      <h3 id="allowed-domain-test">Test Allowed Domain</h3>
      <ol>
        <li>Open your website (must be in the allowed domains list)</li>
        <li>Navigate to a page with the widget script</li>
        <li>Verify the chat bubble appears</li>
        <li>Send a test message and confirm the agent responds</li>
      </ol>

      <h3 id="blocked-domain-test">Test Blocked Domain</h3>
      <ol>
        <li>Create a local HTML file with the widget script</li>
        <li>Open it directly in the browser (file:// protocol)</li>
        <li>Check the browser console for a domain restriction error</li>
        <li>The widget should not render</li>
      </ol>

      <DocCallout variant="info" title="CORS errors are expected">
        A CORS error in the console when testing from a blocked domain means the restriction is working. The browser blocks the cross-origin request, and the widget fails to initialize.
      </DocCallout>

      <h2 id="mobile-testing">Mobile Testing</h2>
      <p>
        Test the widget on real mobile devices, not just browser responsive mode:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Smartphone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Touch Interactions"
          description="Verify the chat bubble is tappable, the input field focuses correctly, and the keyboard doesn't overlap the message list."
        />
        <DocFeatureCard
          icon={Monitor}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Viewport Behavior"
          description="Check that the widget adapts to different screen sizes — phones, tablets, and small laptops."
        />
      </DocCardGrid>

      <h3 id="mobile-checklist">Mobile Checklist</h3>
      <ul>
        <li>Chat bubble is visible and tappable</li>
        <li>Keyboard appears when tapping the input field</li>
        <li>Message list scrolls behind the keyboard</li>
        <li>Widget doesn't overlap critical page content</li>
        <li>Back button minimizes the widget (Android)</li>
        <li>Safe area insets respected (iPhone notch)</li>
      </ul>

      <h2 id="debug-console">Debug Console</h2>
      <p>
        The widget logs diagnostic information to the browser console. Enable debug mode to see detailed logs:
      </p>
      <pre><code>{`// Before the widget script loads
window.ConvioConfig = { debug: true };

// Or after load
Convio.setDebug(true);`}</code></pre>

      <h3 id="debug-output">Debug Output</h3>
      <p>
        Debug mode logs:
      </p>
      <ul>
        <li>Script loading and initialization events</li>
        <li>API request and response details</li>
        <li>Domain validation results</li>
        <li>WebSocket connection state</li>
        <li>Error stack traces</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Disable in production">
        Debug mode logs sensitive information (API keys, request payloads). Disable it before deploying to production.
      </DocCallout>

      <h2 id="common-issues">Quick Troubleshooting</h2>
      <ul>
        <li><strong>Bubble not appearing:</strong> Check the console for errors. Verify the script loaded and the domain is allowed.</li>
        <li><strong>Messages not sending:</strong> Verify the public key is correct. Check network tab for failed requests.</li>
        <li><strong>Widget mispositioned:</strong> Inspect the widget container for CSS conflicts. Check z-index values.</li>
        <li><strong>Console errors:</strong> Most errors indicate missing attributes, wrong keys, or domain restrictions.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Troubleshooting"
          href="/docs/widget-troubleshooting"
        />
        <DocNextStepCard
          icon={Terminal}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Analytics"
          href="/docs/widget-analytics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
