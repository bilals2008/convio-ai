import { AlertTriangle, Globe, Code, Terminal, Shield, RefreshCw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetTroubleshootingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting Widget Issues' },
        ]}
        title="Troubleshooting Widget Issues"
        description="Diagnose and fix common widget problems — loading failures, CORS errors, domain issues, and more."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Most widget issues fall into five categories: script loading, domain restrictions, CORS errors, configuration problems, and browser compatibility. This guide covers each with specific fixes.
      </p>

      <h2 id="widget-not-loading">Widget Not Loading</h2>
      <p>
        If the chat bubble doesn't appear after adding the script:
      </p>

      <h3 id="check-console">Step 1 — Check the Console</h3>
      <p>
        Open your browser's developer console (F12 → Console). Look for error messages. Common errors:
      </p>
      <ul>
        <li><strong>403 Forbidden:</strong> Domain not in the allowed list</li>
        <li><strong>401 Unauthorized:</strong> Invalid or missing public key</li>
        <li><strong>Script not found:</strong> Incorrect <code>src</code> URL</li>
        <li><strong>Network error:</strong> Firewall or ad blocker blocking the request</li>
      </ul>

      <h3 id="verify-script">Step 2 — Verify the Script Tag</h3>
      <p>
        Confirm the script tag has all required attributes:
      </p>
      <pre><code>{`<script
  src="https://cdn.convio.app/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-public-key="YOUR_PUBLIC_KEY"
  async
></script>`}</code></pre>

      <h3 id="check-network">Step 3 — Check the Network Tab</h3>
      <p>
        Open the Network tab in dev tools and refresh the page. Look for the <code>widget.js</code> request. If it's missing or failing, the script isn't loading.
      </p>

      <h2 id="cors-issues">CORS Issues</h2>
      <p>
        CORS errors appear when the widget makes a cross-origin request that the server rejects.
      </p>

      <h3 id="cors-fix">Fix</h3>
      <ol>
        <li>Open your widget settings in the dashboard</li>
        <li>Go to <strong>Security → Allowed Domains</strong></li>
        <li>Add the exact hostname of your site (e.g., <code>example.com</code>)</li>
        <li>Wait 10 seconds for the change to propagate</li>
        <li>Refresh your page</li>
      </ol>

      <DocCallout variant="warning" icon={Shield} title="Common CORS mistakes">
        <ul>
          <li>Forgetting to add the domain entirely</li>
          <li>Adding <code>https://example.com</code> instead of <code>example.com</code></li>
          <li>Adding <code>www.example.com</code> but testing from <code>example.com</code></li>
          <li>Forgetting to add <code>localhost</code> during development</li>
        </ul>
      </DocCallout>

      <h2 id="domain-restrictions">Domain Restrictions</h2>
      <p>
        If the widget loads but shows an error or doesn't initialize:
      </p>
      <ol>
        <li>Verify the domain in the browser's address bar matches exactly what's in the allowed list</li>
        <li>Check for subdomain mismatches: <code>app.example.com</code> ≠ <code>example.com</code></li>
        <li>If using a custom port, include it: <code>localhost:3000</code></li>
        <li>Test from a file:// URL — this is always blocked unless <code>localhost</code> is in the list</li>
      </ol>

      <h2 id="script-placement">Script Placement Errors</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Code}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="In the Head"
          description="Placing the script in <code>&lt;head&gt;</code> can cause the widget to initialize before the DOM is ready, leading to positioning issues."
        />
        <DocFeatureCard
          icon={Code}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Before Body Close"
          description="Place the script before <code>&lt;/body&gt;</code>. The DOM is ready, and the widget initializes correctly."
        />
      </DocCardGrid>

      <h3 id="duplicate-scripts">Duplicate Scripts</h3>
      <p>
        Don't include the widget script twice on the same page. This causes duplicate widgets or JavaScript errors. Check your templates, layout components, and analytics tools for duplicate script injections.
      </p>

      <h2 id="console-errors">Common Console Errors</h2>

      <h3 id="error-uncaught">Uncaught ReferenceError: Convio is not defined</h3>
      <p>
        The widget script hasn't loaded yet. Move the script before <code>&lt;/body&gt;</code> or check for syntax errors in the script tag.
      </p>

      <h3 id="error-network">NetworkError: Failed to fetch</h3>
      <p>
        The widget can't reach Convio's servers. Check your network, firewall, or ad blocker settings. If using a corporate proxy, ensure <code>cdn.convio.app</code> and <code>api.convio.app</code> are whitelisted.
      </p>

      <h3 id="error-invalid-key">Invalid public key</h3>
      <p>
        The <code>data-public-key</code> attribute is missing, empty, or contains an invalid key. Generate a new key from the dashboard.
      </p>

      <h2 id="browser-compatibility">Browser Compatibility</h2>
      <p>
        The widget supports:
      </p>
      <ul>
        <li>Chrome 90+</li>
        <li>Firefox 88+</li>
        <li>Safari 14+</li>
        <li>Edge 90+</li>
        <li>Samsung Internet 15+</li>
      </ul>

      <DocCallout variant="info" icon={RefreshCw} title="Still stuck?">
        Enable debug mode with <code>Convio.setDebug(true)</code> and check the console for detailed logs. If the issue persists, contact support with the debug output.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Allowed Domains"
          href="/docs/allowed-domains"
        />
        <DocNextStepCard
          icon={Terminal}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Your Widget"
          href="/docs/testing-widget"
        />
      </DocCardGrid>
    </DocContent>
  )
}
