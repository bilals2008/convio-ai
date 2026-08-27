import { useState } from 'react'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PendingToolInput } from '@/lib/hooks/use-playground-chat'

export function QuestionCard({
  pending,
  onAnswer,
}: {
  pending: PendingToolInput
  onAnswer: (answers: Array<{ question: string; answer: string }>) => void
}) {
  const { questions } = pending
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({})

  const current = questions[step]
  const isLast = step === questions.length - 1
  const hasAnswer = !!answers[step]

  const handleSubmit = () => {
    const result = questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] || customInputs[i] || '',
    }))
    onAnswer(result)
  }

  return (
    <div className="sticky bottom-2 isolate z-50 mx-auto w-full max-w-2xl px-6 pt-2">
      <div className="w-full rounded-3xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5">
        {questions.length > 1 && (
          <div className="mb-4 text-xs font-medium text-muted-foreground tabular-nums">
            {step + 1} of {questions.length}
          </div>
        )}

        <div key={step} className="space-y-4">
          <h4 className="font-heading text-base font-semibold text-pretty">
            {current.question}
          </h4>

          <div className="grid gap-3">
            {current.choices.map((choice) => (
              <label
                key={choice}
                className={cn(
                  'relative flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-input bg-input/20 px-4 py-3 text-start text-sm transition-colors outline-none select-none hover:bg-input/40',
                  answers[step] === choice && !customInputs[step]
                    ? 'border-primary/40 bg-primary/10'
                    : '',
                )}
              >
                <input
                  type="radio"
                  name={`q-${step}`}
                  value={choice}
                  checked={answers[step] === choice && !customInputs[step]}
                  onChange={() => {
                    setAnswers((prev) => ({ ...prev, [step]: choice }))
                    setCustomInputs((prev) => ({ ...prev, [step]: '' }))
                  }}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <span
                  className={cn(
                    'pointer-events-none relative flex size-4 shrink-0 items-center justify-center rounded-full border bg-input/90 transition-colors',
                    answers[step] === choice && !customInputs[step]
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-transparent',
                  )}
                >
                  {answers[step] === choice && !customInputs[step] && (
                    <span className="size-2 rounded-full bg-primary-foreground" />
                  )}
                </span>
                <span className="flex-1 leading-snug">{choice}</span>
              </label>
            ))}

            <input
              type="text"
              placeholder="Type another answer…"
              value={customInputs[step] || ''}
              onChange={(e) => {
                setCustomInputs((prev) => ({ ...prev, [step]: e.target.value }))
                if (e.target.value) {
                  setAnswers((prev) => ({ ...prev, [step]: '' }))
                }
              }}
              className="h-11 w-full rounded-2xl border border-transparent bg-input/30 px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 placeholder:text-muted-foreground md:text-sm"
            />
          </div>
        </div>

        <div className="mt-4 grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="col-start-1 row-start-1 justify-self-start"
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          {!isLast ? (
            <Button
              variant="default"
              size="sm"
              className="col-start-3 row-start-1 justify-self-end"
              disabled={!hasAnswer && !customInputs[step]}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="col-start-3 row-start-1 justify-self-end"
              disabled={!hasAnswer && !customInputs[step]}
              onClick={handleSubmit}
            >
              <Send className="size-4" />
              Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
