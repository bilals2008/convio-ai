import { ArrowRight, Upload, FlaskConical, Plug, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { KnowledgeBaseDetail } from './kb-types'

interface KbNextStepProps {
  kb: KnowledgeBaseDetail
  hasTested: boolean
  onAddSource: () => void
  onNavigate: (tab: string) => void
}

export function KbNextStep({ kb, hasTested, onAddSource, onNavigate }: KbNextStepProps) {
  if (kb.status === 'failed') return null

  const step = kb.documentCount === 0
    ? {
        icon: Upload,
        title: 'Add your first source',
        description: 'Upload a document or connect a source to start building context.',
        cta: 'Add Source',
        action: onAddSource,
        spinning: false,
      }
    : kb.status === 'indexing'
      ? {
          icon: Loader2,
          title: 'Indexing in progress',
          description: 'Your documents are being chunked and embedded. This usually takes a minute.',
          cta: 'View Sources',
          action: () => onNavigate('sources'),
          spinning: true,
        }
      : !hasTested
        ? {
            icon: FlaskConical,
            title: 'Run a test query',
            description: 'Verify retrieval works before connecting this base to an agent.',
            cta: 'Test',
            action: () => onNavigate('test'),
            spinning: false,
          }
        : {
            icon: Plug,
            title: 'Connect to an agent',
            description: 'Your knowledge base is ready. Link it to an agent to go live.',
            cta: 'Connect',
            action: () => onNavigate('overview'),
            spinning: false,
          }

  const Icon = step.icon

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className={step.spinning ? 'size-4 animate-spin' : 'size-4'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{step.title}</p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
      <Button size="sm" className="gap-1.5" onClick={step.action}>
        {step.cta}
        {!step.spinning && <ArrowRight className="size-3.5" />}
      </Button>
    </div>
  )
}
