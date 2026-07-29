import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { captureError } from '@/lib/error-tracking'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { component: 'GlobalErrorBoundary', info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mb-8 text-sm text-muted-foreground">
              We encountered an unexpected issue. Please try again.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="size-4" />
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
              <Button
                onClick={() => { window.location.href = '/dashboard' }}
              >
                <LayoutDashboard className="size-4" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default GlobalErrorBoundary
