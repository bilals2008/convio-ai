// Ready-made knowledge base templates. Each template pre-fills a KB's name,
// description, and creates seed documents so users get a working KB immediately.

export type KnowledgeTemplateType =
  | 'product-docs'
  | 'faq-base'
  | 'company-wiki'
  | 'support-articles'

export interface KnowledgeTemplateDocument {
  name: string
  type: 'txt' | 'md' | 'csv' | 'json'
  content: string
}

export interface KnowledgeTemplate {
  id: KnowledgeTemplateType
  name: string
  description: string
  documents: KnowledgeTemplateDocument[]
}

const templates: Record<KnowledgeTemplateType, KnowledgeTemplate> = {
  'product-docs': {
    id: 'product-docs',
    name: 'Product Documentation',
    description: 'A structured knowledge base for product docs, API references, and guides.',
    documents: [
      {
        name: 'overview.md',
        type: 'md',
        content: '# Product Overview\n\nWelcome to our product documentation.\n\n## Getting Started\n- Install the SDK\n- Configure your environment\n- Run your first query\n\n## Core Concepts\n- Entities and relationships\n- Data models\n- API conventions\n',
      },
      {
        name: 'api-reference.md',
        type: 'md',
        content: '# API Reference\n\n## Authentication\nAll requests require an API key in the Authorization header.\n\n## Endpoints\n- GET /entities — List all entities\n- POST /entities — Create a new entity\n- GET /entities/:id — Get entity details\n- PUT /entities/:id — Update entity\n- DELETE /entities/:id — Delete entity\n\n## Rate Limits\n- 100 requests per minute\n- Burst limit: 200 requests\n',
      },
      {
        name: 'troubleshooting.md',
        type: 'md',
        content: '# Troubleshooting\n\n## Common Issues\n\n### 401 Unauthorized\nCheck that your API key is valid and included in the Authorization header.\n\n### 429 Too Many Requests\nYou have exceeded the rate limit. Wait a moment and retry.\n\n### 500 Server Error\nPlease contact support with the request ID from the response headers.\n',
      },
    ],
  },
  'faq-base': {
    id: 'faq-base',
    name: 'FAQ Knowledge Base',
    description: 'A ready-to-use FAQ knowledge base with pre-built Q&A pairs.',
    documents: [
      {
        name: 'shipping.md',
        type: 'md',
        content: '# Shipping & Delivery\n\n## Q: How long does shipping take?\nStandard shipping takes 3-5 business days. Express shipping takes 1-2 business days.\n\n## Q: Do you ship internationally?\nYes, we ship to over 50 countries. International orders may take 7-14 business days.\n\n## Q: How can I track my order?\nUse the tracking link sent to your email, or check your order status in your account dashboard.\n',
      },
      {
        name: 'returns.md',
        type: 'md',
        content: '# Returns & Refunds\n\n## Q: What is your return policy?\nWe offer a 30-day return policy for unused items in original packaging.\n\n## Q: How do I start a return?\nGo to My Orders, select the item, and click "Return Item." You will receive a return label.\n\n## Q: When will I receive my refund?\nRefunds are processed within 5-7 business days after we receive the returned item.\n',
      },
      {
        name: 'payments.md',
        type: 'md',
        content: '# Payments & Billing\n\n## Q: What payment methods do you accept?\nWe accept credit cards, debit cards, PayPal, and Apple Pay.\n\n## Q: Is my payment information secure?\nYes, we use industry-standard encryption (SSL/TLS) to protect your payment data.\n\n## Q: Can I cancel my subscription?\nYes, you can cancel anytime from your account settings. Your access continues until the billing period ends.\n',
      },
    ],
  },
  'company-wiki': {
    id: 'company-wiki',
    name: 'Company Wiki',
    description: 'Internal knowledge base with company overview, policies, and team structure.',
    documents: [
      {
        name: 'about.md',
        type: 'md',
        content: '# About Our Company\n\n## Mission\nWe build tools that make teams more productive and collaborative.\n\n## Values\n- Customer-first\n- Integrity\n- Innovation\n- Transparency\n\n## History\nFounded in 2020, we have grown to serve over 10,000 teams worldwide.\n',
      },
      {
        name: 'hr-policies.md',
        type: 'md',
        content: '# HR Policies\n\n## Work Hours\nStandard working hours are 9 AM to 5 PM in your local timezone.\n\n## Time Off\n- 20 days paid leave per year\n- 10 sick days per year\n- Parental leave available\n\n## Remote Work\nWe support flexible remote work. Managers must approve remote work arrangements.\n',
      },
      {
        name: 'tech-stack.md',
        type: 'md',
        content: '# Technical Stack\n\n## Frontend\n- React + TypeScript\n- Tailwind CSS\n- shadcn/ui components\n\n## Backend\n- Node.js + Fastify\n- PostgreSQL\n- Prisma ORM\n\n## DevOps\n- Docker + Kubernetes\n- GitHub Actions\n- Supabase for auth\n',
      },
    ],
  },
  'support-articles': {
    id: 'support-articles',
    name: 'Support Articles',
    description: 'Pre-built support articles for helping users solve common problems.',
    documents: [
      {
        name: 'getting-started.md',
        type: 'md',
        content: '# Getting Started Guide\n\n1. Create your account\n2. Connect your data source\n3. Configure your agent\n4. Launch and monitor\n\n## Key Tips\n- Start with a focused knowledge base\n- Preview responses before going live\n- Use the analytics dashboard to improve over time\n',
      },
      {
        name: 'data-sources.md',
        type: 'md',
        content: '# Connecting Data Sources\n\n## Supported Formats\n- Text files (.txt)\n- Documents (.pdf)\n- Spreadsheets (.csv)\n- Web pages (URL)\n- JSON data\n\n## Best Practices\n- Use clear, descriptive file names\n- Keep documents under 10MB each\n- Organize content with headings for better retrieval\n',
      },
      {
        name: 'agent-setup.md',
        type: 'md',
        content: '# Setting Up Your AI Agent\n\n## Step 1: Choose a Template\nPick a template that matches your use case — Customer Support, Sales, Tutor, and more.\n\n## Step 2: Connect Knowledge\nLink your knowledge base so the agent has real context for answers.\n\n## Step 3: Select Tools\nEnable tools like Web Search, Calculator, or URL Fetcher to extend capabilities.\n\n## Step 4: Deploy\nChoose deployment options: Web Chat, Shareable Link, API, or WhatsApp.\n',
      },
    ],
  },
}

/** Return a single template by type, or undefined if the type is unknown. */
export function getKnowledgeTemplate(type: string): KnowledgeTemplate | undefined {
  return templates[type as KnowledgeTemplateType]
}

/** Return all available knowledge base templates in a stable order. */
export function listKnowledgeTemplates(): KnowledgeTemplate[] {
  return Object.values(templates)
}