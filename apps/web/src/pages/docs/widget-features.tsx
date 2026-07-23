import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bell, Palette, Upload, ExternalLink, Eye, FileText, Link2, Zap, Moon, BarChart3, List, Globe } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Bell,
    title: 'Floating Chat Bubble',
    desc: 'Draggable chat bubble pinned to bottom-right of any webpage. Shows unread badge count. Minimizable. Animates in/out smoothly.',
    example: 'User visits support page → Chat bubble appears → Unread(1) badge "Got a question?" → User clicks → Widget opens.',
    file: 'apps/web/src/components/widget/',
    impl: 'Create `<ChatWidget />` component fixed `bottom-4 right-4 z-50`. Use `position: fixed` + drag handler. Unread badge via Zustand/context. Animate with framer-motion or CSS transitions.',
    implFile: 'components/widget/chat-widget.tsx',
  },
  {
    icon: Palette,
    title: 'Customizable Theme',
    desc: 'Brand colors, position (BL/BR), size, font, border radius, avatar image. Configurable from Convio dashboard → Widget settings.',
    example: 'Acme Corp sets primary=#FF5500, position=bottom-left, avatar=acme-logo.png → Widget renders with orange theme and company logo.',
    file: 'apps/web/src/components/widget/',
    impl: 'Accept `WidgetConfig` prop: `{primaryColor, position, size, avatar, fontFamily}`. Inject CSS variables `--widget-primary`, `--widget-radius`. Store config in deployment settings.',
    implFile: 'components/widget/chat-widget.tsx → theme config',
  },
  {
    icon: Upload,
    title: 'File/Image Upload',
    desc: 'Users can send screenshots, PDFs, and images to the agent. Upload via drag-drop or file picker. Preview before sending.',
    example: 'User drags screenshot.png → Preview shows → User clicks send → Agent analyzes image and responds: "I can see the error in your screenshot."',
    file: 'apps/web/src/components/widget/',
    impl: 'Add file input (hidden) + drag zone. Show thumbnail preview. Upload to presigned S3 URL or convert to base64 for small files. Pass to agent as context.',
    implFile: 'components/widget/chat-input.tsx → add file upload',
  },
  {
    icon: ExternalLink,
    title: 'Conversation History Persistence',
    desc: 'Chat history survives page refresh via localStorage/IndexedDB. Users don\'t lose context when navigating pages.',
    example: 'User chats on /pricing → Navigates to /docs → Widget preserves history → Continues conversation seamlessly.',
    file: 'apps/web/src/components/widget/',
    impl: 'Serialize messages to localStorage keyed by `widget:conversation:{agentId}`. On mount, restore from localStorage. On send, append. Max 100 messages stored.',
    implFile: 'components/widget/chat-widget.tsx → useConversationHistory hook',
  },
  {
    icon: Bell,
    title: 'Typing Indicator',
    desc: 'Show animated "Agent is typing..." dots while waiting for a response. Uses SSE or polling. Makes the bot feel alive.',
    example: 'User sends message → Dots appear: "..." → Agent responds → Dots disappear → Reply shown.',
    file: 'apps/web/src/components/widget/',
    impl: 'SSE approach: server sends `event: typing` before response. Widget listens and shows dots. Timeout after 30s.',
    implFile: 'components/widget/chat-messages.tsx → typing indicator',
  },
  {
    icon: Eye,
    title: 'Attachment Preview',
    desc: 'Inline preview of images/files before sending. Supports images, PDF thumbnails, document icons. Cancel button to remove.',
    example: 'User picks screenshot.png → Thumbnail appears above input with "X" → User can review before sending.',
    file: 'apps/web/src/components/widget/',
    impl: 'FileReader API to generate object URL. Render in scrollable attachment strip. Remove from list on cancel.',
    implFile: 'components/widget/chat-input.tsx → attachment preview',
  },
  {
    icon: FileText,
    title: 'Offline Form',
    desc: 'When agent is unavailable (after hours, rate limited), show an email collection form. Messages are queued for follow-up.',
    example: 'Agent offline → Widget shows: "We\'re away. Leave your email and we\'ll reply!" → User submits → Stored in DB for follow-up.',
    file: 'apps/web/src/components/widget/',
    impl: 'Check `agent.status === "offline"` from config endpoint. Render `<OfflineForm>` with email + message fields. POST to `/api/widget/offline-message`.',
    implFile: 'components/widget/offline-form.tsx',
  },
  {
    icon: Link2,
    title: 'User Identity (Authenticated Widget)',
    desc: 'Pass logged-in user info (name, email, avatar) from your app to the widget. Agent greets user by name and has context.',
    example: 'Logged in as "John" → Widget loads → "Hi John! How can I help?" → Agent knows John\'s previous conversations.',
    file: 'apps/web/src/components/widget/',
    impl: 'Accept `userToken` prop → Backend verifies JWT → Sets `contactName` and `contactEmail` on conversation. Or pass via `window.__CONVIO_USER`.',
    implFile: 'components/widget/chat-widget.tsx → user identity prop',
  },
  {
    icon: Zap,
    title: 'Proactive Messages',
    desc: 'Widget auto-opens with a message after N seconds on page. Or triggers on exit intent. Configurable delay and message.',
    example: 'User on pricing page for 15s → Widget pops: "Need help choosing a plan? I can help compare!"',
    file: 'apps/web/src/components/widget/',
    impl: 'Use `setTimeout` after page load. Track with `useEffect`. `widgetConfig.proactiveDelay: 15`. Show by toggling open state. Exit intent: `document.addEventListener("mouseleave")`.',
    implFile: 'components/widget/chat-widget.tsx → proactive trigger',
  },
  {
    icon: Moon,
    title: 'Dark Mode Support',
    desc: 'Automatically respects system dark mode (`prefers-color-scheme: dark`). Uses CSS variables for seamless integration.',
    example: 'User has dark mode → Widget renders with dark background, light text, dimmed accent colors.',
    file: 'apps/web/src/components/widget/',
    impl: 'Use `matchMedia("(prefers-color-scheme: dark)")`. Toggle `.dark` class. Define `--widget-bg`, `--widget-text`, `--widget-input-bg` for both themes.',
    implFile: 'components/widget/ → dark mode CSS variables',
  },
  {
    icon: BarChart3,
    title: 'Analytics (Open Rate, Messages, Resolution)',
    desc: 'Track widget performance: opens, messages sent, conversations started, resolution rate. Visible in Convio Analytics.',
    example: 'Dashboard: Widget has 1,234 opens, 456 conversations, 89% resolution rate this month. Peak usage: 2-4 PM.',
    file: 'apps/web/src/components/widget/',
    impl: 'Fire analytics events: `widget_opened`, `message_sent`, `conversation_started`, `conversation_closed`. POST to `/api/analytics/events`.',
    implFile: 'components/widget/ → analytics tracking hook',
  },
  {
    icon: List,
    title: 'Home Menu (Quick Action Cards)',
    desc: 'Show action cards on widget open — "Talk to Sales", "View Docs", "Check Order Status". Like Botpress or Intercom home screen.',
    example: 'Widget opens → Shows 3 cards: ["💬 Talk to Support", "📚 Browse FAQs", "🚚 Track Order"] → User taps → Agent handles intent.',
    file: 'apps/web/src/components/widget/',
    impl: 'Widget config stores `homeMenu` array: `[{id, icon, label, description}]`. Render as cards grid. On click, send that as first message.',
    implFile: 'components/widget/chat-home.tsx',
  },
]

export default function WidgetFeaturesPage() {
  return (
    <div>
      <DocHeading as="h1">Widget Features (Coming Soon)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Upcoming web widget enhancements for Convio agents, with implementation notes to help the team build consistently.
      </p>

      <div className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 mt-0.5">
                  <Icon className="size-3.5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{feature.file}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
              <div className="ml-10 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Example</p>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{feature.example}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Implementation</p>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{feature.impl}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Globe className="size-3" />
                  <span>Target: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{feature.implFile}</code></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-10 pt-6 border-t">
        <Link to="/docs/discord-features">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Discord Features
          </Button>
        </Link>
        <Link to="/docs/api-features">
          <Button size="sm">
            Next: API Features
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
