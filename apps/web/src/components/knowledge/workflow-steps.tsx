import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  key: string
}

const steps: Step[] = [
  { label: 'Create', key: 'create' },
  { label: 'Add Content', key: 'content' },
  { label: 'Index', key: 'index' },
  { label: 'Test', key: 'test' },
  { label: 'Connect', key: 'connect' },
]

interface WorkflowStepsProps {
  currentStep: number
  className?: string
}

export function WorkflowSteps({ currentStep, className }: WorkflowStepsProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep
        const isPending = i > currentStep

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  isPending && 'border-border bg-muted/50 text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-2 fill-current" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCompleted && 'text-foreground',
                  isCurrent && 'text-foreground',
                  isPending && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-6 sm:w-10',
                  i < currentStep ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
