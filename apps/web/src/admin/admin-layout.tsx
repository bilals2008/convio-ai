import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { SidebarContext } from '@/lib/sidebar-context'

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), [])

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, toggleCollapsed, toggleMobile }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
