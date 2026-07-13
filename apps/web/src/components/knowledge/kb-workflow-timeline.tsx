import { Check, Loader2, Circle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelative } from './kb-format'
import type { KbWorkflowStep } from './kb-types'

function StepIcon({ state, className }: { state: KbWorkflowStep['state']; className?: string }) {
  if (state === 'complete') return <Check className={cn('size-3.5', className)} />
  if (state === 'active') return <Loader2 className={cn('size-3.5 animate-spin', className)} />
  return <Circle className={cn('size-2.5 fill-current', className)} />
}

const stateNode: Record<
  KbWorkflowStep['state'],
  { ring: string; bg: string; text: string }
> = {
  complete: { ring: 'border-success/40', bg: 'bg-success/10', text: 'text-success' },
  active: { ring: 'border-info/50', bg: 'bg-info/10', text: 'text-info' },
  pending: { ring: 'border-border', bg: 'bg-muted/40', text: 'text-muted-foreground' },
}

export function KbWorkflowTimeline({ steps }: { steps: KbWorkflowStep[] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold">Progress</h2>
        <span className="text-xs text-muted-foreground">
          {steps.filter((s) => s.state === 'complete').length}/{steps.length} complete
        </span>
      </div>

      <ol className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => {
          const node = stateNode[step.state]
          const next = steps[i + 1]
          return (
            <li key={step.key} className="relative flex gap-3 lg:flex-col lg:gap-0">
              <div className="flex items-start gap-3 lg:flex-col lg:items-stretch">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                      node.ring,
                      node.bg,
                      node.text,
                    )}
                  >
                    <StepIcon state={step.state} />
                  </span>
                  {next && (
                    <span
                      className={cn(
                        'h-px w-6 bg-border lg:hidden',
                        step.state === 'complete' && 'bg-success/40',
                      )}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1 lg:mt-2.5 lg:pr-2">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="mt-1 text-[11px] tabular-nums text-muted-foreground/70">
                    {step.timestamp ? formatRelative(step.timestamp) : '—'}
                  </p>
                </div>
              </div>

              {next && (
                <span className="absolute top-7 left-[13px] bottom-0 w-px bg-border max-lg:hidden" />
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export type { LucideIcon }
