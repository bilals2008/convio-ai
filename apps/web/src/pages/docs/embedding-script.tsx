import { Code, FileCode, AlertTriangle, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function EmbeddingScriptPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Embedding with Script Tag' },
        ]}
        title="Embedding with a Script Tag"
        description="The simplest way to add the widget to your site — paste one snippet and it works."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The script tag method is the recommended way to embed the Convio widget. It's a single <code>&lt;script&gt;</code> tag that loads the widget asynchronously and renders it on the page.
      </p>

      <h2 id="embed-snippet">The Embed Snippet</h2>
      <p>
        Copy this snippet and paste it before the closing <code>&lt;/body&gt;</code> tag of your HTML:
      </p>
      <pre><code>{`<script
  src="https://cdn.convio.app/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-public-key="YOUR_PUBLIC_KEY"
  async
></script>`}</code></pre>

      <h3 id="attributes">Script Attributes</h3>
      <ul>
        <li><code>src</code> — The CDN URL for the widget script. Always use the full URL.</li>
        <li><code>data-widget-id</code> — Your widget's unique identifier. Found in the dashboard under widget settings.</li>
        <li><code>data-public-key</code> — Your widget's public API key. Generated during widget creation.</li>
        <li><code>async</code> — Loads the script without blocking page rendering.</li>
      </ul>

      <DocCallout variant="tip" icon={Code} title="Script placement">
        Place the snippet before <code>&lt;/body&gt;</code>, not in <code>&lt;head&gt;</code>. This ensures the DOM is ready when the widget initializes and prevents layout shifts.
      </DocCallout>

      <h2 id="html-placement">HTML Placement</h2>
      <p>
        The script can go anywhere in the <code>&lt;body&gt;</code>, but best practice is near the end:
      </p>
      <pre><code>{`<body>
  <!-- Your page content -->

  <script
    src="https://cdn.convio.app/widget.js"
    data-widget-id="abc123"
    data-public-key="pk_live_xyz"
    async
  ></script>
</body>`}</code></pre>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't place in head">
        Placing the script in <code>&lt;head&gt;</code> can cause the widget to initialize before the page renders, leading to positioning issues or FOUC (flash of unstyled content).
      </DocCallout>

      <h2 id="async-loading">Async Loading</h2>
      <p>
        The <code>async</code> attribute ensures the widget script loads in parallel with other page resources. This means:
      </p>
      <ul>
        <li>The page doesn't wait for the widget script to load</li>
        <li>The widget initializes as soon as the script is ready</li>
        <li>Page load performance is unaffected</li>
      </ul>

      <h3 id="loading-states">Loading States</h3>
      <p>
        The widget goes through these states during load:
      </p>
      <ol>
        <li><strong>Queued:</strong> Script is downloading</li>
        <li><strong>Initializing:</strong> Script is setting up the widget DOM</li>
        <li><strong>Ready:</strong> Chat bubble is visible and interactive</li>
      </ol>

      <h2 id="multiple-pages">Multiple Pages</h2>
      <p>
        Add the same snippet to every page where you want the widget. The widget maintains conversation state across page navigations using browser storage — visitors don't lose their conversation when moving between pages.
      </p>

      <h2 id="spa">Single-Page Applications</h2>
      <p>
        For SPAs (React, Vue, Next.js), add the script to your root HTML template or inject it dynamically. The widget persists across route changes if the page doesn't fully reload.
      </p>

      <h2 id="verification">Verifying the Installation</h2>
      <p>
        After adding the script:
      </p>
      <ol>
        <li>Open your page in a browser</li>
        <li>Check the browser console for errors</li>
        <li>Look for the chat bubble in the configured position</li>
        <li>Click the bubble and send a test message</li>
      </ol>

      <DocCallout variant="info" icon={CheckCircle} title="No errors? It's working.">
        If you see the chat bubble and can send a message, the widget is properly embedded. If not, see <DocNextStepCard icon={AlertTriangle} iconBg="bg-primary/10" iconColor="text-primary" title="Troubleshooting" href="/docs/widget-troubleshooting" />.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileCode}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="JavaScript API"
          href="/docs/embedding-javascript"
        />
        <DocNextStepCard
          icon={Code}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Public API"
          href="/docs/widget-public-api"
        />
      </DocCardGrid>
    </DocContent>
  )
}
