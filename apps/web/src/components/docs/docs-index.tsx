import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DocsShell } from '@/components/docs/docs-shell'
import { buttonVariants } from '@/components/ui/button'
import type { DocHeading } from '@/lib/docs/content'
import { docSections, type DocPage } from '@/lib/docs/nav'
import { cn } from '@/lib/utils'

const BLURBS: Record<string, string> = {
  '': 'What Convio is and how the pieces fit together.',
  'getting-started': 'Account, organization, team, dashboard, and the full vocabulary.',
  agents: 'Concepts, creating, model choice, tools, testing, and statuses.',
  templates: 'Ready-made system prompts with model, temperature, and tool defaults, applied in one click.',
  'system-prompts': 'The highest-leverage field you own, with worked examples.',
  'knowledge-bases': 'Ground answers in your documents instead of the model’s memory.',
  channels: 'Deploy to the web widget, WhatsApp, Slack, Telegram, Discord, and SMS.',
  billing: 'How token usage is metered, plans, trials, and keeping costs predictable.',
  'use-cases/whatsapp-support': 'Deploy an AI agent on your WhatsApp Business number for instant customer support.',
  'use-cases/slack-helpdesk': 'Give your team an AI assistant in Slack that answers internal questions instantly.',
  'use-cases/lead-qualification': 'Replace static forms with a conversational widget that qualifies website visitors.',
  'use-cases/telegram-community': 'Add an AI bot to your Telegram group to answer questions and share resources 24/7.',
  'use-cases/sms-appointments': 'Send automated SMS reminders, confirmations, and booking follow-ups via Twilio.',
}

const STEPS = [
  { n: '01', title: 'Create an account and an organization', body: 'An organization is the workspace boundary. Agents, knowledge, keys, and billing all live inside one.' },
  { n: '02', title: 'Create your first agent', body: 'Name it, pick a model, write a system prompt. Start from a template or blank.' },
  { n: '03', title: 'Test it in the playground', body: 'It runs your real prompt, model, and knowledge, without touching production.' },
  { n: '04', title: 'Set it active and deploy', body: 'Draft agents accept nothing. Once it answers in production, you are live.' },
]

const INDEX_TOC: DocHeading[] = [
  { id: 'quick-start', text: 'Quick start', level: 2 },
  { id: 'documentation', text: 'Documentation', level: 2 },
]

function PageCard({ page }: { page: DocPage }) {
  const Icon = page.icon
  return (
    <Link
      to={`/docs/${page.slug}`}
      className="group flex items-start gap-3.5 rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-foreground/20 hover:bg-accent/40"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {page.title}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 -translate-x-0.5 text-primary opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
          {BLURBS[page.slug]}
        </span>
      </span>
    </Link>
  )
}

export function DocsIndex() {
  return (
    <DocsShell toc={INDEX_TOC}>
      <div className="pb-4">
        <p className="font-mono text-xs tracking-[0.08em] text-primary uppercase">Convio documentation</p>
        <h1 className="mt-3 max-w-[34rem] font-heading text-4xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
          Ship AI agents that answer everywhere
        </h1>
        <p className="mt-4 max-w-[38rem] text-[15px] leading-6.5 text-muted-foreground">
          Build an agent once, then bring it to your website, WhatsApp, Slack, Telegram, or SMS.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link to="/docs/getting-started" className={cn(buttonVariants({ size: 'lg' }))}>
            Get started
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            to="/docs/agents"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            Browse AI agents
          </Link>
        </div>

        <h2 id="quick-start" className="mt-16 scroll-mt-24 font-heading text-lg font-semibold tracking-tight">
          Quick start
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Four steps from a new workspace to a live agent.</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/30"
            >
              <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
              <p className="mt-1.5 text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <h2 id="documentation" className="mt-16 scroll-mt-24 font-heading text-lg font-semibold tracking-tight">
          Documentation
        </h2>
        {docSections.map((section) => (
          <section key={section.title} className="mt-8">
            <h3 className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {section.title}
            </h3>
            {/* The shell caps this column at 52rem, so two comfortable cards beat three cramped ones. */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {section.pages.map((page) => (
                <PageCard key={page.slug} page={page} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DocsShell>
  )
}
