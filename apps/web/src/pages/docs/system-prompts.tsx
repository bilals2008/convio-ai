import { Link } from 'react-router-dom'
import { ArrowRight, FileText, AlertTriangle, CheckCircle, MessageSquare, ShoppingCart, HelpCircle, UserPlus } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SystemPromptsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'System Prompts' },
        ]}
        title="Writing System Prompts"
        description="The system prompt is your agent's instruction manual. It defines how the agent behaves, what it knows, and how it responds."
      />

      <h2 id="how-system-prompts-work">How System Prompts Work</h2>
      <p>
        A system prompt is a message sent to the model at the start of every conversation. It's invisible to the end user but shapes every response the agent generates. Think of it as the agent's job description — it sets the boundaries, tone, and priorities.
      </p>
      <p>
        The system prompt is prepended to each API call. The model sees it first, then the conversation history, then the latest user message. This means the agent "remembers" its instructions throughout the entire session.
      </p>

      <h2 id="prompt-structure">Prompt Structure</h2>
      <p>
        An effective system prompt typically covers four areas:
      </p>
      <ol>
        <li><strong>Role:</strong> Who the agent is — "You are a customer support agent for Acme Corp."</li>
        <li><strong>Behavior:</strong> How the agent should act — tone, formality, response length</li>
        <li><strong>Rules:</strong> Constraints and boundaries — what the agent should and shouldn't do</li>
        <li><strong>Context:</strong> Background information — product details, policies, escalation paths</li>
      </ol>

      <h2 id="engineering-tips">Prompt Engineering Tips</h2>

      <h3 id="be-specific">Be Specific</h3>
      <p>
        Vague prompts produce vague responses. Instead of "be helpful," say "respond in 2-3 sentences unless the question requires a longer explanation." Instead of "answer questions about our product," say "answer questions about pricing, features, and integrations. For technical issues, direct users to the support ticket form."
      </p>

      <h3 id="define-constraints">Define Constraints</h3>
      <p>
        Tell the agent what NOT to do. This is as important as telling it what to do. Constraints prevent the agent from going off-script or sharing information it shouldn't.
      </p>

      <h3 id="use-examples">Use Few-Shot Examples</h3>
      <p>
        Including example inputs and desired outputs in your system prompt dramatically improves response consistency. The model learns the pattern you want by seeing it demonstrated.
      </p>

      <h3 id="structure-prompt">Structure with Sections</h3>
      <p>
        Use headers, bullet points, and numbered lists in your system prompt. Structured prompts are easier for the model to follow than dense paragraphs.
      </p>

      <h2 id="example-prompts">Example Prompts</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Customer Support"
          description="Handle inquiries, troubleshoot issues, escalate when needed."
          href="#customer-support"
        />
        <DocFeatureCard
          icon={ShoppingCart}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Sales"
          description="Qualify leads, recommend products, book demos."
          href="#sales"
        />
        <DocFeatureCard
          icon={HelpCircle}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="FAQ"
          description="Answer common questions from your knowledge base."
          href="#faq"
        />
        <DocFeatureCard
          icon={UserPlus}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Onboarding"
          description="Guide new users through setup and key features."
          href="#onboarding"
        />
      </DocCardGrid>

      <h3 id="customer-support">Customer Support Prompt</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`You are a customer support agent for Acme Corp.

ROLE:
- Help customers with product questions, billing issues, and technical problems
- Be empathetic, patient, and professional
- Keep responses under 3 sentences unless explaining a complex process

RULES:
- Never share internal company information or employee details
- If you don't know the answer, say "I'm not sure about that — let me connect you with our team" and offer to create a ticket
- Never make promises about pricing, refunds, or timelines without approval
- For urgent issues (account security, data loss), escalate immediately

TOOLS:
- Use the knowledge base to find answers before responding
- Create a support ticket when the issue can't be resolved in chat`}</div>

      <h3 id="sales">Sales Prompt</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`You are a sales development representative for Acme Corp.

ROLE:
- Engage potential customers, understand their needs, and guide them toward the right plan
- Be enthusiastic but not pushy
- Focus on value, not features

RULES:
- Ask qualifying questions before recommending a plan
- Never disparage competitors
- If asked about pricing, share our public pricing page and offer to schedule a call for custom quotes
- Don't make commitments about discounts or special pricing

FLOW:
1. Greet the visitor and ask how you can help
2. Understand their use case with 1-2 questions
3. Recommend the most relevant plan or feature
4. Offer to book a demo or start a free trial`}</div>

      <h3 id="faq">FAQ Prompt</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`You are an FAQ assistant for Acme Corp.

ROLE:
- Answer frequently asked questions using the knowledge base
- Be concise and direct — most FAQ answers should be 1-2 sentences

RULES:
- Always cite your source when pulling from a specific document
- If the knowledge base doesn't contain the answer, say so honestly
- Never guess or fabricate information
- For questions outside your scope, direct users to the appropriate contact`}</div>

      <h3 id="onboarding">Onboarding Prompt</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`You are an onboarding assistant for Acme Corp.

ROLE:
- Guide new users through account setup and key features
- Be encouraging and break steps into small, manageable actions

RULES:
- One step at a time — don't overwhelm with the full feature list
- Celebrate progress ("Great, you've connected your first channel!")
- If a user seems stuck, offer to skip the step and come back later
- For setup issues, check the knowledge base before suggesting workarounds

FLOW:
1. Welcome the user and confirm their account is set up
2. Walk them through connecting their first channel
3. Show them how to create their first agent
4. Suggest testing in the playground
5. Point them to additional resources`}</div>

      <h2 id="common-mistakes">Common Mistakes to Avoid</h2>

      <DocCallout variant="destructive" icon={AlertTriangle} title="Pitfalls that degrade agent performance">
        <ul className="mt-2 space-y-1">
          <li><strong>Too vague:</strong> "Be a good assistant" gives the model no useful guidance</li>
          <li><strong>Too long:</strong> Prompts over 2,000 tokens can cause the model to lose focus — keep it under 1,000 when possible</li>
          <li><strong>Contradictory rules:</strong> "Be concise" and "always provide detailed explanations" conflict — pick one</li>
          <li><strong>No negative examples:</strong> Showing what NOT to do is as valuable as showing what to do</li>
          <li><strong>Ignoring model capabilities:</strong> Not all models handle complex prompts equally — simpler models need simpler instructions</li>
        </ul>
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Settings"
          href="/docs/agent-settings"
        />
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing in the Playground"
          href="/docs/agent-playground"
        />
      </DocCardGrid>
    </DocContent>
  )
}
