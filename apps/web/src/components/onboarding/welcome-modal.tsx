import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { GoalGrid } from './goal-grid'
import { SkipConfirmation } from './skip-confirmation'
import { useSkipOnboarding } from '@/lib/hooks/use-onboarding'

interface WelcomeModalProps {
  open: boolean
  loading: boolean
}

export function WelcomeModal({ open, loading }: WelcomeModalProps) {
  const [skipOpen, setSkipOpen] = useState(false)
  const { mutate: skip } = useSkipOnboarding()

  function handleSkip() {
    setSkipOpen(true)
  }

  function handleConfirmSkip() {
    setSkipOpen(false)
    skip()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Welcome to Convio</DialogTitle>
            <DialogDescription>
              Let&apos;s get you set up in seconds. Pick a goal and we&apos;ll guide you through the first step.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <GoalGrid onSkip={handleSkip} />
          )}
        </DialogContent>
      </Dialog>
      <SkipConfirmation
        open={skipOpen}
        onOpenChange={setSkipOpen}
        onConfirm={handleConfirmSkip}
      />
    </>
  )
}
