import { useState } from 'react'
import { Loader2, Wand2, Check, Wrench } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { agents as agentsApi } from '@/lib/api'

export interface AgentDraft {
  name: string
  description: string
  systemPrompt: string
  suggestedModel?: string
  suggestedTemperature?: number
  toneOfVoice?: string
  language?: string
  suggestedTools?: string[]
  suggestedCapabilities?: string[]
  suggestedDeployments?: string[]
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

const capabilityLabels: Record<string, string> = {
  'answer-questions': 'Answer Questions',
  'knowledge-search': 'Knowledge Search',
  'generate-leads': 'Generate Leads',
  'book-appointments': 'Book Appointments',
  'execute-actions': 'Execute Actions',
}

const deploymentLabels: Record<string, string> = {
  'web-chat-widget': 'Web chat widget',
  'shareable-link': 'Shareable link',
  whatsapp: 'WhatsApp',
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-[60vw] sm:max-w-[60vw] h-[60vh] sm:h-[66vh] flex flex-col">
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
              </div>

              {draft.suggestedTools && draft.suggestedTools.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Wrench className="size-3" />
                    Tools:
                  </span>
                  {draft.suggestedTools.map((t) => (
                    <span key={t} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                      {toolLabels[t] || t}
                    </span>
                  ))}
                </div>
              )}

              {draft.suggestedCapabilities && draft.suggestedCapabilities.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Capabilities:</span>
                  {draft.suggestedCapabilities.map((c) => (
                    <span key={c} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-600 dark:text-indigo-400">
                      {capabilityLabels[c] || c}
                    </span>
                  ))}
                </div>
              )}

              {draft.suggestedDeployments && draft.suggestedDeployments.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Deploy to:</span>
                  {draft.suggestedDeployments.map((d) => (
                    <span key={d} className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400">
                      {deploymentLabels[d] || d}
                    </span>
                  ))}
                </div>
              )}

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
