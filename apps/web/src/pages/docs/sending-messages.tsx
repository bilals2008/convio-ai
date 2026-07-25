import { Link } from 'react-router-dom'
import { Send, AlertTriangle, Pencil, MessageSquare } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SendingMessagesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Sending Messages' },
        ]}
        title="Sending Messages"
        description="Send manual replies from the dashboard, interrupt AI responses, and understand formatting rules and message limits."
      />

      <h2 id="manual-replies">Manual Replies from the Dashboard</h2>
      <p>
        Human agents can send messages directly from the conversation view. Click the reply input at the bottom of any open conversation and type your response.
      </p>
      <ul>
        <li>Manual replies are sent as the logged-in human agent, not the AI</li>
        <li>The user sees the message immediately on their channel</li>
        <li>The message appears in the conversation history with the human agent's name</li>
        <li>Token usage is not incurred for human-sent messages</li>
      </ul>

      <DocCallout variant="info" icon={Pencil} title="Human agent identity">
        Messages sent from the dashboard carry the human agent's display name and avatar. This distinguishes them from AI-generated responses in the conversation history.
      </DocCallout>

      <h2 id="interrupting">Interrupting AI Responses</h2>
      <p>
        When the AI is generating a response, you can interrupt it before it completes. This is useful when:
      </p>
      <ul>
        <li>The AI is about to say something incorrect</li>
        <li>You want to take over the conversation manually</li>
        <li>The AI is stuck in a loop or giving a lengthy response</li>
      </ul>

      <h3 id="how-to-interrupt">How to Interrupt</h3>
      <p>
        While the AI is streaming a response, a <strong>Stop</strong> button appears next to the input field. Click it to halt the generation immediately. The partial response is saved and visible in the conversation — the user sees whatever was generated before the interruption.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Partial responses are visible">
        When you interrupt a streaming response, the user sees the incomplete message up to the point of interruption. There is no way to hide the partial response after the fact.
      </DocCallout>

      <h2 id="response-formatting">Response Formatting</h2>
      <p>
        Messages sent from the dashboard support basic formatting:
      </p>
      <ul>
        <li><strong>Bold:</strong> Wrap text in double asterisks — <code>**bold**</code></li>
        <li><strong>Italic:</strong> Wrap text in single asterisks — <code>*italic*</code></li>
        <li><strong>Code:</strong> Wrap inline code in backticks — <code>`code`</code></li>
        <li><strong>Links:</strong> Standard markdown links — <code>[text](url)</code></li>
        <li><strong>Line breaks:</strong> Shift+Enter for a new line within a message</li>
      </ul>

      <p>
        Channel-specific rendering applies automatically. For example, WhatsApp does not support markdown, so bold and italic are converted to plain text equivalents.
      </p>

      <h2 id="message-limits">Message Length Limits</h2>
      <p>
        Each channel imposes its own message length limits:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Channel</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Max Length</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Behavior on Exceed</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Web Widget</td>
              <td className="py-2 pr-4">10,000 characters</td>
              <td className="py-2">Truncated with indicator</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">WhatsApp</td>
              <td className="py-2 pr-4">4,096 characters</td>
              <td className="py-2">Split into multiple messages</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Telegram</td>
              <td className="py-2 pr-4">4,096 characters</td>
              <td className="py-2">Split into multiple messages</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">API</td>
              <td className="py-2 pr-4">No limit (configurable)</td>
              <td className="py-2">Returns error if exceeded</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Send}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Message Streaming"
          href="/docs/message-streaming"
        />
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Reading Messages"
          href="/docs/reading-messages"
        />
      </DocCardGrid>
    </DocContent>
  )
}
