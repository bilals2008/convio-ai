import { Link } from 'react-router-dom'
import { Image, Type, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function ChannelBehaviorPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Channel-Specific Behavior' },
        ]}
        title="Channel-Specific Behavior"
        description="How your agent adapts to each platform's limits — character counts, formatting rules, media handling, and response format."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Each messaging platform has its own constraints. Convio automatically adapts your agent's responses to fit within these limits. Understanding these differences helps you write better system prompts and test more effectively.
      </p>

      <h2 id="character-limits">Character Limits per Platform</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp"
          description="4,096 characters per message. Longer responses are automatically split into multiple messages."
          href="#whatsapp-limits"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram"
          description="4,096 characters per message. Supports HTML or Markdown formatting for rich text."
          href="#telegram-limits"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord"
          description="2,000 characters per message. Uses Discord-flavored Markdown with specific syntax rules."
          href="#discord-limits"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Slack"
          description="40,000 characters per message (but ~30,000 recommended). Uses mrkdwn formatting."
          href="#slack-limits"
        />
      </DocCardGrid>

      <h2 id="formatting-differences">Formatting Differences</h2>

      <h3 id="whatsapp-formatting">WhatsApp</h3>
      <ul>
        <li><strong>Bold:</strong> <code>*text*</code></li>
        <li><strong>Italic:</strong> <code>_text_</code></li>
        <li><strong>Strikethrough:</strong> <code>~text~</code></li>
        <li><strong>Code:</strong> <code>`text`</code></li>
        <li><strong>Links:</strong> Auto-detected, no Markdown syntax needed</li>
      </ul>

      <h3 id="telegram-formatting">Telegram</h3>
      <ul>
        <li><strong>Bold:</strong> <code>*text*</code> or <code>&lt;b&gt;text&lt;/b&gt;</code></li>
        <li><strong>Italic:</strong> <code>_text_</code> or <code>&lt;i&gt;text&lt;/i&gt;</code></li>
        <li><strong>Code:</strong> <code>`text`</code> or <code>&lt;code&gt;text&lt;/code&gt;</code></li>
        <li><strong>Preformatted:</strong> <code>```text```</code></li>
        <li><strong>Links:</strong> <code>[text](url)</code></li>
      </ul>

      <h3 id="discord-formatting">Discord</h3>
      <ul>
        <li><strong>Bold:</strong> <code>**text**</code></li>
        <li><strong>Italic:</strong> <code>*text*</code> or <code>_text_</code></li>
        <li><strong>Code:</strong> <code>`text`</code></li>
        <li><strong>Code block:</strong> <code>```text```</code></li>
        <li><strong>Links:</strong> <code>[text](url)</code></li>
        <li><strong>Embeds:</strong> Rich embeds for structured responses</li>
      </ul>

      <h3 id="slack-formatting">Slack</h3>
      <ul>
        <li><strong>Bold:</strong> <code>*text*</code></li>
        <li><strong>Italic:</strong> <code>_text_</code></li>
        <li><strong>Code:</strong> <code>`text`</code></li>
        <li><strong>Code block:</strong> <code>```text```</code></li>
        <li><strong>Links:</strong> <code>&lt;url|text&gt;</code></li>
        <li><strong>Mentions:</strong> <code>&lt;@USER_ID&gt;</code></li>
      </ul>

      <DocCallout variant="tip" icon={Type} title="Automatic conversion">
        Convio converts your agent's output to the correct format for each channel. Your agent generates plain text or Markdown, and the channel adapter handles the conversion.
      </DocCallout>

      <h2 id="media-handling">Media Handling</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp Media"
          description="Images, documents, audio, video, and stickers. Max 100MB for documents, 16MB for audio/video."
          href="#whatsapp-media"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram Media"
          description="Photos, documents, audio, video, animation, and stickers. Max 50MB for all types."
          href="#telegram-media"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord Media"
          description="Images, files, audio, and video via embeds. Max 8MB per file, 25MB forNitro users."
          href="#discord-media"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Slack Media"
          description="Files and images via upload. Max 1GB per file. Supports drag-and-drop uploads."
          href="#slack-media"
        />
      </DocCardGrid>

      <h2 id="response-adaptation">Response Adaptation</h2>
      <p>
        Convio adapts agent responses based on channel constraints:
      </p>

      <h3 id="auto-splitting">Automatic Splitting</h3>
      <p>
        Responses exceeding the channel's character limit are automatically split into multiple messages. Split points are chosen at natural breaks — paragraphs, sentences, or list items — to maintain readability.
      </p>

      <h3 id="fallback-responses">Fallback Responses</h3>
      <p>
        When a channel doesn't support a feature (e.g., media on a text-only channel), Convio provides alternatives:
      </p>
      <ul>
        <li>Images are replaced with a text description</li>
        <li>Interactive buttons are converted to a numbered list</li>
        <li>Rich embeds are flattened to plain text</li>
      </ul>

      <h3 id="context-limits">Context Window Adaptation</h3>
      <p>
        Different channels have different message retention. Convio adjusts the context window sent to the agent based on what the channel can actually retrieve:
      </p>
      <ul>
        <li><strong>WhatsApp:</strong> Full conversation history available</li>
        <li><strong>Discord:</strong> History limited by channel permissions and message age</li>
        <li><strong>Telegram:</strong> Full history for bot-created conversations</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Deployments"
          href="/docs/managing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
