import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Zap, Smile, List, FileText, Image, Clock, Radio, Users, Shield, Bell, MessageCircle } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Zap,
    title: 'Typing Indicators',
    desc: 'Send "typing_on" and "typing_off" payloads via Kapso/Twilio while the agent generates a response. Users see a real-time typing bubble, making the experience feel responsive.',
    example: 'User sends a message → Convio sends typing indicator → Agent generates → Reply sent → Typing stopped.',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'After receiving message, before chatWithAgent(), call Kapso API POST /messages with `"type":"typing_on"`. Use Twilio\'s StatusCallback.',
    implFile: 'whatsapp.ts → processIncomingMessage()',
  },
  {
    icon: Smile,
    title: 'Reaction Support',
    desc: 'React to user messages with emoji reactions (👍 thumbs up confirmation, ❌ on error). Improves feedback loop without sending extra text messages.',
    example: 'After agent sends a reply, react to the user\'s original message with 👍 to confirm receipt.',
    file: 'apps/api/src/services/kapso-platform.ts',
    impl: 'Use WhatsApp Business API `reactions` endpoint: `POST /{phone-number-id}/messages` with `{"type":"reaction","reaction":{"message_id":"original-msg-id","emoji":"👍"}}`. Map agent status (success → 👍, error → ❌).',
    implFile: 'kapso-platform.ts → add sendReaction()',
  },
  {
    icon: List,
    title: 'Interactive Buttons & Lists',
    desc: 'Send quick reply buttons and interactive list menus for structured choices (e.g., "Talk to Sales" | "Get Support" | "Check Order Status"). Users tap instead of typing.',
    example: 'User asks "I need help" → Agent sends: "What kind? [Support] [Billing] [Sales]" → User taps → Agent routes accordingly.',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Use interactive message type. Button payload: `{"type":"interactive","interactive":{"type":"button","body":{"text":"How can I help?"},"action":{"buttons":[{"type":"reply","reply":{"id":"btn_1","title":"Support"}}]}}}`. List: use `type:"list"` with sections and rows.',
    implFile: 'whatsapp.ts → sendWhatsAppMessage() — add interactive message types',
  },
  {
    icon: FileText,
    title: 'Template Messages',
    desc: 'Send pre-approved WhatsApp templates for notifications, OTPs, order confirmations, appointment reminders. Required for proactive (out-of-session) messaging.',
    example: 'Daily report: "📊 Your daily analytics: 45 conversations, 120 messages. View full report: <link>"',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Register templates in Meta Business Manager. Send via `{"type":"template","template":{"name":"order_confirmation","language":{"code":"en"}}}`. Store template registry in DB or config.',
    implFile: 'whatsapp.ts → new sendTemplateMessage()',
  },
  {
    icon: Image,
    title: 'Media Send (Images, Docs, Audio)',
    desc: 'Send rich media back to users — not just text. Product images, PDF receipts, voice messages, video tutorials.',
    example: 'User: "Show me the pro plan pricing." → Agent sends image of pricing table + "Here you go!"',
    file: 'apps/api/src/services/kapso-platform.ts',
    impl: 'Use Kapso media endpoint: `POST /{phone-number-id}/messages` with `{"type":"image","image":{"id":"media-id"}}`. First upload media via `POST /{phone-number-id}/media` with multipart form.',
    implFile: 'kapso-platform.ts → add sendMediaMessage(), uploadMedia()',
  },
  {
    icon: Clock,
    title: 'Business Hours Auto-Reply',
    desc: 'When a message arrives outside working hours, auto-reply with "We\'re currently offline. We\'ll get back to you by 9 AM." Prevents ghosting.',
    example: 'User messages at 11 PM → Auto-reply: "🕐 Thanks for your message! Our team is offline. We\'ll respond by 9 AM tomorrow."',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Store business hours in org config (`org.config.businessHours`). In `processIncomingMessage()`, check current time against hours. If outside, send auto-reply and mark conversation as `snoozed`.',
    implFile: 'whatsapp.ts → processIncomingMessage() — add business hours check',
  },
  {
    icon: Radio,
    title: 'Message Status Callbacks',
    desc: 'Receive delivery receipts (sent/delivered/read/failed) from WhatsApp and update message status in the database. Enables retry logic on failures.',
    example: 'Message sent → Status webhook: "read" → UI shows ✓✓ blue ticks → If "failed", retry after 5s.',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Register webhook for `messages` event (statuses). Handle `statuses[0].status` values: `sent`, `delivered`, `read`, `failed`. Update `Message.status` in DB. On failed, implement retry with exponential backoff (max 3).',
    implFile: 'whatsapp.ts → new handleStatusCallback()',
  },
  {
    icon: Users,
    title: 'Group Support',
    desc: 'Handle WhatsApp group mentions — agent joins groups and responds when @mentioned. Identify sender within group context.',
    example: 'User @mentions bot in group "Support Channel" → Bot reads context + sender info → Replies in thread.',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'In Kapso webhook payload, check `context.group_id` or `context.group_subject`. Create conversations keyed by `{groupId}:{author}`. Format replies with sender mention.',
    implFile: 'whatsapp.ts → processIncomingMessage() — handle group context',
  },
  {
    icon: Shield,
    title: 'Rich Opt-In / Opt-Out',
    desc: 'GDPR-compliant opt-in/opt-out flow. Users can "STOP" to unsubscribe, "START" to resubscribe. Track consent status per contact.',
    example: 'User: "STOP" → Auto-reply: "You\'ve unsubscribed from messages. Reply START to resubscribe." → Status: opted_out.',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Check message body against opt-out keywords (`stop`, `unsubscribe`, `cancel`). Update `Contact.optInStatus`. Block send if opted_out. Add `optInStatus` to Conversation/Contact schema.',
    implFile: 'whatsapp.ts → processIncomingMessage() — add opt-in check',
  },
  {
    icon: Bell,
    title: 'Scheduled Broadcasts',
    desc: 'Send campaign messages to a contact list on a schedule. Useful for promotions, reminders, weekly digests.',
    example: 'Every Monday 9 AM: "📬 Weekly digest: You had 12 conversations this week. Reply \'summary\' for details."',
    file: 'apps/api/src/services/whatsapp.ts',
    impl: 'Create a new `Broadcast` model (name, templateId, schedule cron, contactFilter). Use a cron job / queue worker to process. Rate-limit to 250 messages/phone-number/day (WhatsApp limit).',
    implFile: 'apps/api/src/services/ → new broadcasts.ts',
  },
]

export default function WhatsAppFeaturesPage() {
  return (
    <div>
      <DocHeading as="h1">WhatsApp Features (Coming Soon)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Upcoming WhatsApp enhancements for Convio agents, with implementation notes to help the team build consistently.
      </p>

      <div className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 mt-0.5">
                  <Icon className="size-3.5 text-emerald-500" />
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
                  <MessageCircle className="size-3" />
                  <span>Target: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{feature.implFile}</code></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-10 pt-6 border-t">
        <Link to="/docs/plan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Integration Plan
          </Button>
        </Link>
        <Link to="/docs/discord-features">
          <Button size="sm">
            Next: Discord Features
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
