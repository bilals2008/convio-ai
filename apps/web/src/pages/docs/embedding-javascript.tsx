import { Code, Terminal, Zap, Webhook } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function EmbeddingJavascriptPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Embedding with JavaScript API' },
        ]}
        title="Embedding with JavaScript API"
        description="Programmatically control the widget — open, close, send messages, and listen to events."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The JavaScript API gives you full programmatic control over the widget. Use it to trigger conversations, respond to user actions, or build custom integrations beyond the standard embed.
      </p>

      <h2 id="global-object">The Convio Global Object</h2>
      <p>
        After the widget script loads, a global <code>Convio</code> object is available on the <code>window</code>. It exposes methods and events for controlling the widget.
      </p>

      <h2 id="methods">Core Methods</h2>

      <h3 id="open">Convio.open()</h3>
      <p>
        Opens the chat window programmatically.
      </p>
      <pre><code>{`// Open the widget
Convio.open();

// Open with a specific message pre-filled
Convio.open({ message: "I need help with pricing" });`}</code></pre>

      <h3 id="close">Convio.close()</h3>
      <p>
        Closes the chat window. The conversation state is preserved.
      </p>
      <pre><code>{`Convio.close();`}</code></pre>

      <h3 id="toggle">Convio.toggle()</h3>
      <p>
        Toggles the widget between open and closed states.
      </p>
      <pre><code>{`Convio.toggle();`}</code></pre>

      <h3 id="send-message">Convio.sendMessage()</h3>
      <p>
        Sends a message as the visitor. The message goes through the same pipeline as a manually typed message.
      </p>
      <pre><code>{`Convio.sendMessage("What are your pricing plans?");

// Send a message and open the widget
Convio.sendMessage("I need support");`}</code></pre>

      <DocCallout variant="tip" icon={Zap} title="Auto-opens on send">
        Calling <code>sendMessage()</code> automatically opens the widget if it's closed. You don't need to call <code>open()</code> first.
      </DocCallout>

      <h3 id="set-visitor">Convio.setVisitor()</h3>
      <p>
        Pre-fill visitor information before the conversation starts.
      </p>
      <pre><code>{`Convio.setVisitor({
  name: "John Doe",
  email: "john@example.com",
  metadata: {
    plan: "enterprise",
    company: "Acme Corp"
  }
});`}</code></pre>

      <h2 id="events">Event Listeners</h2>
      <p>
        Listen to widget lifecycle events to build custom integrations.
      </p>

      <h3 id="available-events">Available Events</h3>
      <ul>
        <li><code>widget:opened</code> — Fired when the chat window opens</li>
        <li><code>widget:closed</code> — Fired when the chat window closes</li>
        <li><code>message:sent</code> — Fired when a visitor message is sent</li>
        <li><code>message:received</code> — Fired when an agent message is received</li>
        <li><code>conversation:started</code> — Fired when a new conversation begins</li>
      </ul>

      <h3 id="listening-events">Listening to Events</h3>
      <pre><code>{`Convio.on('widget:opened', () => {
  console.log('Widget opened');
  analytics.track('chat_widget_opened');
});

Convio.on('message:received', (message) => {
  console.log('Agent said:', message.text);
});

Convio.on('conversation:started', (conversation) => {
  console.log('New conversation:', conversation.id);
});`}</code></pre>

      <h2 id="custom-integration">Custom Integration Patterns</h2>

      <h3 id="pattern-auth">Pre-fill from Authentication</h3>
      <p>
        If your site has user authentication, pass the user's info to the widget:
      </p>
      <pre><code>{`// After user logs in
Convio.setVisitor({
  name: user.displayName,
  email: user.email,
  metadata: { userId: user.id }
});`}</code></pre>

      <h3 id="pattern-analytics">Analytics Integration</h3>
      <p>
        Track widget usage alongside your existing analytics:
      </p>
      <pre><code>{`Convio.on('conversation:started', () => {
  gtag('event', 'chat_conversation_start');
});

Convio.on('message:sent', (msg) => {
  mixpanel.track('chat_message_sent', { length: msg.text.length });
});`}</code></pre>

      <h3 id="pattern-support">Help Desk Trigger</h3>
      <p>
        Open the widget when a visitor clicks a help button elsewhere on the page:
      </p>
      <pre><code>{`document.getElementById('help-btn').addEventListener('click', () => {
  Convio.open({ message: "I need help" });
});`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Code}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Public API"
          href="/docs/widget-public-api"
        />
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Your Widget"
          href="/docs/testing-widget"
        />
      </DocCardGrid>
    </DocContent>
  )
}
