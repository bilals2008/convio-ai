import { Card, CardContent } from '@/components/ui/card'
import { Bot, Settings, Rocket } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Bot,
    title: 'Create Your Agent',
    description: 'Configure your AI brain with custom prompts, choose a model, and add tools.',
  },
  {
    step: '02',
    icon: Settings,
    title: 'Design Your Bot',
    description: 'Set up appearance, welcome message, and connect to your knowledge base.',
  },
  {
    step: '03',
    icon: Rocket,
    title: 'Deploy Everywhere',
    description: 'One click to deploy to Web, WhatsApp, Telegram, Discord, or Slack.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Get started in{' '}
            <span className="text-primary">three simple steps</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to deployed chatbot in minutes, not months.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-0.5 bg-border" />
              )}
              
              <Card className="relative text-center border-0 shadow-none bg-transparent">
                <CardContent className="p-6">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto -mt-2 mb-4">
                    <step.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
