# Convio Documentation Roadmap

> **Audience:** Complete beginners to advanced platform builders
> **Structure:** 16 Phases — linear for beginners, skippable for experienced users

---

## Phase 1: Getting Started

**Goal:** Help a complete beginner understand Convio, create an account, and orient themselves in the platform.

**Who should read it:** Everyone — new users, evaluators, decision-makers

**Complexity:** ★☆☆☆☆ (Minimal)

**Prerequisites:** None

**Articles:**
1. **What is Convio?** — Platform overview, core concepts, use cases (customer support, sales, onboarding, FAQ automation)
2. **Convio vs Other Platforms** — Comparison with OpenAI, Voiceflow, Botpress, Intercom, Zapier — when to use what
3. **Creating an Account** — Sign up flow (email + password, Google OAuth), email verification
4. **Dashboard Tour** — Walk through the main dashboard: sidebar navigation, org switcher, quick stats
5. **Creating Your First Organization** — What organizations are, creating one, inviting your team
6. **Understanding the Convio Vocabulary** — Glossary: Agent, Bot, Deployment, Channel, Widget, Knowledge Base, Tool, MCP, Conversation

**Recommended reading order:** 1 → 3 → 5 → 4 → 2 → 6

---

## Phase 2: Organizations & Collaboration

**Goal:** Set up your workspace, manage team members, and understand roles and permissions.

**Who should read it:** Workspace owners and admins

**Complexity:** ★★☆☆☆ (Easy)

**Prerequisites:** Phase 1 (account + first org)

**Articles:**
1. **Organizations Deep Dive** — What orgs are for, switching between orgs, org settings (name, slug, logo)
2. **Understanding Roles & Permissions** — Owner, Admin, Member, Viewer — what each can do
3. **Inviting Team Members** — Email invitations, invite links, resending, revoking
4. **Managing Members** — Viewing members, changing roles, removing members
5. **Transferring Ownership** — How to transfer org ownership, prerequisites
6. **Leaving an Organization** — What happens when you leave, data access after leaving
7. **Login Activity & Sessions** — Viewing active sessions, device info, revoking sessions

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## Phase 3: AI Agents

**Goal:** Create, configure, and test your first AI Agent — the brain of your chatbot.

**Who should it read:** Anyone building chatbots or agents

**Complexity:** ★★★☆☆ (Intermediate)

**Prerequisites:** Phase 1

**Articles:**
1. **What is an AI Agent?** — Agent vs Bot vs Model — Convio's architecture explained
2. **Creating an Agent** — From scratch vs from a template (17 pre-built templates)
3. **Choosing an AI Model** — All supported providers (OpenAI, Anthropic, Google, Groq, OpenRouter, etc.), which model for which use case
4. **Writing System Prompts** — How system prompts work, prompt engineering tips, example prompts for common use cases
5. **Configuring Agent Settings** — Temperature, max tokens, reasoning effort, top P, stop sequences
6. **Welcome Messages & Suggested Replies** — Setting up first impressions, guiding user expectations
7. **Testing Your Agent in the Playground** — Using the built-in test stream, iterating on prompts
8. **Agent Statuses** — Draft, Active, Inactive — what each means, transitioning between them
9. **Cloning & Versioning Agents** — Duplicating agent configs, managing iterations

**Recommended reading order:** 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8 → 9

---

## Phase 4: Knowledge Bases (RAG)

**Goal:** Give your agents custom knowledge by uploading documents and connecting external data sources.

**Who should it read:** Anyone who needs their agent to answer from company-specific data

**Complexity:** ★★★☆☆ (Intermediate)

**Prerequisites:** Phase 3 (agents)

**Articles:**
1. **What is a Knowledge Base?** — RAG explained simply, when to use knowledge bases
2. **Creating a Knowledge Base** — Naming, describing, connecting to an agent
3. **Supported Document Types** — PDF, TXT, Markdown, CSV, JSON, URLs
4. **Uploading Documents** — File uploads, drag-and-drop, progress tracking
5. **Adding Web Pages as Knowledge** — URL ingestion, what gets captured
6. **How Document Processing Works** — Text extraction → chunking → embedding pipeline explained
7. **Understanding Chunking** — Chunk size, overlap strategies, how chunking affects answers
8. **Vector Search & Embeddings** — What embeddings are (384-d pgvector), how search relevance works
9. **Reranking Results** — Improving answer quality with result reranking
10. **Document Statuses** — Pending, Processing, Ready, Error — what each means, troubleshooting failures
11. **Managing Knowledge Bases** — Editing, adding/removing documents, reprocessing, deleting
12. **Knowledge Base Templates** — Pre-built knowledge structures for common use cases

**Recommended reading order:** 1 → 2 → 3 → 4 → 6 → 7 → 8 → 5 → 9 → 10 → 11 → 12

---

## Phase 5: Tools & MCP Servers

**Goal:** Extend agent capabilities with built-in and custom tools, plus MCP server integration.

**Who should it read:** Advanced users building agentic workflows

**Complexity:** ★★★★☆ (Advanced)

**Prerequisites:** Phase 3 (agents)

**Articles:**
1. **What are Tools?** — Tool-calling explained, how agents use tools
2. **Built-in Tools Overview** — Web search, calculator, URL fetcher — what each does
3. **Using the Web Search Tool** — How it works, rate limits, when to use it
4. **Using the Calculator Tool** — Mathematical expressions, data formatting
5. **Using the URL Fetcher Tool** — Fetching and summarizing web pages
6. **Creating Custom Tools** — Defining custom tools with JSON schema, parameters, descriptions
7. **Attaching Tools to Agents** — Selecting tools per agent, configuring tool behavior
8. **What is MCP?** — Model Context Protocol explained simply
9. **MCP Server Types** — STDIO, SSE, Streamable HTTP — which to use when
10. **Connecting an MCP Server** — Configuration fields, authentication, testing the connection
11. **Linking MCP Servers to Agents** — Making MCP tools available to your agent
12. **MCP Security Best Practices** — API key management, access control, sandboxing

**Recommended reading order:** 1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → 9 → 10 → 11 → 12

---

## Phase 6: Conversations & Messaging

**Goal:** Understand how conversations work, manage messages, and handle leads.

**Who should it read:** Anyone deploying chatbots or managing customer interactions

**Complexity:** ★★☆☆☆ (Easy)

**Prerequisites:** Phase 3 (agents)

**Articles:**
1. **Conversations Overview** — How conversations are created, lifecycle, multi-channel
2. **Conversation Statuses** — Active, Waiting, Resolved, Closed, Archived — managing the lifecycle
3. **Viewing Conversations** — Conversation list, filters, search, sorting
4. **Reading Messages** — Message history, timestamps, token usage per message
5. **Sending Messages** — Manual replies, interrupting AI responses
6. **Message Streaming** — How real-time AI responses work (SSE), latency expectations
7. **Conversation Metadata** — Custom metadata fields, channels, contact info
8. **Leads & Contact Management** — Capturing lead info from conversations, contact profiles
9. **Resolving & Archiving Conversations** — When and how to close conversations
10. **Conversation Search** — Full-text search across messages and conversations

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 8 → 7 → 9 → 10

---

## Phase 7: Human Handoff

**Goal:** Set up escalation paths so conversations can be handed to human operators when needed.

**Who should it read:** Customer support teams, anyone with human-in-the-loop requirements

**Complexity:** ★★★☆☆ (Intermediate)

**Prerequisites:** Phase 6 (conversations)

**Articles:**
1. **What is Human Handoff?** — When and why to hand off to humans
2. **Setting Up Handoff Triggers** — Keywords, sentiment detection, user request, escalation limits
3. **Assigning Conversations to Team Members** — Manual and automatic assignment
4. **The Human Agent Inbox** — Viewing assigned conversations, writing responses
5. **Taking Over from the AI** — Seamless takeover, context preservation
6. **Returning to AI** — Handing back to the AI after human intervention
7. **Handoff Notifications** — Email and in-app notifications for assigned conversations
8. **Best Practices for Human Handoff** — When to escalate, how to brief human agents

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

---

## Phase 8: Widgets & Website Embedding

**Goal:** Embed your chatbot on your website with a customizable widget.

**Who should it read:** Web developers, product managers deploying chatbots on websites

**Complexity:** ★★★☆☆ (Intermediate)

**Prerequisites:** Phase 3 (agents), basic web development knowledge

**Articles:**
1. **What is the Web Widget?** — Widget capabilities, how visitors interact
2. **Creating a Widget** — Naming, selecting an agent, generating the public key
3. **Customizing Widget Appearance** — Colors, position, size, welcome message, branding
4. **Configuring Allowed Domains** — Security: restricting where your widget can appear
5. **Widget Conversation Settings** — Auto-open, greeting delay, mobile behavior
6. **Embedding with a Script Tag** — The embed snippet, placement in HTML
7. **Embedding with JavaScript API** — Programmatic control: open, close, send messages
8. **Widget Public API** — Using the public API endpoints for custom frontends
9. **Testing Your Widget** — Using the widget demo page, cross-domain testing
10. **Widget Analytics** — Tracking widget interactions, visitor count, engagement
11. **Multi-language Widget** — Language detection, translation support
12. **Troubleshooting Widget Issues** — Common embedding problems, CORS issues

**Recommended reading order:** 1 → 2 → 3 → 4 → 6 → 5 → 9 → 7 → 8 → 10 → 11 → 12

---

## Phase 9: Deployments & Multi-Channel

**Goal:** Deploy your agent across messaging platforms — WhatsApp, Telegram, Discord, Slack.

**Who should it read:** Anyone deploying to non-web channels

**Complexity:** ★★★★☆ (Advanced)

**Prerequisites:** Phase 3 (agents), access to each platform's developer console

**Articles:**
1. **Channels Overview** — Which channels are supported, one agent → many channels
2. **Creating a Deployment** — Selecting agent and channel, configuration basics
3. **Deployment Statuses** — Configuring, Active, Error — managing lifecycle
4. **WhatsApp Integration (Primary)** — Setting up with Kapso Platform
5. **WhatsApp Integration (Alternative)** — Setting up with Twilio
6. **WhatsApp Templates & Broadcasts** — Creating message templates, scheduling campaigns
7. **Telegram Integration** — Creating a bot via BotFather, webhook setup
8. **Discord Integration** — One-click OAuth2 setup, slash commands, bot nickname
9. **Discord Gateway & Interactions** — How the Discord gateway works, handling commands
10. **Slack Integration** — Event subscriptions, bot tokens, app manifest
11. **Testing Deployments** — End-to-end testing per channel, connection diagnostics
12. **Managing Multiple Deployments** — One agent across all channels, consistent behavior
13. **Channel-Specific Behavior** — Adapting responses per platform (character limits, formatting)

**Recommended reading order:** 1 → 2 → 3 → (4 or 5 depending on WhatsApp provider) → 7 → 8 → 10 → 6 → 9 → 11 → 12 → 13

---

## Phase 10: Provider Keys & AI Models

**Goal:** Configure your own API keys for AI providers and manage which models are available.

**Who should it read:** Users who want to use their own provider accounts or access custom models

**Complexity:** ★★☆☆☆ (Easy)

**Prerequisites:** Phase 3 (agents)

**Articles:**
1. **What is BYOK?** — Bring Your Own Key explained, why you'd want to
2. **Supported Providers** — OpenAI, Anthropic, Google, Groq, OpenRouter, KIE, Local, OpenCode — what each offers
3. **Adding a Provider Key** — How to store keys securely, key preview
4. **Managing Provider Keys** — Viewing, updating, deleting keys per organization
5. **How Key Resolution Works** — Agent → Provider Key → Environment variable fallback chain
6. **Available Model List** — How models are dynamically listed, filtering by provider
7. **Using Models from Different Providers** — Mixing and matching per agent
8. **Local Models** — Running models locally, requirements, limitations
9. **Rate Limits & Quotas** — Understanding provider rate limits, managing costs
10. **Security Best Practices for API Keys** — Key rotation, access control, never sharing

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 9 → 8 → 10

---

## Phase 11: Automations & Webhooks

**Goal:** Automate workflows, integrate with external services via webhooks, and build event-driven flows.

**Who should it read:** Developers building automated workflows

**Complexity:** ★★★★☆ (Advanced)

**Prerequisites:** Phase 6 (conversations), basic web development

**Articles:**
1. **Automations Overview** — What can be automated in Convio
2. **WhatsApp Broadcasts** — Scheduled campaigns, template messages, audience targeting
3. **Creating a Broadcast** — Setting up a campaign, template parameters, scheduling
4. **Managing Broadcasts** — Viewing history, pausing, canceling
5. **What are Webhooks?** — Event-driven integrations explained
6. **Available Webhook Events** — Conversation created, message received, agent status change, etc.
7. **Creating a Webhook Endpoint** — Configuring URL, selecting events, secret tokens
8. **Verifying Webhook Signatures** — Security: verifying payloads came from Convio
9. **Testing Webhooks** — Using the test delivery tool, inspecting payloads
10. **Webhook Retry Policy** — How retries work, handling failures
11. **Building Workflows with Webhooks** — Real-world integration examples (CRM, ticketing, analytics)

**Recommended reading order:** 1 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 2 → 3 → 4

---

## Phase 12: Analytics & Monitoring

**Goal:** Understand platform performance, track usage, and make data-driven decisions.

**Who should it read:** Product managers, team leads, anyone optimizing bot performance

**Complexity:** ★★☆☆☆ (Easy)

**Prerequisites:** Phase 3 (agents), Phase 6 (conversations)

**Articles:**
1. **Analytics Overview** — What metrics are tracked, where to find them
2. **Dashboard Analytics** — Overview cards: conversations, messages, unique users, active bots
3. **Per-Agent Analytics** — Individual agent performance, daily breakdowns
4. **Understanding Key Metrics** — Avg response time, token usage, success rate, satisfaction
5. **Channel Breakdown** — Performance comparison across channels
6. **Daily & Custom Date Ranges** — Viewing trends over time, date range filtering
7. **Conversation Success Rate** — How it's calculated, what affects it
8. **Token Usage Tracking** — Monitoring AI costs, input vs output tokens, per-agent breakdown
9. **Audit Logs** — Full event history: who did what, when, in your organization
10. **Exporting Analytics** — Downloading reports, data portability

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

---

## Phase 13: Security & Compliance

**Goal:** Set up content moderation, configure SSO, and understand platform security.

**Who should it read:** Security-conscious users, compliance teams, enterprise admins

**Complexity:** ★★★☆☆ (Intermediate)

**Prerequisites:** Phase 1, Phase 2 (orgs)

**Articles:**
1. **Security Overview** — Platform security architecture, data encryption, infrastructure
2. **Content Moderation** — How moderation works, supported checks
3. **Profanity Filtering** — Enabling, configuring blocked words
4. **PII Detection** — Detecting and blocking personal information (emails, phone numbers, SSNs)
5. **Prompt Injection Protection** — Preventing jailbreak attempts, injection patterns
6. **Custom Moderation Rules** — Creating your own rules, regex patterns
7. **Block-on-Violation Mode** — Strict mode: blocking messages that trigger rules
8. **Audit Logs (Security Focus)** — Using audit logs for security investigations
9. **SSO / Single Sign-On** — Setting up SSO (SAML/OIDC), identity provider configuration
10. **Data Retention & Deletion** — How long data is kept, deleting conversations and documents
11. **Data Management Center** — Viewing data summary, bulk deletion, full org wipe
12. **Security Checklist** — Recommended security settings for production use

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

---

## Phase 14: Billing, Plans & Usage Limits

**Goal:** Understand pricing, manage subscriptions, and track usage against plan limits.

**Who should it read:** Org owners, billing administrators

**Complexity:** ★☆☆☆☆ (Minimal)

**Prerequisites:** Phase 1 (account)

**Articles:**
1. **Pricing Overview** — Free, Pro, Business, Enterprise — what each plan includes
2. **Plan Features Comparison** — Detailed comparison: agents, messages, users, features per plan
3. **Understanding Usage Limits** — Agent limits, message quotas, org limits
4. **Viewing Your Current Plan** — Checking your plan, usage against limits
5. **Upgrading Your Plan** — Starting a subscription, checkout flow
6. **Managing Subscriptions** — Viewing subscription details, renewal dates
7. **Viewing Invoices** — Invoice history, download, payment status
8. **Customer Portal** — Managing payment methods, updating billing info
9. **Usage Notifications** — How you're alerted when approaching limits
10. **Enterprise Plans** — Custom pricing, dedicated support, custom SLAs
11. **Canceling Your Subscription** — What happens on cancellation, data retention

**Recommended reading order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 11 → 10

---

## Phase 15: API & SDK Reference

**Goal:** Integrate Convio programmatically using the REST API and SDK.

**Who should it read:** Developers building custom integrations

**Complexity:** ★★★★☆ (Advanced)

**Prerequisites:** Phase 1 (account + API key), web development experience

**Articles:**
1. **API Overview** — RESTful design, base URL, content type, authentication
2. **Authentication & API Keys** — Creating API keys, Bearer token auth, key permissions
3. **Making Your First API Request** — Quickstart: cURL example, Postman collection
4. **API Conventions** — Pagination (cursor-based), response format, error format
5. **Core Endpoints Reference**
   - 5.1 Agents — CRUD, status management, tool attachment
   - 5.2 Conversations — CRUD, status transitions, messaging
   - 5.3 Messages — Sending, streaming AI responses
   - 5.4 Knowledge Bases — Management, document upload, search
   - 5.5 Tools — Built-in and custom tool management
   - 5.6 Deployments — Channel configuration, webhook setup
   - 5.7 Widgets — CRUD, public API endpoints
   - 5.8 Analytics — Metrics and reports
   - 5.9 Organizations — Members, roles, settings
   - 5.10 Billing — Plans, subscriptions, invoices
   - 5.11 MCP Servers — CRUD, testing, linking
   - 5.12 Provider Keys — Management
6. **Streaming API** — SSE for real-time AI responses, handling the event stream
7. **Webhook Events Reference** — All event types, payload schemas, delivery format
8. **Rate Limiting** — Endpoint-specific limits, headers, handling 429 responses
9. **Error Codes & Handling** — All error codes, meanings, recovery strategies
10. **JavaScript / TypeScript SDK** — Installation, setup, examples
11. **SDK Reference** — All SDK methods, parameters, types
12. **API Changelog** — Versioning policy, breaking changes, deprecation timeline

**Recommended reading order:** 1 → 2 → 3 → 4 → 6 → 5 (relevant sections) → 7 → 8 → 9 → 10 → 11 → 12

---

## Phase 16: Troubleshooting, FAQs & Best Practices

**Goal:** Solve common problems, get answers to frequent questions, and follow proven patterns.

**Who should it read:** All users — reference material for day-to-day use

**Complexity:** ★☆☆☆☆ (Reference)

**Prerequisites:** None (reference material)

**Articles:**

### Troubleshooting
1. **Widget Not Loading** — CORS issues, domain restrictions, script placement
2. **Agent Not Responding** — Model API key issues, rate limits, provider outages
3. **Knowledge Base Not Answering** — Document processing errors, chunking issues, embedding failures
4. **Deployment Connection Errors** — Webhook configuration, platform-specific issues
5. **WhatsApp Integration Issues** — Template rejection, message failures, provider problems
6. **Discord Integration Issues** — Permission errors, slash commands not showing, gateway disconnects
7. **Telegram Integration Issues** — Webhook setup, bot token issues
8. **Slack Integration Issues** — Event subscription failures, token expiration
9. **Streaming Not Working** — SSE connection issues, browser compatibility
10. **Billing & Payment Issues** — Failed payments, subscription not activating
11. **Login & Auth Issues** — Session expiration, OAuth failures, email verification
12. **Performance Issues** — Slow response times, timeout errors

### FAQs
13. **General FAQs** — Account, platform, capabilities
14. **Technical FAQs** — API, webhooks, integrations
15. **Billing FAQs** — Pricing, invoices, plan changes
16. **Security FAQs** — Data privacy, encryption, compliance

### Best Practices
17. **Prompt Engineering Best Practices** — Writing effective system prompts, tone, constraints
18. **Knowledge Base Best Practices** — Document structure, optimal chunk sizes, content organization
19. **Multi-Channel Strategy** — Consistent experience across channels, channel-specific adaptations
20. **Performance Optimization** — Model selection for speed vs quality, caching strategies
21. **Security Best Practices** — API key management, moderation configuration, access control
22. **Cost Optimization** — Token management, model selection, usage monitoring
23. **Agent Design Patterns** — When to use one agent vs many, agent specialization
24. **Conversation Design Best Practices** — Welcome messages, follow-up prompts, error recovery

**Recommended reading order:** Reference — search as needed

---

## Appendix

1. **Glossary of Terms** — All platform terminology defined
2. **Changelog** — Product updates, new features, breaking changes
3. **Migration Guides** — Upgrading from previous versions
4. **Status Page** — Platform uptime, incidents, maintenance windows
5. **Contact & Support** — How to get help: email, in-app chat, community

---

## Reading Paths by Role

### Beginner / Non-technical
Phase 1 → Phase 2 → Phase 3 → Phase 6 → Phase 12 → Phase 14 → FAQs

### Developer (building a chatbot)
Phase 1 → Phase 3 → Phase 4 → Phase 5 → Phase 8 → Phase 9 → Phase 11

### Developer (integrating via API)
Phase 1 → Phase 3 → Phase 15 → Phase 11 → Phase 10

### Enterprise Admin
Phase 1 → Phase 2 → Phase 13 → Phase 14 → Phase 12 → Security FAQs

### Operations / Support Manager
Phase 1 → Phase 3 → Phase 6 → Phase 7 → Phase 12 → Phase 16 (Best Practices)

---

*This roadmap covers the complete Convio platform. Each phase is designed to build on the previous one, while also being accessible as standalone reading for users who already understand earlier concepts.*
