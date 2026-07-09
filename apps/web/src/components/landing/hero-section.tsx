import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, MessageSquare, BarChart3, Brain } from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon, WebIcon } from './channel-icons'
import { LogoMarquee } from './logo-marquee'

const channels = [
  { name: 'Web', icon: WebIcon },
  { name: 'WhatsApp', icon: WhatsAppIcon },
  { name: 'Telegram', icon: TelegramIcon },
  { name: 'Discord', icon: DiscordIcon },
  { name: 'Slack', icon: SlackIcon },
]

export function HeroSection() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    function tick() {
      const sy = window.scrollY
      const wh = window.innerHeight
      const p = Math.min(sy / (wh * 0.55), 1)
      card.style.transform = `scale(${1 - p * 0.1})`
      card.style.opacity = String(1 - p * 0.12)
    }
    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    <div className="relative min-h-screen flex items-start justify-center pt-[10px]">
      <div
        ref={cardRef}
        className="sticky top-[10px] w-[calc(100%-20px)] mx-[10px] h-[calc(100vh-20px)] rounded-[18px] overflow-hidden origin-top will-change-transform"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-dot-pattern opacity-50" />
        <div className="absolute -top-40 right-0 size-[600px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 left-0 size-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[420px] rounded-full bg-accent/10 blur-3xl" />

        {/* Hero overlay */}
        <div className="absolute inset-0 z-[2] flex flex-col justify-between p-[18px] md:p-[26px_40px]">
          {/* Spacer for navbar */}
          <div className="h-14" />

          {/* Center content */}
          <div className="text-center px-3">
            <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
              <div className="inline-flex items-center gap-[6px] bg-card/60 backdrop-blur-lg border border-border rounded-full px-[14px] py-[6px] text-[12px] text-foreground/90">
                <Sparkles className="size-4 text-primary" />
                AI-Powered Platform
              </div>
              <div className="inline-flex items-center gap-[6px] bg-card/60 backdrop-blur-lg border border-border rounded-full px-[14px] py-[6px] text-[12px] text-foreground/90">
                <span className="w-[6px] h-[6px] bg-primary rounded-full shrink-0 animate-pulse" />
                New: Knowledge Base (RAG)
              </div>
            </div>
            <h1 className="font-heading text-[clamp(30px,6.2vw,76px)] font-semibold text-foreground leading-[1.08] tracking-[-0.02em] mb-4">
              The chatbot platform<br />builders actually want.
            </h1>
            <p className="text-[clamp(13px,1.45vw,18px)] text-muted-foreground leading-[1.65] max-w-[520px] mx-auto mb-7">
              Create intelligent agents, deploy to every channel, and manage everything
              from one powerful dashboard. No coding required.
            </p>
            <div className="flex items-center justify-center gap-[10px] flex-wrap">
              <Link to="/signup">
                <Button className="glow-primary-sm px-6">
                  Get Started
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="bg-card/60 backdrop-blur-lg px-6">
                  <MessageSquare className="size-4" />
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Channel integrations */}
            <div className="mt-14 flex flex-col items-center justify-center gap-3.5 select-none">
              <span className="text-[10px] tracking-[0.15em] text-muted-foreground/60 uppercase font-semibold">Deploy to</span>
              <div className="flex items-center justify-center gap-4 sm:gap-7 flex-wrap max-w-[600px]">
                {channels.map((c) => (
                  <div
                    key={c.name}
                    title={c.name}
                    className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-[13px] font-medium"
                  >
                    <c.icon className="size-[18px]" />
                    <span className="hidden sm:inline">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logo marquee */}
          <div className="px-2">
            <LogoMarquee label="Trusted by teams at" />
          </div>

          {/* Bottom bar — stats */}
          <div className="flex items-end justify-center sm:justify-between">
            <div className="flex gap-[26px]">
              {[
                { num: '2,500+', label: 'Teams' },
                { num: '5', label: 'Channels' },
                { num: '10+', label: 'AI Models' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-heading text-[19px] font-semibold text-foreground leading-[1.2]">{s.num}</div>
                  <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[13px] text-muted-foreground/50">
              <span className="flex items-center gap-1.5"><Brain className="size-4 text-primary" />RAG</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="size-4 text-primary" />Real-time</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="size-4 text-primary" />Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
