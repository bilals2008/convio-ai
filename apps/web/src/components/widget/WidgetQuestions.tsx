import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'

export function WidgetQuestions() {
  const { pendingQuestions, onAnswerQuestions } = useWidgetState()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({})

  // Reset internal state whenever a new question set arrives.
  useEffect(() => {
    setStep(0)
    setAnswers({})
    setCustomInputs({})
  }, [pendingQuestions])

  if (!pendingQuestions) return null

  const questions = pendingQuestions.questions
  const current = questions[step]
  if (!current) return null

  const isLast = step === questions.length - 1
  const hasAnswer = !!answers[step] || !!customInputs[step]

  const handleSubmit = () => {
    const result = questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] || customInputs[i] || '',
    }))
    onAnswerQuestions(result)
  }

  const primaryText = 'text-white'
  const disabledCls = 'bg-[hsl(var(--widget-muted))] text-[hsl(var(--widget-muted-foreground))] cursor-not-allowed'

  return (
    <div className="convio-questions shrink-0 border-t border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-footer-bg))] px-3 pb-2.5 pt-3">
      {questions.length > 1 && (
        <p className="mb-1.5 text-[11px] font-medium text-[hsl(var(--widget-muted-foreground))]">
          Question {step + 1} of {questions.length}
        </p>
      )}
      <p className="mb-2 text-[13px] font-semibold leading-snug text-[hsl(var(--widget-text))]">
        {current.question}
      </p>
      <div className="flex flex-col gap-1.5">
        {current.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => {
              setAnswers((prev) => ({ ...prev, [step]: choice }))
              setCustomInputs((prev) => ({ ...prev, [step]: '' }))
            }}
            className={cn(
              'rounded-lg border px-3 py-2 text-start text-[13px] leading-snug transition-colors',
              answers[step] === choice && !customInputs[step]
                ? 'border-[hsl(var(--widget-primary))] bg-[hsl(var(--widget-primary)_/_0.12)] text-[hsl(var(--widget-text))]'
                : 'border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] text-[hsl(var(--widget-text))] hover:border-[hsl(var(--widget-primary)_/_0.5)]',
            )}
          >
            {choice}
          </button>
        ))}
        <input
          type="text"
          value={customInputs[step] || ''}
          onChange={(e) => {
            setCustomInputs((prev) => ({ ...prev, [step]: e.target.value }))
            if (e.target.value) setAnswers((prev) => ({ ...prev, [step]: '' }))
          }}
          placeholder="Type another answer…"
          className="rounded-lg border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] px-3 py-2 text-[13px] text-[hsl(var(--widget-text))] placeholder:text-[hsl(var(--widget-muted-foreground))]/60 outline-none focus:border-[hsl(var(--widget-primary)_/_0.6)]"
        />
      </div>
      <div className="mt-2 flex justify-end gap-1.5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--widget-border))] px-2.5 py-1.5 text-[12px] text-[hsl(var(--widget-muted-foreground))] transition-colors hover:text-[hsl(var(--widget-text))]"
          >
            <ChevronLeft className="size-3.5" />
            Back
          </button>
        )}
        {!isLast ? (
          <button
            type="button"
            disabled={!hasAnswer}
            onClick={() => setStep((s) => s + 1)}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors',
              hasAnswer ? primaryText : disabledCls,
            )}
            style={hasAnswer ? { background: 'hsl(var(--widget-send-btn))' } : undefined}
          >
            Next
            <ChevronRight className="size-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!hasAnswer}
            onClick={handleSubmit}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors',
              hasAnswer ? primaryText : disabledCls,
            )}
            style={hasAnswer ? { background: 'hsl(var(--widget-send-btn))' } : undefined}
          >
            <Send className="size-3.5" />
            Answer
          </button>
        )}
      </div>
    </div>
  )
}