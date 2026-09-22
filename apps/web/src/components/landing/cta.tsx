import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Reveal, SplitHeading } from './motion'
import { ArrowRight, Check } from 'lucide-react'

export function CTA() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-col items-center text-center">
          <SplitHeading
            as="h2"
            text="Ship your first agent today"
            highlight="today"
            highlightClassName="text-primary"
            className="max-w-[16ch] font-heading text-[clamp(34px,5vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground"
          />

          <Reveal y={16} delay={0.25} className="w-full">
            <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-[1.7] text-muted-foreground">
              Connect a channel, add your knowledge, and go live in minutes. Free forever —
              no credit card required.
            </p>
          </Reveal>

          <Reveal y={16} delay={0.35} className="w-full">
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="glow-primary-sm">
                  Start free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="ghost">
                  See pricing
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal y={12} delay={0.45}>
            <div className="mt-6 flex items-center gap-4 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-primary" /> Free forever plan
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-primary" /> No credit card
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
