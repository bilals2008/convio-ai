import { useState } from 'react'
import { Navbar, Footer } from '@/components/landing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
    } catch {
      toast.error('Failed to send message. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 bg-glow-green opacity-30"
          />
          <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 pt-20 pb-12 md:pt-28 md:pb-16">
            <ScrollReveal variant="fadeUp">
              <SectionHeading
                eyebrow="Contact"
                title="Let's talk"
                description="Questions, feedback, or partnership ideas — we read every message."
              />
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-lg px-5 md:px-10">
            <ScrollReveal variant="fadeUp">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="size-7 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
                      Message sent
                    </h2>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
                      Thanks for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs text-muted-foreground">Name</Label>
                        <Input id="name" name="name" placeholder="Your name" required className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs text-muted-foreground">Subject</Label>
                      <Input id="subject" name="subject" placeholder="How can we help?" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Tell us more..."
                        required
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="size-4 animate-spin" /><span className="ml-2">Sending...</span></>
                      ) : (
                        'Send message'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
