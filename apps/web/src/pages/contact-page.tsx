import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer } from '@/components/landing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'
import { GlowCard } from '@/components/landing/glow-card'
import {
  Loader2,
  CheckCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Clock,
  ShieldCheck,
  ArrowRight,
  Building2,
  LifeBuoy,
} from 'lucide-react'
import { toast } from 'sonner'

const CHANNELS = [
  {
    icon: Mail,
    title: 'Email us',
    body: 'For anything that needs a paper trail.',
    action: 'teambilaldev@gmail.com',
    href: 'mailto:teambilaldev@gmail.com',
    color: '#22c55e',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    body: 'Existing customer with a live issue?',
    action: 'teambilaldev@gmail.com',
    href: 'mailto:teambilaldev@gmail.com',
    color: '#6366f1',
  },
  {
    icon: BookOpen,
    title: 'Read the docs',
    body: 'Most questions are answered here first.',
    action: 'Browse documentation',
    href: '/docs',
    color: '#f59e0b',
  },
]

const TOPICS = [
  'General question',
  'Sales & pricing',
  'Technical support',
  'Partnership',
  'Press & media',
  'Something else',
]

const HIGHLIGHTS = [
  { icon: Clock, label: 'Under 24h', sub: 'Average first reply' },
  { icon: ShieldCheck, label: 'Real humans', sub: 'No ticket-bot runaround' },
  { icon: Building2, label: 'Enterprise', sub: 'Dedicated onboarding' },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>

    // Backend accepts { name, email, subject, message }. Fold the topic into subject.
    const payload = {
      name: raw.name,
      email: raw.email,
      subject: raw.topic ? `[${raw.topic}] ${raw.subject}` : raw.subject,
      message: raw.message,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
      form.reset()
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
        {/* Hero */}
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 bg-glow-green opacity-30"
          />
          <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 pt-20 pb-4 md:pt-28 md:pb-8">
            <ScrollReveal variant="fadeUp">
              <SectionHeading
                eyebrow="Contact"
                title="Let's build something that talks back"
                description="Questions, feedback, a demo request, or a partnership idea — tell us what you're working on and the right person will get back to you."
              />
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {HIGHLIGHTS.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/60">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-sm font-medium text-foreground">{label}</div>
                      <div className="text-[11px] text-muted-foreground">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Channels + Form */}
        <section className="relative">
          <div className="mx-auto max-w-[1160px] px-5 md:px-10 pt-10 pb-20 md:pt-14 md:pb-28">
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
              {/* Left: contact channels */}
              <div className="flex flex-col lg:col-span-2">
                <ScrollReveal variant="fadeUp">
                  <h3 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground">
                    Reach us directly
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Prefer not to fill in a form? Pick the channel that fits.
                  </p>
                </ScrollReveal>

                <div className="mt-6 flex flex-1 flex-col gap-4">
                  {CHANNELS.map(({ icon: Icon, title, body, action, href, color }, i) => {
                    const external = href.startsWith('mailto:')
                    const inner = (
                      <div className="group relative flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-border/60 hover:shadow-soft-lg">
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                          style={{ background: `${color}12` }}
                        >
                          <Icon className="size-5" style={{ color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{title}</div>
                          <p className="mt-0.5 text-[13px] text-muted-foreground leading-relaxed">{body}</p>
                          <div className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                            {action}
                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    )
                    return (
                      <ScrollReveal key={title} variant="fadeUp" delay={i * 0.06} className="flex-1">
                        {external ? (
                          <a href={href} className="block h-full">
                            {inner}
                          </a>
                        ) : (
                          <Link to={href} className="block h-full">
                            {inner}
                          </Link>
                        )}
                      </ScrollReveal>
                    )
                  })}
                </div>
              </div>

              {/* Right: form */}
              <div className="lg:col-span-3">
                <ScrollReveal variant="scaleIn">
                  <GlowCard className="p-6 md:p-8">
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle className="size-7 text-primary" />
                        </div>
                        <h2 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
                          Message sent
                        </h2>
                        <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
                          Thanks for reaching out. A real person will get back to you within 24 hours.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                          Send another message
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 flex items-center gap-2.5">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquare className="size-4.5 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground">
                              Send us a message
                            </h2>
                            <p className="text-[13px] text-muted-foreground">
                              Fill this in and we'll route it to the right team.
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-xs text-muted-foreground">
                                Name
                              </Label>
                              <Input id="name" name="name" placeholder="Your name" required className="h-11" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-xs text-muted-foreground">
                                Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="h-11"
                              />
                            </div>
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="topic" className="text-xs text-muted-foreground">
                                Topic
                              </Label>
                              <NativeSelect
                                id="topic"
                                name="topic"
                                defaultValue={TOPICS[0]}
                                className="w-full [&>select]:h-11"
                              >
                                {TOPICS.map((t) => (
                                  <NativeSelectOption key={t} value={t}>
                                    {t}
                                  </NativeSelectOption>
                                ))}
                              </NativeSelect>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subject" className="text-xs text-muted-foreground">
                                Subject
                              </Label>
                              <Input
                                id="subject"
                                name="subject"
                                placeholder="How can we help?"
                                required
                                className="h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message" className="text-xs text-muted-foreground">
                              Message
                            </Label>
                            <Textarea
                              id="message"
                              name="message"
                              rows={6}
                              placeholder="Tell us a bit about what you're building or the problem you're solving..."
                              required
                              className="resize-none"
                            />
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <ShieldCheck className="size-3.5 text-primary" />
                              We'll never share your details.
                            </p>
                            <Button
                              type="submit"
                              size="lg"
                              className="glow-primary-sm w-full sm:w-auto"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  <span className="ml-2">Sending...</span>
                                </>
                              ) : (
                                <>
                                  Send message
                                  <ArrowRight className="size-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </>
                    )}
                  </GlowCard>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
