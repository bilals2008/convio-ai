import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquare, MousePointerClick, Sparkles, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WelcomeMessagesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Welcome Messages' },
        ]}
        title="Welcome Messages & Suggested Replies"
        description="The first message a user sees sets the tone for the entire conversation. Configure greeting messages and quick reply buttons to make strong first impressions."
      />

      <h2 id="overview">Overview</h2>
      <p>
        A welcome message is the agent's first interaction with a user. It appears automatically when a conversation starts — before the user types anything. Paired with suggested replies (quick-action buttons), it guides users toward the right conversation path.
      </p>

      <h2 id="setting-up-welcome">Setting Up a Welcome Message</h2>
      <p>
        Navigate to your agent's settings and find the <strong>Welcome Message</strong> section. The welcome message is a plain text field — it supports the same tone and style as your system prompt.
      </p>

      <h3 id="welcome-best-practices">Best Practices</h3>
      <ul>
        <li><strong>Be concise:</strong> 1-2 sentences is ideal. Long greetings overwhelm users.</li>
        <li><strong>Identify the agent:</strong> Tell users who they're talking to — "Hi, I'm Acme's support assistant."</li>
        <li><strong>Set expectations:</strong> Briefly explain what the agent can help with.</li>
        <li><strong>Match your brand:</strong> Formal for enterprise, casual for consumer — the welcome message sets the tone.</li>
      </ul>

      <h3 id="welcome-examples">Example Welcome Messages</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 space-y-3">
        <div>
          <p className="text-[12px] font-heading font-semibold text-foreground mb-1">Customer Support</p>
          <p className="text-[12px] text-muted-foreground">"Hi there! I'm Acme's support assistant. I can help with account questions, billing, and troubleshooting. What can I help you with?"</p>
        </div>
        <div>
          <p className="text-[12px] font-heading font-semibold text-foreground mb-1">Sales</p>
          <p className="text-[12px] text-muted-foreground">"Welcome to Acme! I can help you find the right plan for your team. What are you looking for?"</p>
        </div>
        <div>
          <p className="text-[12px] font-heading font-semibold text-foreground mb-1">Onboarding</p>
          <p className="text-[12px] text-muted-foreground">"Hey! Let's get your Acme account set up. It only takes a few minutes. Ready to start?"</p>
        </div>
      </div>

      <h2 id="suggested-replies">Configuring Suggested Replies</h2>
      <p>
        Suggested replies are quick-action buttons that appear below the welcome message. They give users a starting point and route conversations into specific paths.
      </p>

      <h3 id="adding-suggestions">Adding Suggested Replies</h3>
      <p>
        In the agent settings, find the <strong>Suggested Replies</strong> section. Each reply has two fields:
      </p>
      <ul>
        <li><strong>Label:</strong> The text shown on the button (e.g., "Track my order")</li>
        <li><strong>Message:</strong> The message sent when the user clicks the button (e.g., "I'd like to track my order")</li>
      </ul>

      <DocCallout variant="tip" icon={MousePointerClick} title="Match suggested replies to your agent's capabilities">
        Each button should trigger something your agent can actually handle. Don't add "Talk to a human" as a suggested reply unless your agent is configured to escalate.
      </DocCallout>

      <h3 id="suggestion-examples">Example Configurations</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Button Label</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Sends Message</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Use Case</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Track my order</td>
              <td className="py-2 pr-4">"I'd like to track my order"</td>
              <td className="py-2">E-commerce support</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Billing question</td>
              <td className="py-2 pr-4">"I have a question about my bill"</td>
              <td className="py-2">Account support</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">See pricing</td>
              <td className="py-2 pr-4">"What are your pricing options?"</td>
              <td className="py-2">Sales</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Book a demo</td>
              <td className="py-2 pr-4">"I'd like to schedule a demo"</td>
              <td className="py-2">Sales</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Get started</td>
              <td className="py-2 pr-4">"I'm new — help me get started"</td>
              <td className="py-2">Onboarding</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="first-impressions">Why First Impressions Matter</h2>
      <p>
        Users decide within seconds whether to keep engaging with a chatbot. A vague or missing welcome message increases bounce rates. A clear, helpful greeting with relevant suggested replies keeps users engaged and reduces abandonment.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't overdo it">
        3-5 suggested replies is the sweet spot. More than 5 creates decision paralysis. Fewer than 2 doesn't give users enough direction.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Statuses"
          href="/docs/agent-statuses"
        />
        <DocNextStepCard
          icon={Sparkles}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing in the Playground"
          href="/docs/agent-playground"
        />
      </DocCardGrid>
    </DocContent>
  )
}
