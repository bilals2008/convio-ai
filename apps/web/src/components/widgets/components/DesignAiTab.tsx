import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Wand2, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { widgets as widgetsApi } from '@/lib/api'

const GENERATING_PHASES = [
  'Reading your description…',
  'Picking the perfect palette…',
  'Styling your widget…',
  'Adding final touches…',
]

export interface WidgetDraft {
  name?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  promptBgColor?: string
  headerGradientStart?: string
  headerGradientEnd?: string
  headerGradientDirection?: number
  borderColor?: string
  inputBgColor?: string
  sendBtnColor?: string
  headerTitle?: string
  headerSubtitle?: string
  agentName?: string
  placeholderText?: string
  quickReplies?: string[]
  themeMode?: 'auto' | 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left'
  widgetWidth?: 'narrow' | 'default' | 'wide'
  launcherSize?: 'small' | 'default' | 'large'
  borderRadius?: 'none' | 'default' | 'full'
}

interface DesignAiTabProps {
  onApplyAiDraft: (draft: WidgetDraft) => void
  disabled?: boolean
}

export function DesignAiTab({ onApplyAiDraft, disabled }: DesignAiTabProps) {
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [phase, setPhase] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<WidgetDraft | null>(null)

  useEffect(() => {
    if (!generating) return
    const id = setInterval(() => setPhase((p) => (p + 1) % GENERATING_PHASES.length), 1600)
    return () => clearInterval(id)
  }, [generating])

  const handleGenerate = async () => {
    if (!description.trim()) return
    setGenerating(true)
    setPhase(0)
    setError(null)
    setDraft(null)
    try {
      const res = await widgetsApi.generateDraft(description.trim())
      setDraft((res.data.data || res.data) as WidgetDraft)
    } catch (err: unknown) {
      const message =
        (err as { friendlyMessage?: string })?.friendlyMessage ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Unable to generate a design. Please try again.'
      setError(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleApply = () => {
    if (!draft) return
    onApplyAiDraft(draft)
    setDescription('')
    setDraft(null)
    setError(null)
  }

  const palette = [
    { label: 'Primary', value: draft?.primaryColor },
    { label: 'Background', value: draft?.backgroundColor },
    { label: 'Header start', value: draft?.headerGradientStart },
    { label: 'Header end', value: draft?.headerGradientEnd },
  ]

  return (
    <SectionCard
      icon={<Wand2 className="size-3.5" />}
      title="Design with AI"
      description="Describe your brand and let AI style the widget"
    >
      <div className="space-y-4">
        <Textarea
          placeholder="e.g. A modern dark chat widget for a fintech app. Clean, minimal, with a green accent color. Header says 'Acme Support', quick replies like 'Pricing' and 'Contact us'."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={generating || disabled}
          rows={4}
          maxLength={2000}
          className="text-sm resize-none"
        />

        {error && (
          <p className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="w-full h-9 text-sm"
          onClick={handleGenerate}
          disabled={generating || disabled || !description.trim()}
        >
          {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
          {generating ? 'Generating…' : 'Generate design'}
        </Button>

        <AnimatePresence mode="wait">
          {generating && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={phase}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Loader2 className="size-3.5 animate-spin" />
              {GENERATING_PHASES[phase]}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {draft && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium text-foreground"
                  >
                    {draft.name || draft.headerTitle || 'Widget'}
                  </motion.p>
                  {draft.agentName && (
                    <motion.p
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 }}
                      className="text-xs text-muted-foreground/70"
                    >
                      Assistant: {draft.agentName}
                    </motion.p>
                  )}
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Check className="size-3" />
                </motion.span>
              </div>

            {(draft.headerTitle || draft.headerSubtitle) && (
              <div className="rounded-lg bg-card/60 px-3 py-2 text-xs ring-1 ring-border/20">
                {draft.headerTitle && <p className="font-medium text-foreground">{draft.headerTitle}</p>}
                {draft.headerSubtitle && <p className="text-muted-foreground/70">{draft.headerSubtitle}</p>}
              </div>
            )}

            {draft.primaryColor && (
              <div className="flex flex-wrap gap-1.5">
                {palette.filter((p) => p.value).map((p, i) => (
                  <motion.span
                    key={p.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center gap-1.5 rounded-lg bg-card/60 px-2 py-1 text-[11px] text-muted-foreground/70 ring-1 ring-border/20"
                  >
                    <span className="size-2.5 rounded-full ring-1 ring-border/30" style={{ background: p.value }} />
                    {p.label}
                  </motion.span>
                ))}
              </div>
            )}

            {draft.quickReplies && draft.quickReplies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground/60">Quick replies:</span>
                {draft.quickReplies.map((q, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 300, damping: 18 }}
                    className="rounded-lg bg-primary/5 px-2 py-0.5 text-[11px] text-primary ring-1 ring-primary/10"
                  >
                    {q}
                  </motion.span>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Button type="button" variant="outline" className="w-full h-8 text-xs" onClick={handleApply}>
                Apply design
              </Button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <p className="text-center text-[11px] text-muted-foreground/50">
          AI drafts are a starting point — review everything before saving.
        </p>
      </div>
    </SectionCard>
  )
}
