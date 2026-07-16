import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8" role="alert" aria-live="assertive">
          <AlertCircle className="size-8 text-destructive mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Something went wrong</p>
          <p className="text-xs text-muted-foreground mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <Button size="sm" variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
