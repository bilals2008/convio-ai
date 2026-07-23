import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, GripVertical, Shield, ArrowLeftRight, Hash, Volume2, Edit3, Eye, Smile, MessageSquareText, Search, MessageSquare } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: GripVertical,
    title: 'Message Components (Buttons, Select Menus, Modals)',
    desc: 'Add interactive Discord UI components — buttons for quick actions, select menus for choices, modal forms for structured input.',
    example: 'User: /help → Bot sends: "[Support] [Docs] [Pricing]" buttons → User clicks "Support" → Bot opens modal → User fills form.',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Return `components` array in interaction response. Action rows with `Button` (style 1-5) or `SelectMenu` components. Handle `INTERACTION_COMPONENT` (type 3) and `MODAL_SUBMIT` (type 5) interaction types.',
    implFile: 'discord.ts → processDiscordInteraction() — add component handler',
  },
  {
    icon: Shield,
    title: 'Slash Command Permissions',
    desc: 'Restrict /reset and /session to specific Discord roles. Prevents non-admins from resetting conversations or viewing session data.',
    example: '/reset → Bot checks user roles. If not "Moderator" or "Admin": "❌ You don\'t have permission."',
    file: 'apps/api/src/services/discord.ts',
    impl: 'In command handler, read `interaction.member.roles`. Compare against deployment config `allowedRoles`. Return ephemeral error if unauthorized.',
    implFile: 'discord.ts → processDiscordInteraction() — add role check',
  },
  {
    icon: ArrowLeftRight,
    title: 'Multi-Channel Conversations',
    desc: 'Conversation follows the user across channels. DMs → Server → Thread. Same conversation context regardless of where they message.',
    example: 'User DM: "Hi" → Bot replies → User @mentions bot in #general → Bot replies with same context → User moves to thread → continues.',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Key conversations by `userId` instead of `channelId`. On message, look up existing conversation by userId regardless of source channel.',
    implFile: 'discord.ts → handleDiscordAiReply() — use userId as primary key',
  },
  {
    icon: Hash,
    title: 'Role-Based Agent Switching',
    desc: 'Different Discord roles get routed to different agents. Sales role → Sales agent. Support role → Support agent.',
    example: 'User with "Premium" role → Routes to Premium Agent. User with "Free" role → Routes to Free Agent with limited capabilities.',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Deployment config stores role-to-agentId mappings. On interaction, look up user roles, find matching agent, route to it.',
    implFile: 'discord.ts → processDiscordInteraction() — add agent routing by role',
  },
  {
    icon: Volume2,
    title: 'Voice Channel Activity',
    desc: 'Bot joins voice channels, transcribes speech via STT, processes through AI, replies via TTS. Full voice interaction on Discord.',
    example: 'User in voice: "Hey bot, what\'s the weather?" → Bot transcribes → Processes → TTS replies: "It\'s 72°F and sunny."',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Use Discord Voice Gateway (WebSocket). Join voice via op 4. Receive/send audio via UDP. Integrate with Deepgram/Whisper for STT and 11Labs/Google TTS for speech.',
    implFile: 'apps/api/src/services/ → new discord-voice.ts',
  },
  {
    icon: Edit3,
    title: 'Message Edit Support',
    desc: 'When a user edits their message, update the conversation and regenerate the agent response. Keeps context aligned with latest intent.',
    example: 'User: "What\'s the price?" → Bot replies → User edits to "What\'s the price for pro?" → Bot edits reply with updated pricing.',
    file: 'apps/api/src/services/discord-gateway.ts',
    impl: 'Handle `MESSAGE_UPDATE` gateway event. Update the stored message content in DB. Re-trigger `handleDiscordAiReply` and edit the original bot message via PATCH endpoint.',
    implFile: 'discord-gateway.ts → add handleMessageUpdate()',
  },
  {
    icon: Eye,
    title: 'Ephemeral Replies',
    desc: 'Use Discord\'s `flags: 64` for responses only the invoking user can see. Perfect for /session, /reset confirmation, errors.',
    example: 'User: /reset → Bot replies with ephemeral: "✅ Conversation reset!" (only that user sees it — no channel spam).',
    file: 'apps/api/src/services/discord.ts',
    impl: 'In interaction response, set `flags: 64` (Ephemeral). Already partially supported via deferred response — add flags to initial response payload.',
    implFile: 'discord.ts → processDiscordInteraction() — add flags to responses',
  },
  {
    icon: Smile,
    title: 'Emoji Reaction Actions',
    desc: 'Users react with emoji to trigger actions. 👍 = confirm, ❌ = delete, 📌 = pin. Configurable per deployment.',
    example: 'User reacts 👍 on bot message → Bot confirms: "Glad that helped!" User reacts ❌ → Bot deletes the message.',
    file: 'apps/api/src/services/discord-gateway.ts',
    impl: 'Handle `MESSAGE_REACTION_ADD` gateway event. Map emoji to actions (confirm, retry, delete). Execute action and optionally update or delete message.',
    implFile: 'discord-gateway.ts → add handleMessageReaction()',
  },
  {
    icon: MessageSquareText,
    title: 'Auto-Thread on Every Interaction',
    desc: 'Auto-create a thread for each user interaction (not just the first one). Or thread per user session. Keeps channels clean.',
    example: 'User chats in #general → Bot creates thread "Chat with User123" → All replies go in thread → Channel stays clean.',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Always create thread on first message OR create thread per user (not per conversation). Store threadId in deployment config and reuse.',
    implFile: 'discord.ts → handleDiscordAiReply() — make thread creation per-user',
  },
  {
    icon: Search,
    title: 'Server Onboarding Guide',
    desc: 'Slash command or auto-post that shows a setup guide when bot joins a new server. Explains features, commands, and how to configure.',
    example: 'Bot joins server → Auto-posts in #welcome: "👋 Thanks for adding me! Use /chat to start, /help for commands, /setup to configure."',
    file: 'apps/api/src/services/discord.ts',
    impl: 'Handle `GUILD_CREATE` gateway event (already done — `sendWelcomeMessage`). Expand the welcome embed with interactive buttons to guide setup.',
    implFile: 'discord-gateway.ts → sendWelcomeMessage() — enhance with interactive guide',
  },
]

export default function DiscordFeaturesPage() {
  return (
    <div>
      <DocHeading as="h1">Discord Features (Coming Soon)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Upcoming Discord integrations for Convio agents, with implementation notes to help the team build consistently.
      </p>

      <div className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 mt-0.5">
                  <Icon className="size-3.5 text-indigo-500" />
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
                  <MessageSquare className="size-3" />
                  <span>Target: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{feature.implFile}</code></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-10 pt-6 border-t">
        <Link to="/docs/whatsapp-features">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: WhatsApp Features
          </Button>
        </Link>
        <Link to="/docs/widget-features">
          <Button size="sm">
            Next: Widget Features
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
