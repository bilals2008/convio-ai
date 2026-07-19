import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './scroll-reveal'
import { GlowCard } from './glow-card'
import { FloatingOrbs } from './floating-orbs'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      <FloatingOrbs />

      <div className="max-w-[1160px] mx-auto px-5 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
        <ScrollReveal variant="scaleIn">
          <GlowCard>
            <div className="py-14 md:py-20 px-6 md:px-14 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-[clamp(24px,3.2vw,40px)] text-foreground leading-[1.12] tracking-[-0.02em] mb-3">
                  Ship your first agent today.
                </h2>
                <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[420px]">
                  Connect a channel, add your knowledge, and go live in minutes — free forever plan, no credit card required.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 w-full md:w-auto md:min-w-[200px] shrink-0">
                <Link to="/signup">
                  <Button size="lg" className="w-full justify-center glow-primary-sm">
                    Start Free
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="w-full justify-center bg-card/60">
                    See Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
    </section>
  )
}
