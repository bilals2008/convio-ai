import { createContext, useContext, type ReactNode } from 'react'
import { useOrganizations } from '@/lib/hooks/useOrganizations'

interface OrgContextValue {
  orgId: string | null
  org: { id: string; name: string; slug: string; logo?: string; plan?: string } | null
  isLoading: boolean
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: ReactNode }) {
  const { data: orgs, isLoading } = useOrganizations()
  const currentOrg = orgs && orgs.length > 0 ? orgs[0] : null

  return (
    <OrgContext.Provider
      value={{
        orgId: currentOrg?.id ?? null,
        org: currentOrg ?? null,
        isLoading,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
