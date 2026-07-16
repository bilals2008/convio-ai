import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowUpRight, Zap, Check } from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon, WebIcon } from './channel-icons'

const channels = [
  { name: 'Web', icon: WebIcon },
  { name: 'WhatsApp', icon: WhatsAppIcon },
  { name: 'Telegram', icon: TelegramIcon },
  { name: 'Discord', icon: DiscordIcon },
  { name: 'Slack', icon: SlackIcon },
]

function ProductPreview() {
  const ChatIcon = WebIcon
  return (
    <div className="relative mx-auto max-w-[940px]">
      <div className="absolute -inset-x-12 -top-8 bottom-0 -z-10 rounded-[32px] bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-20px_rgba(0,0,0,0.35)]">
        {/* App chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <div className="mx-auto flex w-fit items-center gap-2 rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
            <ChatIcon className="size-3" />
            app.convio.ai/inbox
          </div>
        </div>

        {/* App body */}
        <div className="grid grid-cols-1 md:grid-cols-[210px_1fr]">
          {/* Sidebar */}
          <aside className="hidden flex-col gap-1 border-r border-border p-3 md:flex">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="size-6 rounded-md bg-primary/15 grid place-items-center">
                <Zap className="size-3.5 text-primary" />
              </div>
              <span className="text-[13px] font-semibold">Convio</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {['Inbox', 'Agents', 'Knowledge', 'Analytics'].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] ${
                    i === 1 ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current opacity-50" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-3 px-2 text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Channels
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5 px-1">
              {channels.map((c) => (
                <div
                  key={c.name}
                  className="grid size-7 place-items-center rounded-md border border-border bg-background text-muted-foreground"
                  title={c.name}
                >
                  <c.icon className="size-3.5" />
                </div>
              ))}
            </div>
          </aside>

          {/* Conversation */}
          <div className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-foreground">Support Agent</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Online
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[12px] leading-relaxed text-primary-foreground">
                What's your refund policy for annual plans?
              </div>
            </div>

            {/* AI message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-2.5 text-[12px] leading-relaxed text-foreground">
                Annual plans include a <span className="font-medium">30-day full refund</span> and
                prorated credits after that. I pulled this from your{' '}
                <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  📄 policy.pdf
                </span>{' '}
                knowledge base.
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Check className="size-3 text-primary" />
                  Answered from RAG · 0.4s
                </div>
              </div>
            </div>

            {/* typing */}
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Restrained background: fine grid + single soft wash */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.5] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 pb-16 pt-28 md:pb-24 md:pt-36">
        {/* Eyebrow */}
        <div className="flex justify-center">
          <a
            href="#channels"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[12px] text-foreground/80 backdrop-blur transition-colors hover:border-primary/30"
          >
            <span className="inline-flex items-center gap-1 text-primary">
              <Zap className="size-3.5" />
              New
            </span>
            <span className="text-muted-foreground">Knowledge base &amp; RAG</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-6 max-w-[16ch] text-center font-heading text-[clamp(34px,5.6vw,66px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
          One AI agent for{' '}
          <span className="relative whitespace-nowrap text-primary">
            every channel
            <svg
              className="absolute -bottom-1 left-0 w-full text-primary/40"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
          .
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-center text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-muted-foreground">
          Build a single brain for your business and deploy it to web, WhatsApp, Telegram,
          Discord, and Slack — no code required.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup" className="flex-1 sm:flex-none">
            <Button size="lg" className="glow-primary-sm w-full sm:w-auto">
              Start free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a href="#channels" className="flex-1 sm:flex-none">
            <Button size="lg" variant="outline" className="w-full bg-card/60 sm:w-auto">
              See channels
            </Button>
          </a>
        </div>

        <div className="mt-5 flex items-center justify-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-primary" /> Free forever plan
          </span>
          <span className="hidden opacity-40 sm:inline">·</span>
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-primary" /> No credit card
          </span>
        </div>

        {/* Product preview */}
        <div className="mt-16 md:mt-20">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}
