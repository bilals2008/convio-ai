import { Shield, Key, AlertTriangle, Lock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhookSecurityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Verifying Webhook Signatures' },
        ]}
        title="Verifying Webhook Signatures"
        description="Ensure every webhook payload is authentic and hasn't been tampered with. HMAC signature verification is required for production use."
      />

      <h2 id="why-verify">Why Verify Signatures?</h2>
      <p>
        Without verification, anyone who discovers your webhook URL can send fake events to your endpoint. Signature verification proves the payload came from Convio and hasn't been modified in transit.
      </p>

      <DocCallout variant="destructive" icon={AlertTriangle} title="Never skip signature verification">
        A webhook endpoint without signature verification is an open door. Attackers can inject fake data, trigger unintended actions, or exfiltrate information from your systems.
      </DocCallout>

      <h2 id="how-it-works">How HMAC Verification Works</h2>
      <ol>
        <li>Convio generates a payload (JSON body of the request)</li>
        <li>Convio computes an HMAC-SHA256 signature using your secret token</li>
        <li>The signature is sent in the <code>X-Convio-Signature</code> header</li>
        <li>Your server receives the request, reads the header, and recomputes the signature</li>
        <li>If the signatures match, the payload is authentic</li>
      </ol>

      <h2 id="implementation">Implementation Examples</h2>

      <h3 id="nodejs">Node.js / Express</h3>
      <pre><code>{`import crypto from 'crypto'

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  )
}

app.post('/webhooks/convio', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-convio-signature']
  const isValid = verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET)

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = JSON.parse(req.body)
  // Process the event...

  res.status(200).json({ received: true })
})`}</code></pre>

      <h3 id="python">Python / FastAPI</h3>
      <pre><code>{`import hmac
import hashlib
from fastapi import Request, HTTPException

async def verify_webhook(request: Request) -> dict:
  signature = request.headers.get("X-Convio-Signature")
  if not signature:
    raise HTTPException(status_code=401, detail="Missing signature")

  body = await request.body()
  expected = hmac.new(
    WEBHOOK_SECRET.encode(),
    body,
    hashlib.sha256
  ).hexdigest()

  if not hmac.compare_digest(signature, expected):
    raise HTTPException(status_code=401, detail="Invalid signature")

  return json.loads(body)`}</code></pre>

      <h3 id="go">Go</h3>
      <pre><code>{`func verifyWebhook(r *http.Request, secret []byte) ([]byte, error) {
  signature := r.Header.Get("X-Convio-Signature")
  body, _ := io.ReadAll(r.Body)

  mac := hmac.New(sha256.New, secret)
  mac.Write(body)
  expected := hex.EncodeToString(mac.Sum(nil))

  if !hmac.Equal([]byte(signature), []byte(expected)) {
    return nil, errors.New("invalid signature")
  }

  return body, nil
}`}</code></pre>

      <h2 id="common-mistakes">Common Mistakes</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="String Comparison"
          description="Never use == or === to compare signatures. Use timing-safe comparison to prevent timing attacks."
          href="#mistake-timing"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Body Parsing Before Verification"
          description="Always verify the signature against the raw body, not a parsed object. JSON serialization can change the string."
          href="#mistake-parsing"
        />
      </DocCardGrid>

      <h3 id="mistake-timing">Timing Attacks</h3>
      <p>
        Standard string comparison (<code>==</code>) short-circuits on the first mismatched character, leaking information about the signature. Always use timing-safe comparison (<code>crypto.timingSafeEqual</code> in Node.js, <code>hmac.compare_digest</code> in Python).
      </p>

      <h3 id="mistake-parsing">Body Parsing Before Verification</h3>
      <p>
        If you parse the JSON body before verifying, the serialized string may differ from the raw bytes Convio signed. Read the raw body, verify against it, then parse.
      </p>

      <DocCallout variant="tip" icon={Lock} title="Store secrets in environment variables">
        Never hardcode webhook secrets in source code. Use environment variables or a secrets manager. Rotate secrets if they're ever exposed.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Webhooks"
          href="/docs/testing-webhooks"
        />
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhook Retry Policy"
          href="/docs/webhook-retry"
        />
      </DocCardGrid>
    </DocContent>
  )
}
