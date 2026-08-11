import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './scroll-reveal'
import { ArrowRight, Check } from 'lucide-react'

export function CTA() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-24 md:py-36">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center">
            <h2 className="max-w-[18ch] font-heading text-[clamp(34px,5vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
              Ship your first agent{' '}
              <span className="text-primary">today.</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.7] text-muted-foreground">
              Connect a channel, add your knowledge, and go live in minutes — free forever plan, no credit card required.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="glow-primary-sm">
                  Start Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="ghost">
                  See Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-primary" /> Free forever plan
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-primary" /> No credit card
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
