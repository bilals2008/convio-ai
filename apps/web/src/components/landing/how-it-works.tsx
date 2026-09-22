import { SectionIntro } from './section-intro'
import { Parallax, Reveal } from './motion'

const STEPS = [
  {
    title: 'Build your agent',
    description:
      'Pick a model, write a prompt, and attach tools. Use any provider — or bring your own key.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-deatils-overview-tab-ss.avif',
  },
  {
    title: 'Train on your knowledge',
    description:
      'Upload docs, paste URLs, or connect an API. Agents answer with RAG-grounded accuracy.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/kb-list-view.avif',
  },
  {
    title: 'Deploy everywhere',
    description:
      'Embed with one script tag, then switch on WhatsApp, Telegram, Discord, and Slack.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/deploymnet.avif',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="overflow-hidden border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 py-20 md:px-10 md:py-28">
        <SectionIntro
          eyebrow="How it works"
          title="Live in three steps"
          highlight="three steps"
          description="From a blank agent to a live conversation on your busiest channel."
        />

        <div className="mt-14 flex flex-col gap-16 md:mt-20 md:gap-24">
          {STEPS.map((step, i) => {
            const reversed = i % 2 === 1
            return (
              <Reveal key={step.title} y={30}>
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
                  <div className={reversed ? 'md:order-2' : undefined}>
                    <span className="font-mono text-[12px] tracking-wider text-primary">
                      STEP 0{i + 1}
                    </span>
                    <h3 className="mt-3 font-heading text-[clamp(24px,3vw,34px)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[42ch] text-[15px] leading-[1.7] text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className={reversed ? 'md:order-1' : undefined}>
                    <Parallax distance={40}>
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full rounded-xl border border-border bg-secondary/30"
                      />
                    </Parallax>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
