import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ArrowRight, ArrowUpRight, Zap, Check, MessageSquare, BarChart3, Globe } from 'lucide-react'

function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
      <AspectRatio ratio={16 / 9} className="bg-secondary/20">
        <img
          src="https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/hero.avif"
          alt="AI agent dashboard preview"
          className="object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </AspectRatio>
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[30%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[15%] h-[400px] w-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
        <div className="absolute top-[20%] right-[5%] h-[300px] w-[400px] rounded-full bg-primary/[0.03] blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.04] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      {/* Dot pattern */}
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      {/* Top edge glow line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22256%22%20height%3D%22256%22%20filter%3D%22url(%23n)%22%20opacity%3D%221%22%2F%3E%3C%2Fsvg%3E')] [background-size:128px_128px]" />

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
            <span className="text-muted-foreground">AI-powered customer intelligence</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <h1 className="mt-6 max-w-[16ch] font-heading text-[clamp(34px,5.6vw,66px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
            Ship AI agents that{' '}
            <span className="relative whitespace-nowrap text-primary">
              drive revenue
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
            Deploy intelligent AI agents across every customer touchpoint to automate support, qualify leads, and scale revenue on autopilot.
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

        <div className="relative mt-12 md:mt-16">
          <div className="pointer-events-none absolute -top-8 left-1/2 h-[200px] w-[60%] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[60px]" />
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}
