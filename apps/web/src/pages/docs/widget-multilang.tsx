import { Globe, Languages, ArrowRight, Settings } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetMultilangPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Multi-language Widget' },
        ]}
        title="Multi-language Widget"
        description="Serve the widget in your visitor's language with automatic detection, translation support, and RTL layouts."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The widget supports multiple languages out of the box. You can set a default language, enable automatic detection, or let the visitor choose. The agent's responses depend on the language configuration of the underlying agent.
      </p>

      <h2 id="language-detection">Language Detection</h2>
      <p>
        The widget detects the visitor's language using the browser's <code>navigator.language</code> value. This is the language set in the visitor's operating system or browser settings.
      </p>

      <h3 id="detection-priority">Detection Priority</h3>
      <ol>
        <li><strong>Explicit config:</strong> If you set a language in the widget config, it uses that</li>
        <li><strong>URL parameter:</strong> <code>?lang=fr</code> in the page URL overrides detection</li>
        <li><strong>Browser setting:</strong> Falls back to <code>navigator.language</code></li>
        <li><strong>Default:</strong> Falls back to the widget's default language</li>
      </ol>

      <h3 id="override-via-url">Override via URL</h3>
      <pre><code>{`https://yoursite.com/page?lang=es`}</code></pre>

      <h2 id="translation-support">Translation Support</h2>
      <p>
        The widget UI elements (button labels, placeholder text, timestamps) can be translated. Convio ships with translations for the most common languages:
      </p>
      <ul>
        <li>English (en)</li>
        <li>Spanish (es)</li>
        <li>French (fr)</li>
        <li>German (de)</li>
        <li>Portuguese (pt)</li>
        <li>Arabic (ar)</li>
        <li>Chinese Simplified (zh)</li>
        <li>Japanese (ja)</li>
      </ul>

      <DocCallout variant="info" title="Custom translations">
        You can provide custom translations for any language by passing a translations object in the widget config. See the configuration reference below.
      </DocCallout>

      <h2 id="rtl">RTL Layouts</h2>
      <p>
        The widget automatically switches to right-to-left (RTL) layout for languages like Arabic, Hebrew, and Farsi. This includes:
      </p>
      <ul>
        <li>Message alignment (right-aligned for RTL)</li>
        <li>Chat bubble position (mirrored)</li>
        <li>Input field text direction</li>
        <li>Scrollbar position</li>
        <li>Icon and avatar placement</li>
      </ul>

      <h2 id="language-config">Language Configuration</h2>
      <p>
        Set the language in the widget config object:
      </p>
      <pre><code>{`<script>
  window.ConvioConfig = {
    language: "fr",
    autoDetectLanguage: true,
    translations: {
      "fr": {
        placeholder: "Tapez votre message...",
        sendButton: "Envoyer",
        greeting: "Bonjour! Comment puis-je vous aider?"
      }
    }
  };
</script>
<script
  src="https://cdn.convio.app/widget.js"
  data-widget-id="abc123"
  data-public-key="pk_live_xyz"
  async
></script>`}</code></pre>

      <h3 id="config-options">Configuration Options</h3>
      <ul>
        <li><code>language</code> — Default language code (ISO 639-1)</li>
        <li><code>autoDetectLanguage</code> — Enable/disable browser language detection (default: true)</li>
        <li><code>translations</code> — Object mapping language codes to translation strings</li>
      </ul>

      <h2 id="agent-language">Agent Language</h2>
      <p>
        The widget's language setting affects the UI, but the agent's response language depends on the agent's system prompt. If you need the agent to respond in French, include that instruction in the agent's prompt:
      </p>
      <pre><code>{`You are a customer support agent. Always respond in the same language the visitor writes in. If they write in French, respond in French.`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Appearance"
          href="/docs/widget-appearance"
        />
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Allowed Domains"
          href="/docs/allowed-domains"
        />
      </DocCardGrid>
    </DocContent>
  )
}
