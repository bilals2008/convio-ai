import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 size-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 size-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span>AI-Powered Platform</span>
        </Badge>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Build AI Chatbots{' '}
          <span className="text-primary">That Actually Work</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Create intelligent agents, deploy to every channel, and manage everything 
          from one powerful dashboard. No coding required.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2 px-8 py-3 text-base h-auto">
              Start Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="px-8 py-3 text-base h-auto">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">2,500+</span> teams building with Convio
          </p>
        </div>
      </div>
    </section>
  )
}
