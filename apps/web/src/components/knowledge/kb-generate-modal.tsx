import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface KbGenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PLACEHOLDERS = [
  'Dental clinic in Lahore — appointments, treatments, pricing, timings',
  'Shopify store selling handmade candles — shipping, returns, product care',
  'SaaS invoicing tool for freelancers — features, plans, onboarding',
  'Restaurant in Dubai — menu, reservations, catering, dietary info',
  'Real estate agency — listings, viewing schedule, pricing, mortgage FAQs',
]

const CYCLE_MS = 4000

export function KbGenerateModal({ open, onOpenChange }: KbGenerateModalProps) {
  const { orgId } = useOrg()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Cycle placeholders when empty + unfocused
  useEffect(() => {
    if (!open || value.trim() || isFocused) return
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [open, value, isFocused])

  // Tab fills placeholder
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !value.trim()) {
        e.preventDefault()
        setValue(PLACEHOLDERS[placeholderIdx])
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
        textareaRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, value, placeholderIdx])

  const generateMutation = useMutation({
    mutationFn: () => knowledgeApi.generate({ organizationId: orgId, description: value.trim() }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      onOpenChange(false)
      setValue('')
      const kb = res.data?.data as { id: string } | undefined
      if (kb?.id) navigate(`/knowledge/${kb.id}`)
    },
  })

  const canGenerate = value.trim().length >= 15 && !generateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (generateMutation.isPending) return
        onOpenChange(v)
        if (!v) setValue('')
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border border-border/60 bg-card shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            Generate knowledge base
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Describe your business — AI drafts a starter KB with documents and FAQs in under a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused || value.trim() ? '' : PLACEHOLDERS[placeholderIdx]}
              rows={4}
              className="resize-none text-sm leading-relaxed"
            />
            {!value.trim() && !isFocused && (
              <div className="absolute bottom-2 right-3 text-[11px] text-muted-foreground/60 select-none">
                <kbd className="rounded border border-border/60 bg-muted/50 px-1 py-0.5 text-[10px] font-mono">Tab</kbd>
                {' '}to fill
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={generateMutation.isPending}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => generateMutation.mutate()}
              disabled={!canGenerate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>

          {generateMutation.isPending && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3 shrink-0" />
              AI is drafting your KB — documents index automatically.
            </p>
          )}
          {generateMutation.isError && (
            <p className="text-xs text-destructive">
              Generation failed — try again or shorten your description.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
