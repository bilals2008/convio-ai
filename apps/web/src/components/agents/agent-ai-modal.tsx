import { useState } from 'react'
import { Loader2, Wand2, Check, Wrench } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { agents as agentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export interface AgentDraft {
  name: string
  description: string
  systemPrompt: string
  suggestedModel?: string
  suggestedTemperature?: number
  toneOfVoice?: string
  language?: string
  suggestedTools?: string[]
}

interface AgentAiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (draft: AgentDraft) => void
  defaultModel?: string
  disabled?: boolean
}

const toolLabels: Record<string, string> = {
  'web-search': 'Web Search',
  calculator: 'Calculator',
  'url-fetcher': 'URL Fetcher',
  'current-time': 'Date & Time',
}

export function AgentAiModal({ open, onOpenChange, onApply, defaultModel, disabled }: AgentAiModalProps) {
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<AgentDraft | null>(null)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setGenerating(true)
    setError(null)
    setDraft(null)
    try {
      const res = await agentsApi.generateDraft(description.trim(), defaultModel)
      setDraft((res.data.data || res.data) as AgentDraft)
    } catch (err: unknown) {
      const message =
        (err as { friendlyMessage?: string })?.friendlyMessage ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Unable to generate an agent. Please try again.'
      setError(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleApply = () => {
    if (!draft) return
    onApply(draft)
    onOpenChange(false)
    setDescription('')
    setDraft(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          setDescription('')
          setDraft(null)
          setError(null)
        }
      }}
    >
      <DialogContent style={{ width: '60vw', maxWidth: '60vw' }} className="h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create with AI</DialogTitle>
          <DialogDescription>
            Describe the agent you want and AI will draft its name, prompt, and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <Textarea
            placeholder="e.g. A support agent for my bakery that answers questions about orders, allergies, and store hours in a friendly tone. It should search the web for current opening times."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={generating || disabled}
            rows={7}
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
            {generating ? 'Generating…' : 'Generate agent'}
          </Button>

          {draft && (
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{draft.name}</p>
                  <p className="text-xs text-muted-foreground">{draft.description}</p>
                </div>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check className="size-3" />
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                {draft.systemPrompt}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {draft.suggestedModel && (
                  <span>
                    Model: <span className="font-mono">{draft.suggestedModel}</span>
                  </span>
                )}
                {typeof draft.suggestedTemperature === 'number' && (
                  <span>Temperature: {draft.suggestedTemperature}</span>
                )}
                {draft.toneOfVoice && <span>Tone: {draft.toneOfVoice}</span>}
                {draft.suggestedTools && draft.suggestedTools.length > 0 && (
                  <span className={cn('flex items-center gap-1')}>
                    <Wrench className="size-3" />
                    {draft.suggestedTools.map((t) => toolLabels[t] || t).join(', ')}
                  </span>
                )}
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleApply}>
                Use this draft
              </Button>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            AI drafts are a starting point — review everything before creating.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
