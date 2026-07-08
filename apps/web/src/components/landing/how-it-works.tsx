import { ScrollReveal } from './scroll-reveal'
import { Bot, Settings, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Bot,
    title: 'Create Your Agent',
    description: 'Configure your AI brain with custom prompts, choose a model, and add tools.',
  },
  {
    icon: Settings,
    title: 'Design Your Bot',
    description: 'Set up appearance, welcome message, and connect to your knowledge base.',
  },
  {
    icon: Rocket,
    title: 'Deploy Everywhere',
    description: 'One click to deploy to Web, WhatsApp, Telegram, Discord, or Slack.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-[1160px] mx-auto px-5 md:px-10 py-16">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">How it Works</div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Ship in minutes, not months.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Three steps from zero to a fully deployed AI chatbot across every channel.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {steps.map((step, i) => (
          <ScrollReveal key={step.title} delay={i * 0.06}>
            <div className="bg-card rounded-[14px] p-[34px_30px] border border-border">
              <div className="w-10 h-10 rounded-[9px] bg-primary/10 flex items-center justify-center text-primary mb-4">
                <step.icon className="size-5" />
              </div>
              <h3 className="text-[14px] font-semibold text-foreground mb-[7px]">{step.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.65]">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
