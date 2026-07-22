import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/hooks/useAuth'
import { usePlan } from '@/lib/hooks/use-billing'

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <Sparkles className="size-7 text-emerald-500" />
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                You're on the <span className="text-primary">Free</span> plan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                For a limited time, you can unlock <span className="font-medium text-foreground">Pro</span> features for free — no payment needed.
              </p>

              <div className="mt-5 w-full space-y-2 text-left">
                {[
                  '5 AI agents (up from 1)',
                  '25,000 messages/mo (up from 500)',
                  '10 knowledge bases',
                  'Multi-channel support',
                  'Advanced analytics',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="size-3 text-emerald-500" />
                    </span>
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 w-full flex flex-col gap-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setOpen(false)
                    navigate('/settings/billing?claim=pro')
                  }}
                >
                  <Sparkles className="size-4" />
                  Activate Pro Free
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setOpen(false)}
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
