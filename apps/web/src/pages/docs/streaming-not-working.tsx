import { AlertTriangle, Radio, Wifi, Monitor, Settings, RefreshCw, Zap, Server } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function StreamingNotWorkingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Streaming Not Working' },
        ]}
        title="Streaming Not Working"
        description="Fix SSE streaming issues — connection failures, browser compatibility, proxy problems, and timeout configuration."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Streaming delivers AI responses token-by-token using Server-Sent Events (SSE). When streaming fails, responses may appear all at once, time out mid-stream, or fail to connect entirely. The issue is usually in the network path between the client and Convio's servers.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Open the Network tab in dev tools and filter by <code>messages</code></li>
        <li>Check if the request shows <strong>EventSource</strong> or <strong>Fetch</strong> streaming type</li>
        <li>Look for HTTP status codes — <code>200</code> with no stream indicates a configuration issue</li>
        <li>Check the Response tab for the raw SSE data</li>
        <li>Test with curl to rule out browser issues: <code>curl -N -H "Accept: text/event-stream" ...</code></li>
      </ol>

      <h2 id="sse-connection-issues">SSE Connection Issues</h2>
      <p>
        The SSE connection fails to establish or drops immediately after connecting.
      </p>

      <h3 id="connection-checklist">Connection Checklist</h3>
      <ul>
        <li>The <code>Accept: text/event-stream</code> header is present in the request</li>
        <li>The <code>Cache-Control: no-cache</code> header is set</li>
        <li>The connection isn't being upgraded to WebSocket (some proxies do this)</li>
        <li>The response doesn't include <code>Content-Encoding: gzip</code> (SSE doesn't support compression)</li>
        <li>The server is returning a <code>200</code> status with the correct content type</li>
      </ul>

      <DocCallout variant="info" icon={Radio} title="Test the raw stream">
        Use <code>curl -N</code> to test the streaming endpoint directly. This bypasses browsers, proxies, and JavaScript. If curl shows tokens flowing, the issue is client-side.
      </DocCallout>

      <h2 id="browser-compatibility">Browser Compatibility</h2>
      <p>
        Streaming APIs have different support levels across browsers.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Monitor}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Supported"
          description="Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. All modern browsers support Fetch streaming."
          href="/docs/streaming-api"
        />
        <DocFeatureCard
          icon={Monitor}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Not Supported"
          description="IE11, older Safari versions, and some mobile browsers don't support Fetch streaming. Fall back to polling."
          href="/docs/streaming-api"
        />
      </DocCardGrid>

      <h3 id="polyfill">EventSource Polyfill</h3>
      <p>
        If you need to support older browsers, use a polyfill like <code>event-source-polyfill</code> or fall back to the non-streaming API. Convio automatically falls back if streaming fails.
      </p>

      <h2 id="proxy-lb-issues">Proxy and Load Balancer Issues</h2>
      <p>
        Corporate proxies, CDNs, and load balancers can interfere with SSE connections.
      </p>

      <h3 id="common-proxy-problems">Common Proxy Problems</h3>
      <ul>
        <li><strong>Response buffering:</strong> The proxy buffers the entire response before forwarding. Add <code>X-Accel-Buffering: no</code> header for Nginx.</li>
        <li><strong>Connection keep-alive:</strong> Some proxies close idle connections. Set the <code>Connection: keep-alive</code> header.</li>
        <li><strong>Compression:</strong> Proxies may gzip SSE responses, breaking the stream. Disable compression for streaming endpoints.</li>
        <li><strong>Timeout settings:</strong> Proxy read timeouts shorter than the stream duration cause premature disconnection.</li>
      </ul>

      <DocCallout variant="warning" icon={Server} title="Nginx configuration">
        If using Nginx as a reverse proxy, add these directives to your location block: <code>proxy_buffering off</code>, <code>proxy_cache off</code>, <code>chunked_transfer_encoding on</code>.
      </DocCallout>

      <h2 id="timeout-settings">Timeout Settings</h2>
      <p>
        Streaming requests can take longer than standard HTTP requests. Default timeouts may be too short.
      </p>
      <ul>
        <li><strong>Client timeout:</strong> Increase the fetch timeout to at least 120 seconds for streaming</li>
        <li><strong>Proxy timeout:</strong> Set proxy read timeout to 120+ seconds</li>
        <li><strong>Server timeout:</strong> Convio's streaming endpoint allows up to 300 seconds</li>
      </ul>

      <h3 id="timeout-code">Client-Side Timeout Example</h3>
      <pre><code>{`const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120000);

const response = await fetch(url, {
  signal: controller.signal,
  headers: {
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  }
});

clearTimeout(timeout);`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming API Reference"
          href="/docs/streaming-api"
        />
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Message Streaming"
          href="/docs/message-streaming"
        />
      </DocCardGrid>
    </DocContent>
  )
}
