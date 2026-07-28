import { Shield, Globe, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function AllowedDomainsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Allowed Domains' },
        ]}
        title="Configuring Allowed Domains"
        description="Restrict which websites can embed your widget. Prevent unauthorized usage on domains you don't control."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Allowed domains restrict where your widget can be embedded. If a website not in your list tries to load the widget, it's blocked. This prevents unauthorized embedding and protects your API quota.
      </p>

      <h2 id="how-it-works">How Domain Restrictions Work</h2>
      <p>
        When the widget script loads on a page, it sends the page's hostname to Convio's servers. Convio checks the hostname against your allowed domains list. If the hostname isn't on the list, the widget refuses to initialize.
      </p>
      <ul>
        <li>The check happens server-side — the widget script won't render on unauthorized domains</li>
        <li>Subdomains are not automatically included: <code>example.com</code> does not include <code>app.example.com</code></li>
        <li>Each entry must be added explicitly</li>
      </ul>

      <h2 id="domain-format">Domain Format Rules</h2>
      <p>
        Follow these rules when adding domains:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Valid Formats"
          description="example.com, app.example.com, docs.example.com, localhost"
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Invalid Formats"
          description="No wildcards (*.example.com), no protocols (https://), no paths, no ports"
        />
      </DocCardGrid>

      <h2 id="adding-domains">Adding Allowed Domains</h2>
      <ol>
        <li>Open your widget settings in the dashboard</li>
        <li>Navigate to the <strong>Security</strong> tab</li>
        <li>In the <strong>Allowed Domains</strong> section, click <strong>Add Domain</strong></li>
        <li>Enter the hostname (e.g., <code>example.com</code>)</li>
        <li>Click <strong>Save</strong></li>
      </ol>

      <h2 id="cors">CORS Configuration</h2>
      <p>
        Convio's API uses CORS to enforce domain restrictions at the network level. The widget makes cross-origin requests to Convio's servers, which check the <code>Origin</code> header against your allowed domains.
      </p>
      <DocCallout variant="info" title="CORS headers">
        If you see CORS errors in the browser console, it usually means the domain isn't in the allowed list. Add the domain and wait a few seconds for the change to propagate.
      </DocCallout>

      <h2 id="development">Development Domains</h2>
      <p>
        Add <code>localhost</code> to test the widget during development. You can also add specific ports: <code>localhost:3000</code>.
      </p>
      <DocCallout variant="warning" icon={AlertTriangle} title="Remove localhost before production">
        Don't leave localhost in the allowed list for production widgets. It allows any local development server to embed your widget.
      </DocCallout>

      <h2 id="testing">Testing Domain Restrictions</h2>
      <p>
        Verify your domain restrictions work:
      </p>
      <ol>
        <li>Create a simple HTML file and open it locally (not served from your allowed domains)</li>
        <li>Paste the widget embed script</li>
        <li>Open the browser console — you should see an error indicating the domain is not allowed</li>
        <li>The widget should not render</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Embed on Your Site"
          href="/docs/embedding-script"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Security"
          href="/docs/widget-troubleshooting"
        />
      </DocCardGrid>
    </DocContent>
  )
}
