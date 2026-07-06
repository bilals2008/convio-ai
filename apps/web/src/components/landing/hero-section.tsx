import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Bot, MessageSquare, Zap } from 'lucide-react'

const headlineWords = ['Build', 'AI', 'Chatbots', 'That', 'Actually', 'Work']

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.3 + i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

const features = [
  { icon: Bot, label: 'AI Agents' },
  { icon: MessageSquare, label: 'Multi-Channel' },
  { icon: Zap, label: 'Real-time Streaming' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Dot grid background */}
      <div className="absolute inset-0 -z-20 bg-dot-pattern opacity-40" />

      {/* Glow orbs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-40 right-0 size-[600px] rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 left-0 size-[600px] rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-sm">
              <Sparkles className="size-4 text-primary" />
              <span>AI-Powered Platform</span>
            </Badge>
          </motion.div>

          {/* Headline — word-by-word stagger */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            {headlineWords.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className={
                  word === 'Chatbots' || word === 'Actually'
                    ? 'text-primary mr-[0.25em]'
                    : 'mr-[0.25em]'
                }
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Create intelligent agents, deploy to every channel, and manage everything
            from one powerful dashboard. No coding required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-8 text-base glow-primary-sm hover:glow-primary transition-shadow">
                Start Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="px-8 text-base">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[
                'bg-primary text-primary-foreground',
                'bg-secondary text-secondary-foreground',
                'bg-muted text-muted-foreground',
                'bg-accent text-accent-foreground',
                'bg-primary/80 text-primary-foreground',
              ].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.4 + i * 0.06 }}
                  className={`size-10 rounded-full border-2 border-background ${color} flex items-center justify-center text-xs font-medium`}
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,500+</span> teams building with Convio
            </p>
          </motion.div>

          {/* Feature Pills — float in */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 1.5 + i * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                <feature.icon className="size-4 text-primary" />
                {feature.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
