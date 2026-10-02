import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Flame, LayoutTemplate, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DocsCallout } from '@/components/docs/docs-callout'
import { DocsContent } from '@/components/docs/docs-content'
import { DocsShell } from '@/components/docs/docs-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import { categoryColors, iconForTemplate } from '@/lib/template-style'
import { extractHeadings } from '@/lib/docs/markdown'
import { cn } from '@/lib/utils'
// ponytail: templates live in the API as pure data (no imports), so the docs read them
// from the source instead of keeping a second copy that drifts. If that file ever grows
// runtime imports, move it to packages/ and import it from both apps.
import { listTemplates, type AgentTemplate } from '../../../../api/src/modules/agents/templates'

/** Prompt templates only — the blank `custom` entry has nothing to show. */
const TEMPLATES = listTemplates()
  .filter((template) => template.category !== 'custom')
  .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

// Resolved once at module scope: the compiler refuses to take a component out of a
// function call inside render, and a map lookup is the same answer every time.
const ICONS: Record<string, LucideIcon> = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, iconForTemplate(template.id, template.category)])
)

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'support', label: 'Support' },
  { id: 'business', label: 'Business' },
  { id: 'education', label: 'Education' },
  { id: 'productivity', label: 'Productivity' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

/** Cards are tall now that each one carries its prompt, so the fold shows this many. */
const PREVIEW = 8

const COUNTS: Record<string, number> = Object.fromEntries(
  FILTERS.map((filter) => [
    filter.id,
    filter.id === 'all'
      ? TEMPLATES.length
      : TEMPLATES.filter((template) => template.category === filter.id).length,
  ])
)

/**
 * The prose below the gallery. Markdown so it keeps the docs typography, heading
 * anchors, callouts, and links instead of growing a second set of text styles.
 */
const NOTES = `## What a template applies

Applying a template opens the create agent form already filled in:

- **Name and description** — a sensible label to rename if you want.
- **System prompt** — written for that job, yours to edit once applied.
- **Model and temperature** — a default chosen for that kind of work.
- **Suggested tools** — pre-enabled, so the agent can act instead of only answering.

> [!TIP]
> **The prompt is a draft, not an answer key**
>
> Templates use generic wording. Add your policies, your tone, and the edge cases that only you know, then run it in the [playground](/docs/agents) before you set the agent active.

## Customize and test

Start from the prompt, then ground it: put the facts that change into a [knowledge base](/docs/knowledge-bases), keep the rules that never change in the [system prompt](/docs/system-prompts), and test both before you [deploy](/docs/channels).`

const TOC = [
  { id: 'gallery', text: 'Browse the gallery', level: 2 as const },
  ...extractHeadings(NOTES),
]

function TemplateCard({ template }: { template: AgentTemplate }) {
  const Icon = ICONS[template.id]
  const popular = (template.popularity ?? 0) >= 70

  return (
    <article className="flex min-w-0 flex-col gap-2 rounded-lg border border-border/70 bg-card p-3 transition-colors duration-150 hover:border-foreground/20">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md',
            categoryColors[template.category]
          )}
        >
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{template.name}</h3>
        {popular && (
          <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-amber-500">
            <Flame aria-hidden="true" className="size-3 fill-current" />
            {template.popularity}
          </span>
        )}
      </div>
      <p className="truncate text-xs text-muted-foreground">{template.description}</p>
      <div className="flex min-w-0 items-center gap-2 border-t border-border/60 pt-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden font-mono text-[10px] text-muted-foreground">
          <span className="truncate">{template.suggestedModel}</span>
          <span className="shrink-0">temp {template.suggestedTemperature}</span>
          {template.suggestedTools.length > 0 && (
            <span className="flex shrink-0 items-center gap-1">
              <Wrench aria-hidden="true" className="size-3" />
              {template.suggestedTools.length}
            </span>
          )}
        </div>
        <Link
          to={`/agents/new?template=${template.id}`}
          aria-label={`Use ${template.name} template`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'shrink-0')}
        >
          Use
          <ArrowRight aria-hidden="true" className="size-3" />
        </Link>
      </div>
    </article>
  )
}

export default function DocsTemplatesPage() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    document.title = 'Agent templates — Convio Docs'
  }, [])

  const matches = useMemo(
    () => (filter === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter)),
    [filter]
  )
  const shown = showAll ? matches : matches.slice(0, PREVIEW)

  return (
    <DocsShell toc={TOC}>
      {/* Hero, in the docs index's voice: kicker, one promise, two ways forward. */}
      <p className="font-mono text-[10px] tracking-[0.08em] text-primary uppercase">Docs</p>
      <h1 className="mt-2 max-w-[34rem] font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl sm:leading-[1.1]">
        Start from a proven prompt
      </h1>
      <p className="mt-2 max-w-[38rem] text-sm leading-6 text-muted-foreground">
        {TEMPLATES.length} ready-made agents with prompts, models, and tools — choose one and
        customize it in the create form.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link to="/agents/templates" className={cn(buttonVariants({ size: 'sm' }))}>
          <LayoutTemplate aria-hidden="true" className="size-4" />
          Open the gallery
        </Link>
        <Link
          to="/docs/system-prompts"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Writing system prompts
        </Link>
      </div>

      <h2
        id="gallery"
        className="mt-8 scroll-mt-20 font-heading text-base font-semibold tracking-tight"
      >
        Browse the gallery
      </h2>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter templates by category">
        {FILTERS.map((option) => {
          const active = filter === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setFilter(option.id)
                setShowAll(false)
              }}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {option.label}
              <span className={cn('font-mono', active ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                {COUNTS[option.id]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-x-6">
        {shown.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {!showAll && matches.length > PREVIEW && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            <ArrowDown aria-hidden="true" className="size-4" />
            See all {matches.length} templates
          </Button>
        </div>
      )}

      {matches.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No templates in this category yet.
        </p>
      )}

      <div className="mt-14">
        <DocsContent body={NOTES} />

        <DocsCallout variant="info" title="Templates are org-wide, not locked in">
          Applying a template copies its settings into a new agent. Editing that agent never
          changes the template, and new templates arrive without touching anything you built.
        </DocsCallout>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/agents/new" className={cn(buttonVariants({ size: 'lg' }))}>
          Start from scratch
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <Link
          to="/docs/getting-started"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Getting started
        </Link>
      </div>
    </DocsShell>
  )
}
