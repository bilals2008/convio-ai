import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="size-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight mb-3">
          Documentation
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          We're building comprehensive guides and API references. Check back soon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="size-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
