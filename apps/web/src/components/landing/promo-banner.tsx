import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export function PromoBanner({ hidden }: { hidden?: boolean }) {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem('promo-trial-banner-dismissed')
  })

  if (!visible || hidden) return null

  const dismiss = () => {
    sessionStorage.setItem('promo-trial-banner-dismissed', 'true')
    setVisible(false)
  }

  return (
    <div className="relative bg-gradient-to-r from-emerald-600/20 via-primary/20 to-emerald-600/20 border-b border-primary/10">
      <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-2 px-5 py-2.5 text-xs md:text-sm">
        <span className="text-foreground">
          <span className="font-semibold text-emerald-500">Free Trial:</span>{' '}
          Try <span className="font-semibold text-primary">Pro Plan</span> 14 days free — no credit card needed!
        </span>
        <Link
          to="/signup?trial=pro"
          className="shrink-0 font-medium text-primary underline underline-offset-4 hover:text-emerald-500 transition-colors"
        >
          Start trial →
        </Link>
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss banner"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}