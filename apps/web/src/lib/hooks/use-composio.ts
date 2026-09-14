import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { composio as composioApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'

export interface ComposioConfig {
  id: string
  organizationId: string
  enabledToolkits: string[]
  createdAt: string
  updatedAt: string
  hasApiKey: boolean
}

export interface ComposioToolkit {
  slug: string
  enabled: boolean
  connected: boolean
}

export function useComposioConfig() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['composio-config', orgId],
    queryFn: async () => {
      if (!orgId) return null
      const res = await composioApi.get(orgId)
      return res.data.data as ComposioConfig | null
    },
    enabled: !!orgId,
  })
}

export function useComposioToolkits(options?: { refetchInterval?: number }) {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['composio-toolkits', orgId],
    queryFn: async () => {
      if (!orgId) return []
      const res = await composioApi.listToolkits(orgId)
      return res.data.data as ComposioToolkit[]
    },
    enabled: !!orgId,
    ...options,
  })
}

export function useCreateComposioConfig() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (data: { apiKey: string; enabledToolkits: string[] }) => {
      if (!orgId) throw new Error('No organization selected')
      const res = await composioApi.create(orgId, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composio-config', orgId] })
      toast.success('Composio configured successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to configure Composio')
    },
  })
}

export function useUpdateComposioConfig() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (data: { apiKey?: string; enabledToolkits?: string[] }) => {
      if (!orgId) throw new Error('No organization selected')
      const res = await composioApi.update(orgId, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composio-config', orgId] })
      queryClient.invalidateQueries({ queryKey: ['composio-toolkits', orgId] })
      toast.success('Composio configuration updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update Composio configuration')
    },
  })
}

export function useDeleteComposioConfig() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No organization selected')
      await composioApi.delete(orgId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composio-config', orgId] })
      queryClient.invalidateQueries({ queryKey: ['composio-toolkits', orgId] })
      toast.success('Composio configuration removed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove Composio configuration')
    },
  })
}

/**
 * Start a toolkit connection. Navigates the current tab to Composio's hosted
 * OAuth page; Composio redirects back to Settings → Composio with
 * ?composio_connect=<toolkit>&status=success|failed when done (handled there).
 */
export function useConnectComposioToolkit() {
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (toolkit: string) => {
      if (!orgId) throw new Error('No organization selected')
      const res = await composioApi.connect(orgId, toolkit)
      return res.data.data as { toolkit: string; connectUrl: string }
    },
    onSuccess: (data) => {
      if (!data?.connectUrl) {
        toast.error('Composio did not return a connect link')
        return
      }

      // Same-tab redirect (like the MCP + Kapso flows) — no popup blockers.
      window.location.href = data.connectUrl
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start toolkit connection')
    },
  })
}

/**
 * Revoke a toolkit's connected account at Composio. The card flips back to
 * "Connect" once the query cache refreshes.
 */
export function useDisconnectComposioToolkit() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: async (toolkit: string) => {
      if (!orgId) throw new Error('No organization selected')
      const res = await composioApi.disconnect(orgId, toolkit)
      return res.data.data as { toolkit: string; disconnected: boolean }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['composio-toolkits', orgId] })
      toast.success(`${data.toolkit} disconnected`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect toolkit')
    },
  })
}
