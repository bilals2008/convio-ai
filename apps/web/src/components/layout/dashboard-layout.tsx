import { useState, useCallback } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Loader2, RefreshCw, Building2 } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { SidebarContext } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import { ProClaimModal } from '@/components/landing/pro-claim-modal'
import { NetworkStatusBanner } from '@/components/shared/network-status-banner'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isCreating, createError, retryCreate } = useOrg()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isCreating) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="size-8 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Preparing your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Setting up your organization...</p>
        </div>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (createError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <Building2 className="size-8 text-destructive" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Failed to create workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">We couldn't create your workspace. Please try again.</p>
        </div>
        <Button variant="outline" size="sm" onClick={retryCreate}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    )
  }

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, toggleCollapsed, toggleMobile }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <NetworkStatusBanner />
          <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
        <ProClaimModal />
      </div>
    </SidebarContext.Provider>
  )
}
