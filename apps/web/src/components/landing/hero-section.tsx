import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ArrowRight, ArrowUpRight, Check, Globe } from 'lucide-react'
import { HeroBackground } from './hero-background'
import { Parallax, Reveal, SplitHeading } from './motion'

const HERO_IMAGE =
  'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/hero.avif'

function ProductPreview() {
  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 rounded-t-2xl border border-b-0 border-border bg-card px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <div className="ml-3 h-5 w-full max-w-[200px] rounded-md bg-muted" />
      </div>
      <AspectRatio
        ratio={16 / 9}
        className="overflow-hidden rounded-b-2xl border border-border bg-secondary/30 shadow-soft-lg"
      >
        <img
          src={HERO_IMAGE}
          alt="Convio agent dashboard"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <HeroBackground />

      <div className="relative mx-auto max-w-[1160px] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
        <div className="flex flex-col items-center text-center">
          <Reveal y={12} duration={0.5}>
            <a
              href="#channels"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              New: Bring your own API keys
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>

          <SplitHeading
            as="h1"
            text="AI agents that live where your users are"
            highlight="where your users are"
            highlightClassName="text-primary"
            delay={0.1}
            className="mt-7 max-w-[15ch] font-heading text-[clamp(40px,6.5vw,76px)] font-semibold leading-[1.03] tracking-[-0.035em] text-foreground"
          />

          <Reveal y={18} delay={0.35} className="w-full">
            <p className="mx-auto mt-5 max-w-[520px] text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-muted-foreground">
              Build RAG-powered agents and deploy them to web, WhatsApp, Telegram, Discord,
              and Slack from one dashboard.
            </p>
          </Reveal>

          <Reveal y={18} delay={0.45} className="w-full">
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="glow-primary-sm">
                  Start free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#everything">
                <Button size="lg" variant="outline">
                  See it in action
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal y={14} delay={0.55} className="w-full">
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5 shrink-0 text-primary/70" /> 5 channels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-primary/70" /> Free forever plan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-primary/70" /> No credit card
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal y={32} delay={0.3} duration={0.9} className="mt-12 md:mt-16">
          <Parallax distance={46}>
            <ProductPreview />
          </Parallax>
        </Reveal>
      </div>
    </section>
  )
}
