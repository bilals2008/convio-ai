import { AlertTriangle, Globe, Code, Terminal, Shield, RefreshCw, Bug, ExternalLink } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetNotLoadingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Widget Not Loading' },
        ]}
        title="Widget Not Loading"
        description="Diagnose and fix widget loading failures — CORS errors, domain restrictions, script placement, and browser compatibility."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When the chat widget doesn't appear on your page, the cause usually falls into one of five categories: CORS misconfiguration, domain restrictions, script placement errors, network blocking, or browser compatibility issues. Work through each section below to identify and resolve the problem.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <p>Follow these steps in order to isolate the issue:</p>
      <ol>
        <li>Open your browser's developer console (F12 → Console tab)</li>
        <li>Look for error messages — most widget failures produce visible console errors</li>
        <li>Check the Network tab for failed requests to <code>cdn.convio.app</code> or <code>api.convio.app</code></li>
        <li>Verify the script tag is present in the DOM using the Elements tab</li>
        <li>Test in an incognito/private window to rule out browser extensions</li>
      </ol>

      <DocCallout variant="info" icon={Bug} title="Debug mode">
        Enable verbose logging with <code>Convio.setDebug(true)</code> before the widget loads. This outputs detailed initialization steps to the console, making it easier to pinpoint exactly where loading fails.
      </DocCallout>

      <h2 id="cors-issues">CORS Issues</h2>
      <p>
        Cross-Origin Resource Sharing errors occur when the widget attempts a request from a domain not in the allowed list. The browser blocks the request and logs a CORS policy error.
      </p>

      <h3 id="cors-symptoms">Symptoms</h3>
      <ul>
        <li>Console error: <code>Access to fetch blocked by CORS policy</code></li>
        <li>Network tab shows the request with status <code>blockedbyCORSPolicy</code></li>
        <li>Widget appears briefly then disappears or shows an error state</li>
      </ul>

      <h3 id="cors-fix">Fix</h3>
      <ol>
        <li>Open your widget settings in the Convio dashboard</li>
        <li>Navigate to <strong>Security → Allowed Domains</strong></li>
        <li>Add the exact hostname of your site (e.g., <code>example.com</code>)</li>
        <li>Wait 10 seconds for the configuration to propagate</li>
        <li>Refresh your page</li>
      </ol>

      <DocCallout variant="warning" icon={Shield} title="Common CORS mistakes">
        <ul>
          <li>Adding <code>https://example.com</code> instead of just <code>example.com</code></li>
          <li>Adding <code>www.example.com</code> but testing from <code>example.com</code></li>
          <li>Forgetting to add <code>localhost</code> during local development</li>
          <li>Adding a path or port that doesn't match the actual request origin</li>
        </ul>
      </DocCallout>

      <h2 id="domain-restrictions">Domain Restrictions</h2>
      <p>
        If the widget loads but immediately shows an error or fails to initialize, the domain may not match the allowed list exactly.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Subdomain Mismatch"
          description="<code>app.example.com</code> is different from <code>example.com</code>. Each subdomain must be added separately."
          href="/docs/widget-troubleshooting"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Port Specificity"
          description="Local development on <code>localhost:3000</code> requires adding <code>localhost:3000</code> explicitly."
          href="/docs/widget-troubleshooting"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Protocol Mismatch"
          description="Testing over <code>http://</code> while the allowed list uses <code>https://</code> will fail."
          href="/docs/widget-troubleshooting"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="File Protocol"
          description="Opening HTML files directly via <code>file://</code> is blocked unless <code>localhost</code> is in the allowed list."
          href="/docs/widget-troubleshooting"
        />
      </DocCardGrid>

      <h2 id="script-placement">Script Placement Errors</h2>
      <p>
        Where you place the widget script in your HTML affects whether it loads correctly.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Code}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="In the Head"
          description="Placing the script in <code>&lt;head&gt;</code> can cause the widget to initialize before the DOM is ready, leading to positioning issues or no render."
          href="/docs/widget-troubleshooting"
        />
        <DocFeatureCard
          icon={Code}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Before Body Close"
          description="Place the script just before <code>&lt;/body&gt;</code>. The DOM is ready and the widget initializes correctly."
          href="/docs/widget-troubleshooting"
        />
      </DocCardGrid>

      <h3 id="required-attributes">Required Script Attributes</h3>
      <p>The script tag must include all required attributes:</p>
      <pre><code>{`<script
  src="https://cdn.convio.app/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-public-key="YOUR_PUBLIC_KEY"
  async
></script>`}</code></pre>

      <h3 id="duplicate-scripts">Duplicate Scripts</h3>
      <p>
        Including the widget script twice on the same page causes duplicate widgets or JavaScript errors. Check your templates, layout components, and third-party tools for duplicate injections.
      </p>

      <h2 id="browser-compatibility">Browser Compatibility</h2>
      <p>The widget is supported on the following browsers:</p>
      <ul>
        <li>Chrome 90+</li>
        <li>Firefox 88+</li>
        <li>Safari 14+</li>
        <li>Edge 90+</li>
        <li>Samsung Internet 15+</li>
      </ul>

      <DocCallout variant="destructive" icon={AlertTriangle} title="Unsupported environments">
        Internet Explorer is not supported. If users report issues on older browsers, check the User-Agent header to confirm the browser version.
      </DocCallout>

      <h2 id="network-issues">Network and Firewall Blocking</h2>
      <p>
        Corporate firewalls, ad blockers, or security extensions can prevent the widget script from loading.
      </p>
      <ol>
        <li>Disable browser extensions temporarily to test</li>
        <li>Whitelist <code>cdn.convio.app</code> and <code>api.convio.app</code> in corporate proxies</li>
        <li>Check that Content Security Policy (CSP) headers allow scripts from the Convio CDN</li>
        <li>Verify no firewall rules are blocking outbound HTTPS requests on port 443</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Terminal}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Your Widget"
          href="/docs/testing-widget"
        />
        <DocNextStepCard
          icon={ExternalLink}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Embedding the Widget"
          href="/docs/embedding-script"
        />
      </DocCardGrid>
    </DocContent>
  )
}
