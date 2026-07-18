import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ArrowRight, ArrowUpRight, Zap, Check, MessageSquare, BarChart3, Globe } from 'lucide-react'

function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <AspectRatio ratio={16 / 9} className="bg-secondary/20">
        <img
          src="/hero-preview.png"
          alt="Convio dashboard preview"
          className="object-cover"
        />
      </AspectRatio>
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.5] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]" />

      <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="flex flex-col items-center text-center">
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

          <h1 className="mt-6 max-w-[16ch] font-heading text-[clamp(34px,5.6vw,66px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
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

          <p className="mt-5 max-w-[520px] text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-muted-foreground">
            Build a single brain for your business and deploy it to web, WhatsApp, Telegram,
            Discord, and Slack — no code required.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="glow-primary-sm">
                Start free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#channels">
              <Button size="lg" variant="outline" className="bg-card/60">
                See channels
              </Button>
            </a>
          </div>

          <div className="mt-5 flex items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Check className="size-3.5 text-primary" /> Free forever plan
            </span>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1">
              <Check className="size-3.5 text-primary" /> No credit card
            </span>
          </div>

          <div className="mt-6 flex items-center gap-6 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary/70" /> 5 channels
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary/70" /> Unlimited agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-primary/70" /> Built-in analytics
            </span>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}
