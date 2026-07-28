import { Puzzle, Code, FileJson, TestTube, AlertCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function CustomToolsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Custom Tools' },
        ]}
        title="Creating Custom Tools"
        description="Define your own tools using JSON Schema to connect agents to any API, database, or internal system."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Custom tools extend your agent beyond the built-in options. Define a function with a name, description, and parameter schema — then point it at any HTTP endpoint. The model learns what the tool does from your description and calls it when relevant.
      </p>

      <h2 id="json-schema">JSON Schema Definition</h2>
      <p>
        Each custom tool is defined by a JSON Schema that describes its parameters. This tells the model what inputs the tool accepts and what each parameter means.
      </p>

      <h3 id="schema-structure">Schema Structure</h3>
      <p>
        A tool definition includes:
      </p>
      <ul>
        <li><strong>Name:</strong> A unique identifier (e.g., <code>get_order_status</code>)</li>
        <li><strong>Description:</strong> What the tool does — this is what the model reads to decide when to use it</li>
        <li><strong>Parameters:</strong> A JSON Schema object defining the input parameters</li>
        <li><strong>Endpoint:</strong> The HTTP URL to call when the tool is invoked</li>
        <li><strong>Method:</strong> HTTP method — <code>GET</code>, <code>POST</code>, etc.</li>
      </ul>

      <h3 id="parameter-schema">Parameter Schema Example</h3>
      <p>
        Parameters follow the JSON Schema specification:
      </p>
      <ul>
        <li><code>type: "string"</code> — text values</li>
        <li><code>type: "number"</code> — numeric values</li>
        <li><code>type: "boolean"</code> — true/false flags</li>
        <li><code>type: "array"</code> — lists of items</li>
        <li><code>enum</code> — predefined allowed values</li>
        <li><code>description</code> — explains the parameter to the model</li>
        <li><code>required</code> — which parameters are mandatory</li>
      </ul>

      <DocCallout variant="tip" icon={Code} title="Descriptions matter">
        The model uses parameter descriptions to generate correct inputs. Write clear, specific descriptions. Instead of "the id", use "the unique order identifier (e.g., ORD-2024-001)".
      </DocCallout>

      <h2 id="naming-conventions">Naming Conventions</h2>
      <ul>
        <li>Use <code>snake_case</code> for tool names: <code>get_user_profile</code>, <code>create_invoice</code></li>
        <li>Use descriptive, verb-first names: <code>search_products</code> not <code>products</code></li>
        <li>Keep names under 64 characters</li>
        <li>Avoid abbreviations unless they're universally understood</li>
      </ul>

      <h2 id="testing">Testing Custom Tools</h2>
      <p>
        Before deploying, test your custom tool in the Playground:
      </p>
      <ol>
        <li>Create the tool in your agent's settings</li>
        <li>Open the Playground tab</li>
        <li>Ask a question that should trigger the tool</li>
        <li>Verify the model selects the tool with correct parameters</li>
        <li>Check that the response incorporates the tool's output</li>
      </ol>

      <DocCallout variant="warning" icon={AlertCircle} title="Validate your endpoint">
        Ensure your HTTP endpoint returns valid JSON and handles errors gracefully. A 500 error from your API will surface as a tool failure in the conversation.
      </DocCallout>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li>Return structured JSON from your endpoint — the model reads the response</li>
        <li>Keep responses concise; large payloads waste context tokens</li>
        <li>Use consistent error formats: <code>{'{"error": "description"}'}</code></li>
        <li>Include example values in parameter descriptions to guide the model</li>
        <li>Test edge cases: missing parameters, invalid inputs, timeouts</li>
      </ul>
    </DocContent>
  )
}
