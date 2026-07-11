import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, RotateCcw, Send, ChevronRight } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon, WebIcon } from './channel-icons'

const CHANNELS = [
  { name: 'Web', icon: WebIcon },
  { name: 'WhatsApp', icon: WhatsAppIcon },
  { name: 'Telegram', icon: TelegramIcon },
  { name: 'Discord', icon: DiscordIcon },
  { name: 'Slack', icon: SlackIcon },
]

const ACCENTS = ['#fb923c', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#ef4444']

const CONVERSATIONS: Record<string, { from: 'bot' | 'user'; text: string }[]> = {
  Web: [
    { from: 'bot', text: 'Hi! I\'m your Convio assistant. How can I help today?' },
    { from: 'user', text: 'What are your opening hours?' },
    { from: 'bot', text: 'We\'re open Mon–Fri, 9am–6pm. Want me to book a call?' },
    { from: 'user', text: 'Sure, Thursday at 2pm works.' },
    { from: 'bot', text: 'Done! I\'ve booked Thursday 2pm 🎉 You\'ll get a reminder.' },
  ],
  WhatsApp: [
    { from: 'bot', text: 'Hey there! 👋 Welcome to Convio support.' },
    { from: 'user', text: 'I need help with my order' },
    { from: 'bot', text: 'Sure! Can you share your order number?' },
    { from: 'user', text: 'ORD-2847' },
    { from: 'bot', text: 'Found it! Your order ships tomorrow 📦' },
  ],
  Telegram: [
    { from: 'bot', text: 'Hello! Ask me anything about our product.' },
    { from: 'user', text: 'What plans do you offer?' },
    { from: 'bot', text: 'Free, Pro ($29/mo), and Enterprise. Want details?' },
    { from: 'user', text: 'Tell me about Pro' },
    { from: 'bot', text: 'Pro includes unlimited agents, priority support, and custom branding ✨' },
  ],
  Discord: [
    { from: 'bot', text: 'Welcome to the server! 🎮 I can help with anything.' },
    { from: 'user', text: 'How do I set up my bot?' },
    { from: 'bot', text: 'Go to Dashboard → Agents → Create New. Takes 2 minutes!' },
    { from: 'user', text: 'Can I use GPT-4?' },
    { from: 'bot', text: 'Yes! We support GPT-4, Claude, Gemini, and 10+ more models.' },
  ],
  Slack: [
    { from: 'bot', text: 'Hi! I\'m your team\'s AI assistant. What can I do for you?' },
    { from: 'user', text: 'Summarize today\'s standup' },
    { from: 'bot', text: '3 items: 1) API v2 shipped ✅ 2) Design review at 3pm 3) Bug #412 in progress' },
    { from: 'user', text: 'Create a ticket for the bug' },
    { from: 'bot', text: 'Ticket PROJ-891 created and assigned to @dev-team 🎯' },
  ],
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
      className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
    >
      {copied ? <><Check className="size-3.5" />Copied</> : <><Copy className="size-3.5" />Copy</>}
    </button>
  )
}

function TypingIndicator({ accent }: { accent: string }) {
  return (
    <div className="self-start flex items-center gap-1 bg-card border border-border rounded-xl rounded-bl-sm px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full"
          style={{ backgroundColor: accent }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: [0.23, 1, 0.32, 1],
          }}
        />
      ))}
    </div>
  )
}

function PhoneMockup({
  accent,
  botName,
  channel,
  showTyping,
}: {
  accent: string
  botName: string
  channel: string
  showTyping: boolean
}) {
  const [visibleCount, setVisibleCount] = useState(0)
  const messages = CONVERSATIONS[channel] || CONVERSATIONS.Web
  const scrollRef = useRef<HTMLDivElement>(null)
  const ChannelIcon = CHANNELS.find((c) => c.name === channel)?.icon ?? WebIcon

  useEffect(() => {
    setVisibleCount(0)
    let count = 0
    let interval: ReturnType<typeof setInterval>
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        count++
        setVisibleCount(count)
        if (count >= messages.length) clearInterval(interval)
      }, 280)
    }, 200)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [channel, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleCount, showTyping])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative w-[260px] h-full max-h-[520px] rounded-[28px] border border-border/60 overflow-hidden flex flex-col shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15),0_2px_8px_-2px_rgba(0,0,0,0.08)]"
        style={{ background: 'color-mix(in oklab, var(--background) 94%, var(--foreground))' }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-0 inset-x-0 flex justify-center pt-2 z-10">
          <div className="w-20 h-5 rounded-full bg-foreground/90" />
        </div>

        {/* Chat header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={channel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center gap-2.5 px-4 pt-8 pb-3 border-b border-border/50 shrink-0"
            style={{ background: accent }}
          >
            <div className="size-8 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-background">
              <ChannelIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-background truncate">{botName}</div>
              <div className="text-[10px] text-background/70 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-background/70 inline-block" />
                online
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.slice(0, visibleCount).map((m, i) => (
              <motion.div
                key={`${channel}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className={`max-w-[82%] text-[11px] leading-snug px-2.5 py-2 rounded-2xl ${
                  m.from === 'user'
                    ? 'self-end text-background rounded-br-md'
                    : 'self-start rounded-bl-md border border-border/50'
                }`}
                style={
                  m.from === 'user'
                    ? { backgroundColor: accent }
                    : { backgroundColor: 'color-mix(in oklab, var(--card) 85%, var(--border))' }
                }
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {showTyping && visibleCount >= messages.length && (
            <TypingIndicator accent={accent} />
          )}
        </div>

        {/* Input bar */}
        <div className="p-2.5 border-t border-border/50 flex items-center gap-2 shrink-0">
          <div className="flex-1 h-8 rounded-full bg-card border border-border/60 px-3.5 flex items-center text-[10px] text-muted-foreground/60">
            Type a message…
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="size-8 rounded-full flex items-center justify-center text-background cursor-pointer"
            style={{ backgroundColor: accent }}
          >
            <Send className="size-3.5" />
          </motion.div>
        </div>
      </div>

      {/* Glow under phone */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[60%] h-6 rounded-full blur-2xl opacity-25"
        style={{ backgroundColor: accent }}
      />
    </div>
  )
}

export function ChatPreview() {
  const [channel, setChannel] = useState('Web')
  const [accent, setAccent] = useState('#fb923c')
  const [botName, setBotName] = useState('Convio Assistant')
  const [showTyping, setShowTyping] = useState(true)

  const embedSnippet = `<script src="https://cdn.convio.ai/widget.js" data-bot="YOUR_BOT_ID" data-accent="${accent}"></script>`

  return (
    <section className="max-w-[1160px] mx-auto px-5 md:px-10 py-16 md:py-24">
      <ScrollReveal>
        <div className="text-center mb-10">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">Live Preview</div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Pick a channel. Make it yours.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Same brain across every channel. Choose one, then tweak the look and watch the
            whole experience update live.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Channel tabs — top bar */}
          <div className="flex gap-1.5 p-2 bg-secondary/30 border-b border-border">
            {CHANNELS.map((c) => {
              const active = c.name === channel
              return (
                <button
                  key={c.name}
                  onClick={() => setChannel(c.name)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <c.icon className="size-4" style={active ? { color: accent } : undefined} />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>

          {/* Main content: phone center, controls right */}
          <div className="grid lg:grid-cols-[1fr_300px] min-h-[480px]">
            {/* Center — phone preview (hero) */}
            <div className="p-6 lg:p-8 flex items-center justify-center border-r border-border">
              <PhoneMockup
                accent={accent}
                botName={botName}
                channel={channel}
                showTyping={showTyping}
              />
            </div>

            {/* Right — controls (compact, fills height) */}
            <div className="p-5 flex flex-col gap-4">
              {/* Embed snippet */}
              <div className="bg-secondary/50 rounded-xl p-4 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-muted-foreground font-medium">Embed snippet</span>
                  <CopyButton text={embedSnippet} />
                </div>
                <pre className="text-[11px] font-mono text-foreground/70 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {embedSnippet}
                </pre>
              </div>

              {/* Accent picker */}
              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">Accent</label>
                <div className="grid grid-cols-4 gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      aria-label={`Set accent ${c}`}
                      className={`w-full aspect-square rounded-lg transition-all duration-200 cursor-pointer hover:scale-110 ${
                        accent.toLowerCase() === c.toLowerCase()
                          ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105'
                          : 'border border-border/60 hover:border-border'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Bot name */}
              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">Bot name</label>
                <input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors duration-200"
                />
              </div>

              {/* Typing toggle + reset */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTyping((v) => !v)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                    showTyping
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  Typing: {showTyping ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => { setAccent('#fb923c'); setBotName('Convio Assistant'); setShowTyping(true) }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 cursor-pointer border border-border"
                  title="Reset"
                  aria-label="Reset controls"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>

              {/* Channel info */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 mt-auto">
                <ChevronRight className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Same brain on every channel. <span className="text-foreground font-medium">{botName}</span> on <span className="text-foreground font-medium">{channel}</span> — memory stays the same.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
