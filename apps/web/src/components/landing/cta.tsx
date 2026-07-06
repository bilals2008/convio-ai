import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-card p-8 sm:p-16 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/10" />
            <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-primary/10" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
            Ready to build your AI chatbot?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join 2,500+ teams already using Convio to create intelligent conversational experiences.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-8 py-3 text-base h-auto bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="px-8 py-3 text-base h-auto border-border text-card-foreground hover:bg-muted">
                View Pricing
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
