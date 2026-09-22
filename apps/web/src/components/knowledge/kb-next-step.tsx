import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWorkflow, type KnowledgeBaseDetail } from './kb-types'

interface KbNextStepProps {
  kb: KnowledgeBaseDetail
  hasTested: boolean
  onAddSource: () => void
  onNavigate: (tab: string) => void
}

export function KbNextStep({ kb, hasTested, onAddSource, onNavigate }: KbNextStepProps) {
  const steps = buildWorkflow(kb, [], hasTested, false)
  const nextPending = steps.find((s) => s.state !== 'complete')

  if (!nextPending) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3">
        <p className="text-sm font-medium text-success">All steps complete! Your knowledge base is ready.</p>
      </div>
    )
  }

  const actions: Record<string, () => void> = {
    sources: onAddSource,
    testing: () => onNavigate('test'),
    connected: () => onNavigate('overview'),
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((step) =>
              step.state === 'complete' ? (
                <CheckCircle2 key={step.key} className="size-4 text-success" />
              ) : step.state === 'active' ? (
                <div key={step.key} className="size-4 rounded-full border-2 border-primary animate-pulse" />
              ) : (
                <Circle key={step.key} className="size-4 text-muted-foreground/40" />
              ),
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{nextPending.label}</p>
            <p className="text-xs text-muted-foreground">{nextPending.description}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={actions[nextPending.key] ?? (() => onNavigate(nextPending.key))}>
          Next
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
