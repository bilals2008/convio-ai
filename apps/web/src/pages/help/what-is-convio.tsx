import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function WhatIsConvioPage() {
  return (
    <div className="typeset typeset-help">
      <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6">
        <Link to="/help" className="hover:text-foreground transition-colors">Documentation</Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-medium">What is Convio?</span>
      </nav>

      <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-4">
        What is Convio?
      </h1>

      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-[600px]">
        Convio is an AI-powered platform that lets you build, manage, and deploy intelligent agents and chatbots across multiple channels — all from a single dashboard.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        Convio combines a visual agent builder, a managed knowledge base, and multi-channel deployment into one cohesive product. Instead of stitching together separate tools for NLP, storage, and integrations, you get a unified workflow: design an agent, give it knowledge, and deploy it wherever your users are.
      </p>

      <h2 id="core-concepts">Core Concepts</h2>
      <p>
        Before diving in, it helps to understand a few key terms that appear throughout the documentation.
      </p>

      <h3 id="agents">Agents</h3>
      <p>
        An agent is the central unit in Convio. It combines a system prompt, a set of tools, and a knowledge base into a single entity that can hold conversations, answer questions, and take actions on behalf of your users.
      </p>

      <h3 id="knowledge-bases">Knowledge Bases</h3>
      <p>
        Knowledge bases store the information your agent can reference. Upload PDFs, paste URLs, or connect data sources — Convio handles indexing, chunking, and retrieval so your agent always has the right context.
      </p>

      <h3 id="channels">Channels</h3>
      <p>
        Channels are the surfaces where your agent lives. Embed it as a web widget, connect it to WhatsApp, Telegram, Messenger, or expose it through an API. Each channel shares the same agent configuration.
      </p>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        The workflow is straightforward: create an agent, attach a knowledge base, configure its behavior, and deploy to one or more channels. Convio handles the infrastructure — vector search, message routing, rate limiting, and analytics — so you can focus on the agent logic.
      </p>

      <h3 id="step-1-create">Step 1 — Create an Agent</h3>
      <p>
        Head to the Agents page, click "New Agent," and define a system prompt. This tells the agent how to behave, what tone to use, and what it should prioritize.
      </p>

      <h3 id="step-2-knowledge">Step 2 — Add Knowledge</h3>
      <p>
        Upload documents or paste URLs into a knowledge base, then link it to your agent. The agent will automatically retrieve relevant context during conversations.
      </p>

      <h3 id="step-3-deploy">Step 3 — Deploy</h3>
      <p>
        Pick a channel — web widget, WhatsApp, or API — and follow the setup steps. Most deployments take under five minutes.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Ready to get started? Head to the Quick Start guide or jump straight into creating your first agent.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 not-typeset">
        <Link
          to="/help/creating-agent"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Create your first agent <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/help/knowledge-bases"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Set up a knowledge base <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
