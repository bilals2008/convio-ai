import { useState } from 'react'
import { Loader2, Wand2, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { widgets as widgetsApi } from '@/lib/api'

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
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<WidgetDraft | null>(null)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setGenerating(true)
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
          rows={5}
          maxLength={2000}
        />

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="w-full"
          onClick={handleGenerate}
          disabled={generating || disabled || !description.trim()}
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {generating ? 'Generating…' : 'Generate design'}
        </Button>

        {draft && (
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{draft.name || draft.headerTitle || 'Widget'}</p>
                {draft.agentName && <p className="text-xs text-muted-foreground">Assistant: {draft.agentName}</p>}
              </div>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="size-3" />
              </span>
            </div>

            {(draft.headerTitle || draft.headerSubtitle) && (
              <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                {draft.headerTitle && <p className="font-medium">{draft.headerTitle}</p>}
                {draft.headerSubtitle && <p className="text-muted-foreground">{draft.headerSubtitle}</p>}
              </div>
            )}

            {draft.primaryColor && (
              <div className="flex flex-wrap gap-2">
                {palette.filter((p) => p.value).map((p) => (
                  <span key={p.label} className="flex items-center gap-1.5 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    <span className="size-3 rounded-full border border-border" style={{ background: p.value }} />
                    {p.label}
                  </span>
                ))}
              </div>
            )}

            {draft.quickReplies && draft.quickReplies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Quick replies:</span>
                {draft.quickReplies.map((q, i) => (
                  <span key={i} className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400">
                    {q}
                  </span>
                ))}
              </div>
            )}

            <Button type="button" variant="outline" className="w-full" onClick={handleApply}>
              Apply design
            </Button>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          AI drafts are a starting point — review everything before saving.
        </p>
      </div>
    </SectionCard>
  )
}
