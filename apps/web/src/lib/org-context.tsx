import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useOrganizations, type Organization } from '@/lib/hooks/useOrganizations'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'

interface OrgContextValue {
  orgId: string | null
  org: Organization | null
  orgs: Organization[]
  isLoading: boolean
  isCreating: boolean
  createError: Error | null
  retryCreate: () => void
  setOrgId: (id: string) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'workspace'
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const { data: orgs, isLoading, refetch: refetchOrgs } = useOrganizations({ enabled: isAuthenticated })
  const [orgId, setOrgId] = useState<string | null>(() => {
    return localStorage.getItem('currentOrgId')
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)
  const autoCreated = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading && orgs && orgs.length === 0 && !autoCreated.current) {
      autoCreated.current = true
      setIsCreating(true)
      setCreateError(null)
      const name = user?.name ? `${user.name.split(' ')[0]}'s Workspace` : 'My Workspace'
      const slug = generateSlug(name)
      api.post('/organizations', { name, slug })
        .then(() => refetchOrgs())
        .catch((err) => {
          setCreateError(err instanceof Error ? err : new Error('Failed to create workspace'))
        })
        .finally(() => setIsCreating(false))
    }
  }, [isAuthenticated, isLoading, orgs, user, refetchOrgs])

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

  const retryCreate = useCallback(() => {
    autoCreated.current = false
    setCreateError(null)
    refetchOrgs()
  }, [refetchOrgs])

  return (
    <OrgContext.Provider
      value={{
        orgId: currentOrg?.id ?? null,
        org: currentOrg ?? null,
        orgs: orgs ?? [],
        isLoading,
        isCreating,
        createError,
        retryCreate,
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
