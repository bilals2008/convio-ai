import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useOrganizations, type Organization } from '@/lib/hooks/useOrganizations'
import { useAuth } from '@/lib/auth-context'

interface OrgContextValue {
  orgId: string | null
  org: Organization | null
  orgs: Organization[]
  isLoading: boolean
  setOrgId: (id: string) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { data: orgs, isLoading } = useOrganizations({ enabled: isAuthenticated })
  const [orgId, setOrgId] = useState<string | null>(() => {
    return localStorage.getItem('currentOrgId')
  })

  useEffect(() => {
    if (orgs && orgs.length > 0 && !orgId) {
      const first = orgs[0]
      setOrgId(first.id)
      localStorage.setItem('currentOrgId', first.id)
    }
  }, [orgs, orgId])

  useEffect(() => {
    if (orgId) {
      localStorage.setItem('currentOrgId', orgId)
    }
  }, [orgId])

  const currentOrg = orgs?.find((o) => o.id === orgId) || (orgs && orgs.length > 0 ? orgs[0] : null)

  const handleSetOrgId = (id: string) => {
    setOrgId(id)
    localStorage.setItem('currentOrgId', id)
  }

  return (
    <OrgContext.Provider
      value={{
        orgId: currentOrg?.id ?? null,
        org: currentOrg ?? null,
        orgs: orgs ?? [],
        isLoading,
        setOrgId: handleSetOrgId,
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
