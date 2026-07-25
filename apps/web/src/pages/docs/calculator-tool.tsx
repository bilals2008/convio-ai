import { Calculator, Plus, Minus, AlertCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function CalculatorToolPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Calculator Tool' },
        ]}
        title="Calculator Tool"
        description="Evaluate mathematical expressions directly in conversation — no external tools needed."
      />

      <h2 id="how-it-works">How It Works</h2>
      <p>
        The calculator tool evaluates mathematical expressions and returns the result. The model generates a valid expression based on the user's question, and Convio computes the answer instantly.
      </p>
      <p>
        This is especially useful for pricing calculations, unit conversions, statistical queries, and any scenario where precision matters more than the model's approximate math abilities.
      </p>

      <h2 id="supported-operations">Supported Operations</h2>
      <ul>
        <li><strong>Basic arithmetic:</strong> <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code></li>
        <li><strong>Exponents:</strong> <code>^</code> (e.g., <code>2^10</code> = 1024)</li>
        <li><strong>Modulo:</strong> <code>%</code> (e.g., <code>10 % 3</code> = 1)</li>
        <li><strong>Parentheses:</strong> <code>(</code> and <code>)</code> for grouping</li>
        <li><strong>Decimal numbers:</strong> <code>3.14</code>, <code>0.5</code>, etc.</li>
      </ul>

      <h2 id="examples">Examples</h2>
      <ul>
        <li><code>(50 * 12) + (30 * 12)</code> → <strong>960</strong></li>
        <li><code>1500 * 0.25</code> → <strong>375</strong></li>
        <li><code>2^8</code> → <strong>256</strong></li>
        <li><code>100 / 3</code> → <strong>33.3333...</strong></li>
        <li><code>(987654 * 0.15) / 12</code> → <strong>12345.675</strong></li>
      </ul>

      <h2 id="use-cases">Use Cases</h2>
      <ul>
        <li><strong>Pricing calculations:</strong> "If 150 units cost $12 each with a 15% discount, what's the total?"</li>
        <li><strong>Data analysis:</strong> "What's the percentage increase from 450 to 675?"</li>
        <li><strong>Budget planning:</strong> "Split $45,000 across 12 months with 5% annual increase"</li>
        <li><strong>Unit conversions:</strong> "Convert 72 inches to centimeters" (72 * 2.54)</li>
        <li><strong>Tax calculations:</strong> "What's 8.5% tax on $249.99?"</li>
      </ul>

      <DocCallout variant="tip" icon={Calculator} title="Precision matters">
        LLMs are notoriously bad at math. The calculator tool eliminates hallucinated arithmetic. Always enable it for agents that handle pricing, finance, or numerical data.
      </DocCallout>

      <h2 id="limitations">Limitations</h2>
      <ul>
        <li>Only supports scalar arithmetic — no matrices, vectors, or symbolic math</li>
        <li>Expressions must be valid — syntax errors return an error message</li>
        <li>No support for functions like <code>sin()</code>, <code>log()</code>, or <code>sqrt()</code></li>
        <li>Maximum expression length: 500 characters</li>
      </ul>

      <DocCallout variant="warning" icon={AlertCircle} title="No rate limits">
        The calculator tool has no usage limits. It runs locally and doesn't call any external API.
      </DocCallout>

      <h2 id="enabling">Enabling the Calculator</h2>
      <ol>
        <li>Open your agent's settings</li>
        <li>In the <strong>Tools</strong> section, toggle <strong>Calculator</strong> on</li>
        <li>Save the agent</li>
      </ol>
    </DocContent>
  )
}
