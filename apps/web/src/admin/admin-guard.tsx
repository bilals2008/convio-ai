import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function AdminGuard() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex max-w-sm flex-col items-center gap-4 p-8 text-center">
          <ShieldX className="size-12 text-destructive" />
          <h1 className="text-lg font-semibold text-foreground">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This area is restricted to platform administrators. If you believe this is a mistake,
            contact the platform owner.
          </p>
          <Button variant="outline" render={<a href="/dashboard" />}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
