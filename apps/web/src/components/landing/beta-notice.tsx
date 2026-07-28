import { useState, useEffect } from 'react'
import { X, Shield } from 'lucide-react'

export function BetaNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('beta-notice-dismissed')) {
      const timer = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('beta-notice-dismissed', 'true')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="size-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">We're Building in Public</h3>
        <p className="mb-1 text-sm text-muted-foreground">
          Convio is currently in <span className="font-medium text-foreground">active development</span>. Features are shipping daily, and your feedback shapes what we build next.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Something broken or missing?{' '}
          <a href="mailto:team@convio.dev" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Tell us
          </a>
        </p>
        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
