import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/hooks/useAuth'
import { usePlan } from '@/lib/hooks/use-billing'

function FreeBadge3D() {
  return (
    <div className="relative mb-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.1 }}
        className="relative"
      >
        <img
          src="/free-badge.png"
          alt="FREE"
          className="object-contain drop-shadow-[0_0_28px_hsl(136_76%_45%/0.4)]"
          style={{ width: '140px', transform: 'scale(1.35)' }}
        />
      </motion.div>
    </div>
  )
}

export function ProClaimModal() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { data: plan } = usePlan()
  const navigate = useNavigate()

  useEffect(() => {
    const shown = sessionStorage.getItem('pro-claim-modal-shown')
    if (session?.user && plan?.name === 'free' && !shown) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('pro-claim-modal-shown', 'true')
        setOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [session, plan])

  const dismiss = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  const features = [
    '5 AI agents (up from 1)',
    '25,000 messages/mo (up from 500)',
    '10 knowledge bases',
    'Multi-channel support',
    'Advanced analytics',
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', duration: 0.55, bounce: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-2xl"
          >
            {/* Subtle radial glow behind badge area */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-48 w-64 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(136 76% 45% / 0.25) 0%, transparent 70%)',
              }}
            />

            <button
              onClick={dismiss}
              className="absolute right-3.5 top-3.5 z-10 flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <FreeBadge3D />

              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                You're on the <span className="text-primary">Free</span> plan
              </h2>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                For a limited time, you can unlock <span className="font-medium text-foreground">Pro</span> features for free — no payment needed.
              </p>

              <div className="mt-6 w-full space-y-3 text-left">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="size-3 text-primary" strokeWidth={3} />
                    </span>
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 w-full flex flex-col gap-2.5">
                <Button
                  className="group w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    setOpen(false)
                    navigate('/settings/billing?claim=pro')
                  }}
                >
                  Activate Pro Free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={dismiss}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
