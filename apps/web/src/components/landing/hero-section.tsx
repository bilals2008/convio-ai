import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ArrowRight, ArrowUpRight, Check, MessageSquare, BarChart3, Globe } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { HeroBackground } from './hero-background'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

function ProductPreview() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-primary/[0.07] blur-[60px]" />
      <div className="flex items-center gap-1.5 rounded-t-2xl border border-b-0 border-border bg-card px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <div className="ml-3 h-5 w-full max-w-[200px] rounded-md bg-muted" />
      </div>
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-b-2xl border border-border bg-secondary/20">
        <img
          src="https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/hero.avif"
          alt="AI agent dashboard preview"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/15 to-transparent pointer-events-none" />
      </AspectRatio>
    </div>
  )
}

export function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <section id="top" className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 pb-16 pt-28 md:pb-24 md:pt-36">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={heroContainer}
          initial={reduce ? 'visible' : 'hidden'}
          animate="visible"
        >
          <motion.a
            href="#channels"
            variants={heroItem}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-[13px] font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            New — BYOK: Bring your own API keys
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>

          <motion.h1
            variants={heroItem}
            className="mt-8 max-w-[14ch] font-heading text-[clamp(40px,6vw,72px)] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground"
          >
            AI agents that live{' '}
            <span className="relative whitespace-nowrap text-success">
              where your users are
              <svg
                className="absolute -bottom-1.5 left-0 w-full text-success/50"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-5 max-w-[480px] text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-muted-foreground"
          >
            Build RAG-powered agents, deploy across web, WhatsApp, Telegram, Discord & Slack.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex items-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="glow-primary-sm">
                Start free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#everything">
              <Button size="lg" variant="outline" className="bg-card/60">
                View demo
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={heroItem}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-3.5 shrink-0 text-primary/70" /> 5 channels
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5 shrink-0 text-primary/70" /> Unlimited agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-3.5 shrink-0 text-primary/70" /> Built-in analytics
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-12 md:mt-16"
          variants={heroItem}
          initial={reduce ? 'visible' : 'hidden'}
          animate="visible"
          transition={{ delay: 0.55 }}
        >
          <div className="pointer-events-none absolute -top-8 left-1/2 h-[200px] w-[60%] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[60px]" />
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  )
}
