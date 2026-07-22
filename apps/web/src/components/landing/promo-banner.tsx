import { Link } from 'react-router-dom'

export function PromoBanner() {
  return (
    <div className="relative bg-gradient-to-r from-emerald-600/20 via-primary/20 to-emerald-600/20 border-b border-primary/10">
      <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-2 px-5 py-2.5 text-xs md:text-sm">
        <span className="text-foreground">
          <span className="font-semibold text-emerald-500">Limited Time:</span>{' '}
          Get <span className="font-semibold text-primary">Pro Plan</span> free — no credit card required!
        </span>
        <Link
          to="/signup?claim=pro"
          className="shrink-0 font-medium text-primary underline underline-offset-4 hover:text-emerald-500 transition-colors"
        >
          Claim now →
        </Link>
      </div>
    </div>
  )
}
