import { Navbar, Footer } from '@/components/landing'
import { FloatingOrbs } from '@/components/landing/floating-orbs'

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div className="relative mx-auto max-w-[840px] px-5 md:px-10 pt-20 pb-4 md:pt-28 md:pb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur mb-6">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Coming Soon
            </div>
            <h1 className="font-heading text-[clamp(28px,4vw,48px)] font-semibold text-foreground leading-[1.1] tracking-[-0.02em]">
              Status Page
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
              We're building a real-time status page to keep you informed about system health, incidents, and uptime. Check back soon.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
