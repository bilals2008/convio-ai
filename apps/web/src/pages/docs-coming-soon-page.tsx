import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, LifeBuoy } from 'lucide-react'

export default function DocsComingSoonPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]" />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="size-7" />
        </div>

        <Badge variant="soon" className="mb-4">
          Coming Soon
        </Badge>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Documentation is on the way
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          We're rebuilding the Convio docs from the ground up — clearer guides,
          searchable references, and a smoother reading experience. Check back soon.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/contact">
            <Button>
              <LifeBuoy className="size-4" />
              Talk to Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
