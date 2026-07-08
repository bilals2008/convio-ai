import { useState } from 'react'
import { Copy, Check, RotateCcw, Send } from 'lucide-react'
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

const CONVERSATION = [
  { from: 'bot', text: 'Hi! I\'m your Convio assistant. How can I help today?' },
  { from: 'user', text: 'What are your opening hours?' },
  { from: 'bot', text: 'We\'re open Mon–Fri, 9am–6pm. Want me to book a call?' },
  { from: 'user', text: 'Sure, Thursday at 2pm works.' },
  { from: 'bot', text: 'Done! I\'ve booked Thursday 2pm 🎉 You\'ll get a reminder.' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
      className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied ? <><Check className="size-3.5" />Copied</> : <><Copy className="size-3.5" />Copy</>}
    </button>
  )
}

export function ChatPreview() {
  const [channel, setChannel] = useState('Web')
  const [accent, setAccent] = useState('#fb923c')
  const [botName, setBotName] = useState('Convio Assistant')
  const [showTyping, setShowTyping] = useState(true)

  const ChannelIcon = CHANNELS.find((c) => c.name === channel)?.icon ?? WebIcon
  const embedSnippet = `<script src="https://cdn.convio.ai/widget.js" data-bot="YOUR_BOT_ID" data-accent="${accent}"></script>`

  return (
    <section className="max-w-[1160px] mx-auto px-5 md:px-10 py-16">
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

      <div className="bg-card rounded-[14px] overflow-hidden border border-border">
        <div className="grid lg:grid-cols-[320px_1fr]">
          {/* Left — preview + controls */}
          <div className="p-5 lg:p-6 lg:border-r border-b lg:border-b-0 border-border flex flex-col">
            <div
              className="relative w-full max-w-[260px] mx-auto aspect-[9/16] rounded-2xl border border-border overflow-hidden flex flex-col"
              style={{ background: 'color-mix(in oklab, var(--background) 92%, var(--foreground))' }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border" style={{ background: accent }}>
                <div className="size-7 rounded-full bg-background/20 flex items-center justify-center text-background">
                  <ChannelIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-background truncate">{botName}</div>
                  <div className="text-[10px] text-background/70">online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {CONVERSATION.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[80%] text-[11px] leading-snug px-2.5 py-1.5 rounded-xl ${
                      m.from === 'user'
                        ? 'self-end bg-foreground text-background rounded-br-sm'
                        : 'self-start rounded-bl-sm'
                    }`}
                    style={m.from === 'bot' ? { background: 'color-mix(in oklab, var(--card) 80%, var(--border))' } : undefined}
                  >
                    {m.text}
                  </div>
                ))}
                {showTyping && (
                  <div className="self-start bg-card border border-border rounded-xl rounded-bl-sm px-2.5 py-2 flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-2 border-t border-border flex items-center gap-2">
                <div className="flex-1 h-7 rounded-full bg-card border border-border px-3 flex items-center text-[10px] text-muted-foreground">
                  Type a message…
                </div>
                <div className="size-7 rounded-full flex items-center justify-center text-background" style={{ background: accent }}>
                  <Send className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full mt-6 pt-5 border-t border-border flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/60 font-semibold">Controls</span>
                <button
                  onClick={() => { setAccent('#fb923c'); setBotName('Convio Assistant'); setShowTyping(true) }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Reset"
                  aria-label="Reset controls"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>

              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">Accent</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      aria-label={`Set accent ${c}`}
                      className={`w-full aspect-square rounded-md transition-transform hover:scale-110 cursor-pointer ${
                        accent.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'border border-border'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[13px] text-muted-foreground mb-2 block">Bot name</label>
                <input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={() => setShowTyping((v) => !v)}
                className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  showTyping ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                Typing indicator: {showTyping ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Right — channel grid + embed */}
          <div className="p-3 sm:p-4 flex flex-col gap-4">
            <div className="grid grid-cols-5 sm:grid-cols-5 border-l border-t border-border">
              {CHANNELS.map((c) => {
                const active = c.name === channel
                return (
                  <button
                    key={c.name}
                    onClick={() => setChannel(c.name)}
                    className={`aspect-square flex flex-col items-center justify-center gap-1.5 border-r border-b border-border transition-colors cursor-pointer ${
                      active ? 'bg-primary/10 border-primary/30' : 'hover:bg-secondary'
                    }`}
                  >
                    <c.icon className="size-6" style={active ? { color: accent } : undefined} />
                    <span className={`text-[10px] ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{c.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="bg-secondary rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-muted-foreground">Embed snippet</span>
                <CopyButton text={embedSnippet} />
              </div>
              <pre className="text-[12px] font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all">
                {embedSnippet}
              </pre>
            </div>

            <div className="text-[13px] text-muted-foreground leading-relaxed">
              One agent, every channel. Switch tabs to preview how{' '}
              <span className="text-foreground font-medium">{botName}</span> looks on{' '}
              <span className="text-foreground font-medium">{channel}</span> — the brain and
              memory stay the same.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
