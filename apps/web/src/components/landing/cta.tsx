import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './scroll-reveal'
import { GlowCard } from './glow-card'
import { Typewriter } from './typewriter'
import { ArrowRight, Copy, Check } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      aria-label="Copy install command"
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function CTA() {
  return (
    <section className="relative border-t border-border/60">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 md:py-28">
      <ScrollReveal variant="scaleIn">
        <GlowCard>
          <div className="py-14 md:py-20 px-6 md:px-14 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-[clamp(24px,3.2vw,40px)] text-foreground leading-[1.12] tracking-[-0.02em] mb-3">
                Ship your first agent today.
              </h2>
              <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[420px] mb-4">
                Connect a channel, add your knowledge, and go live in minutes — no infrastructure to manage.
              </p>

              <div className="text-[15px] font-medium mb-6 h-6">
                <Typewriter
                  prefix="Start building "
                  texts={['chatbots', 'AI agents', 'automations', 'support']}
                  typedColor="var(--primary)"
                  color="var(--muted-foreground)"
                />
              </div>

              <div className="inline-flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-2.5">
                <span className="text-primary text-[13px] font-mono font-medium">$</span>
                <code className="text-[13px] font-mono text-foreground/70">npx create-convio</code>
                <CopyButton text="npx create-convio" />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 w-full md:w-auto md:min-w-[200px] shrink-0">
              <Link to="/signup">
                <Button size="lg" className="w-full justify-center glow-primary-sm">
                  Start Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
               <a href="#channels">
                <Button size="lg" variant="outline" className="w-full justify-center bg-card/60">
                  Explore Features
                </Button>
              </a>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </GlowCard>
      </ScrollReveal>
      </div>
    </section>
  )
}
