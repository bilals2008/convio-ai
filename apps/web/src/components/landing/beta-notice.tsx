"use client"

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const DISMISS_KEY = 'beta-notice-dismissed'

export function BetaNotice() {
  const [open, setOpen] = useState(false)
  const [dontShow, setDontShow] = useState(true)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const timer = setTimeout(() => setOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = (remember: boolean) => {
    if (remember) localStorage.setItem(DISMISS_KEY, 'true')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">We're building in public</DialogTitle>
          <DialogDescription className="text-center">
            Convio is in active development. Features ship daily, and your feedback
            shapes what we build next.
          </DialogDescription>
          <DialogDescription className="text-center">
            Something broken or missing?{' '}
            <a
              href="mailto:teambilaldev@gmail.com"
              className="text-primary hover:text-primary/80"
            >
              Tell us
            </a>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="!flex-col !items-stretch gap-3">
          <Label className="flex items-center justify-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(v === true)} />
            Don't show this message again
          </Label>
          <Button className="w-full" onClick={() => dismiss(dontShow)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
