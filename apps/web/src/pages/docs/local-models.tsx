import { Server, Cpu, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function LocalModelsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Local Models' },
        ]}
        title="Local Models"
        description="Run AI models on your own infrastructure for full data control and zero API costs."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio supports running models locally through any OpenAI-compatible endpoint. This means you can host your own models using tools like Ollama, vLLM, or llama.cpp, and connect them to Convio as a provider. All inference happens on your hardware — no data leaves your network.
      </p>

      <h2 id="supported-backends">Supported Backends</h2>
      <p>
        Convio works with any server that exposes an OpenAI-compatible API. Common options include:
      </p>

      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Ollama"
          description="Run models locally with a single command. Supports Llama, Mistral, Phi, Gemma, and hundreds of other model formats."
          href="#ollama"
        />
        <DocFeatureCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="vLLM"
          description="High-throughput serving for large language models. Supports PagedAttention for efficient memory usage."
          href="#vllm"
        />
        <DocFeatureCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="llama.cpp"
          description="Lightweight C++ inference engine. Runs quantized models on CPU or GPU with minimal memory requirements."
          href="#llamacpp"
        />
      </DocCardGrid>

      <h2 id="setup">Setting Up a Local Model</h2>

      <h3 id="ollama">Ollama Setup</h3>
      <ol>
        <li>Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">ollama.ai</a>.</li>
        <li>Pull a model: <code>ollama pull llama3.3</code></li>
        <li>Start the server: <code>ollama serve</code> (runs on <code>http://localhost:11434</code> by default).</li>
        <li>In Convio, add a "Local" provider key with the endpoint URL.</li>
      </ol>

      <h3 id="vllm">vLLM Setup</h3>
      <ol>
        <li>Install vLLM: <code>pip install vllm</code></li>
        <li>Start the server: <code>vllm serve meta-llama/Llama-3.3-70B-Instruct</code></li>
        <li>The server exposes an OpenAI-compatible API at <code>http://localhost:8000</code>.</li>
        <li>In Convio, add a "Local" provider key with the endpoint URL.</li>
      </ol>

      <h3 id="llamacpp">llama.cpp Setup</h3>
      <ol>
        <li>Build or download llama.cpp from <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noopener noreferrer">GitHub</a>.</li>
        <li>Download a GGUF model file.</li>
        <li>Start the server: <code>llama-server -m model.gguf --port 8080</code></li>
        <li>In Convio, add a "Local" provider key with the endpoint URL.</li>
      </ol>

      <h2 id="hardware">Hardware Requirements</h2>
      <p>
        Hardware requirements depend on the model size and quantization level:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Model Size</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">RAM Required</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">GPU (Optional)</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Speed</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">7B</td>
              <td className="py-2 pr-4">8 GB</td>
              <td className="py-2 pr-4">4GB VRAM</td>
              <td className="py-2">Fast</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">13B</td>
              <td className="py-2 pr-4">16 GB</td>
              <td className="py-2 pr-4">8GB VRAM</td>
              <td className="py-2">Moderate</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">70B</td>
              <td className="py-2 pr-4">64 GB</td>
              <td className="py-2 pr-4">24GB+ VRAM</td>
              <td className="py-2">Slow without GPU</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">405B</td>
              <td className="py-2 pr-4">128 GB+</td>
              <td className="py-2 pr-4">Multi-GPU</td>
              <td className="py-2">Very slow</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="formats">Supported Model Formats</h2>
      <ul>
        <li><strong>GGUF:</strong> Used by llama.cpp and Ollama. Quantized models with good quality/size ratio.</li>
        <li><strong>Safetensors:</strong> Used by vLLM and Hugging Face. Full-precision or quantized models.</li>
        <li><strong>ONNX:</strong> Optimized format for CPU inference.</li>
      </ul>

      <h2 id="limitations">Limitations vs Cloud Models</h2>

      <DocCallout variant="warning" icon={AlertTriangle} title="Local models have tradeoffs">
        Local models give you full data control, but they come with limitations compared to cloud-hosted models. Consider these factors before choosing local inference.
      </DocCallout>

      <ul>
        <li><strong>Quality:</strong> Open-source models generally lag behind GPT-4o and Claude Sonnet 4 in complex reasoning and instruction following.</li>
        <li><strong>Speed:</strong> Without dedicated GPU hardware, inference is significantly slower than cloud providers.</li>
        <li><strong>Maintenance:</strong> You're responsible for server uptime, model updates, and hardware management.</li>
        <li><strong>Scaling:</strong> Cloud providers scale automatically. Local setups require manual capacity planning.</li>
        <li><strong>Features:</strong> Some features like extended thinking and advanced tool use may not be available or may be limited.</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Cpu}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Supported Providers"
          href="/docs/supported-providers"
        />
        <DocNextStepCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="API Key Security"
          href="/docs/api-key-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}

