import { createContext, useContext } from 'react'

export interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleCollapsed: () => void
  toggleMobile: () => void
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
