import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { AiGeneratingIndicator } from './AiGeneratingIndicator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useGenerateWidgetDraft } from '@/lib/hooks/use-widget-draft'
import type { WidgetDraft } from '../types'

const GENERATING_PHASES = [
  'Reading your description…',
  'Picking the perfect palette…',
  'Styling your widget…',
  'Adding final touches…',
]

// Mirrors the API's generateWidgetBodySchema (description: trimmed, 3..2000).
// Enforced here so a too-short prompt never becomes a round-trip 400.
const MIN_DESCRIPTION_LENGTH = 3
const MAX_DESCRIPTION_LENGTH = 2000

// Long prompts live behind short labels, so the field never has to carry a
// paragraph of example copy in its placeholder.
const EXAMPLE_PROMPTS = [
  {
    label: 'Fintech dark',
    prompt:
      "A modern dark chat widget for a fintech app. Clean and minimal, near-black background with a green accent and soft grey text. Header says 'Acme Support' with 'We typically reply within minutes'. Warm, confident greeting. Quick replies: Pricing, Contact us, Features.",
  },
  {
    label: 'Wellness light',
    prompt:
      "A calm, light widget for a wellness brand. Warm neutral palette, white card, soft rounded corners and a reassuring tone. Header says 'Aura Care'. Greeting invites questions about treatments. Quick replies: Book a session, Our treatments, Opening hours.",
  },
  {
    label: 'Dev tools bold',
    prompt:
      "A bold, high-contrast widget for a developer tools product. Near-black background, electric blue accent, terse copy that gets to the point. Header says 'Ship It Support'. Quick replies: Docs, Pricing, Status.",
  },
]

// Mirrors the draft summary's two-column rows so the loading state reserves the
// same footprint the result will occupy.
const DRAFT_PLACEHOLDER_ROWS = [
  { label: 'w-20', value: 'w-44' },
  { label: 'w-24', value: 'w-32' },
  { label: 'w-16', value: 'w-52' },
]

function getGenerateErrorMessage(error: unknown): string {
  const err = error as {
    friendlyMessage?: string
    response?: {
      data?: { message?: string; error?: string; details?: Array<{ message?: string }> }
    }
  }
  // Field-level detail beats the generic "Validation failed" that the shared
  // friendly-message helper falls back to for 400s.
  return (
    err?.response?.data?.details?.[0]?.message ||
    err?.friendlyMessage ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    'Unable to generate a design. Please try again.'
  )
}

function DraftRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: ReactNode
}) {
  if (!value && !children) return null
  return (
    <div className="flex items-start gap-3 text-xs">
      <dt className="w-24 shrink-0 text-muted-foreground/60">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-foreground">{children ?? value}</dd>
    </div>
  )
}

interface DesignAiTabProps {
  onApplyAiDraft: (draft: WidgetDraft) => void
  disabled?: boolean
}

export function DesignAiTab({ onApplyAiDraft, disabled }: DesignAiTabProps) {
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<WidgetDraft | null>(null)
  const [exampleIndex, setExampleIndex] = useState(0)
  const generate = useGenerateWidgetDraft()
  const generating = generate.isPending
  const busy = generating || Boolean(disabled)

  const trimmedDescription = description.trim()
  const descriptionTooShort =
    trimmedDescription.length > 0 && trimmedDescription.length < MIN_DESCRIPTION_LENGTH
  const canGenerate = !busy && trimmedDescription.length >= MIN_DESCRIPTION_LENGTH

  useEffect(() => {
    if (!generating) return
    const id = setInterval(() => setPhase((p) => (p + 1) % GENERATING_PHASES.length), 1600)
    return () => clearInterval(id)
  }, [generating])

  const handleGenerate = async () => {
    if (!canGenerate) return
    setPhase(0)
    setError(null)
    setDraft(null)
    try {
      setDraft(await generate.mutateAsync(trimmedDescription))
    } catch (err: unknown) {
      setError(getGenerateErrorMessage(err))
    }
  }

  const handleApply = () => {
    if (!draft) return
    onApplyAiDraft(draft)
    setDescription('')
    setDraft(null)
    setError(null)
  }

  // Tab on an empty field drops in the next example, so nobody stares at a blank
  // box. Once there's text, Tab returns to its normal focus behaviour.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' || trimmedDescription) return
    e.preventDefault()
    setDescription(EXAMPLE_PROMPTS[exampleIndex].prompt)
    setExampleIndex((index) => (index + 1) % EXAMPLE_PROMPTS.length)
  }

  const palette = [
    { label: 'Primary', value: draft?.primaryColor },
    { label: 'Background', value: draft?.backgroundColor },
    { label: 'Header start', value: draft?.headerGradientStart },
    { label: 'Header end', value: draft?.headerGradientEnd },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value))

  const quickReplies = draft?.quickReplies ?? []

  return (
    <SectionCard
      icon={<Wand2 className="size-3.5" />}
      title="Design with AI"
      description="Describe your brand and let AI style the widget"
    >
      <div className="space-y-4">
        <div className="space-y-2.5">
          <Textarea
            placeholder="Describe the look and feel — colours, tone, greeting…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            rows={3}
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="text-sm resize-none"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground/60">Try an example:</span>
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example.label}
                type="button"
                disabled={busy}
                onClick={() => setDescription(example.prompt)}
                className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {example.label}
              </button>
            ))}
            {!trimmedDescription && !busy && (
              <span className="text-[11px] text-muted-foreground/50">or press Tab</span>
            )}
          </div>
        </div>

        {descriptionTooShort && (
          <p className="text-[11px] text-muted-foreground">
            Add a bit more detail — at least {MIN_DESCRIPTION_LENGTH} characters.
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="w-full h-9 text-sm"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          <Wand2 className="size-3.5" />
          {generating ? 'Generating…' : 'Generate design'}
        </Button>

        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-4 rounded-xl border border-dashed border-border/50 bg-muted/20 p-4"
            >
              <AiGeneratingIndicator label={GENERATING_PHASES[phase]} />

              {/* Placeholder rows shaped like the draft summary, so it is obvious
                  what is about to appear in this space. */}
              <div className="space-y-2.5" aria-hidden="true">
                {DRAFT_PLACEHOLDER_ROWS.map((row, index) => (
                  <div key={row.value} className="flex items-center gap-3">
                    <span
                      className={`h-3 shrink-0 animate-pulse rounded bg-muted ${row.label}`}
                      style={{ animationDelay: `${index * 140}ms` }}
                    />
                    <span
                      className={`h-3 animate-pulse rounded bg-muted ${row.value}`}
                      style={{ animationDelay: `${index * 140 + 70}ms` }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {draft && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-3" />
                </span>
                <span className="text-sm font-medium text-foreground">Draft ready</span>
                <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/60">
                  Review before applying
                </span>
              </div>

              <dl className="space-y-2.5">
                <DraftRow label="Name" value={draft.name} />
                <DraftRow label="Assistant" value={draft.agentName} />
                <DraftRow
                  label="Header"
                  value={[draft.headerTitle, draft.headerSubtitle].filter(Boolean).join(' · ')}
                />
                {palette.length > 0 && (
                  <DraftRow label="Palette">
                    <div className="flex items-center gap-1.5">
                      {palette.map((swatch) => (
                        <span
                          key={swatch.label}
                          title={`${swatch.label} · ${swatch.value}`}
                          className="size-4 rounded-full ring-1 ring-border/50"
                          style={{ background: swatch.value }}
                        />
                      ))}
                    </div>
                  </DraftRow>
                )}
                {quickReplies.length > 0 && (
                  <DraftRow label="Quick replies">
                    <div className="flex flex-wrap gap-1">
                      {quickReplies.map((reply) => (
                        <span
                          key={reply}
                          className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {reply}
                        </span>
                      ))}
                    </div>
                  </DraftRow>
                )}
              </dl>

              <Button type="button" className="w-full h-9 text-sm" onClick={handleApply}>
                Apply this design
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionCard>
  )
}
