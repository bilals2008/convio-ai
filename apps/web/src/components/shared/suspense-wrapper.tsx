import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { LoadingPage } from '@/components/shared/loading'

interface SuspenseWrapperProps {
  children: ReactNode
  name?: string
  fallback?: ReactNode
}

export function SuspenseWrapper({ children, name, fallback }: SuspenseWrapperProps) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={fallback || <LoadingPage />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}
