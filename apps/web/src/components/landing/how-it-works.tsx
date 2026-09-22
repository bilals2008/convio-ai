import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'

const STEPS = [
  {
    title: 'Build your agent',
    description: 'Prompt, model, tools — any provider or your own key.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-deatils-overview-tab-ss.avif',
  },
  {
    title: 'Train on your knowledge',
    description: 'Docs and URLs, retrieved with RAG.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/kb-list-view.avif',
  },
  {
    title: 'Deploy everywhere',
    description: 'One script tag, plus WhatsApp, Telegram, Discord, Slack.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/deploymnet.avif',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading eyebrow="How it works" title="Live in three steps" />
        </ScrollReveal>

        <div className="mt-12 md:mt-16 flex flex-col gap-14 md:gap-20">
          {STEPS.map((step, i) => {
            const reversed = i % 2 === 1
            return (
              <ScrollReveal key={step.title}>
                <div className="grid items-center gap-6 md:grid-cols-2 md:gap-14">
                  <div className={reversed ? 'md:order-2' : undefined}>
                    <span className="font-mono text-[12px] text-primary">
                      STEP 0{i + 1}
                    </span>
                    <h3 className="mt-2 font-heading text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.02em] text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[40ch] text-[15px] leading-[1.7] text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div
                    className={`relative ${reversed ? 'md:order-1' : ''}`}
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="w-full rounded-xl border border-border bg-secondary/20"
                    />
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
