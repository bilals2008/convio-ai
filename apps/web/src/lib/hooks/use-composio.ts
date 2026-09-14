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
 * Start a toolkit connection. Opens Composio's hosted OAuth page in a
 * Google-style centered popup window (not a full new tab) and polls the
 * connection status so every open view flips to "Connected" as soon as the
 * user finishes — then closes the popup automatically.
 */
export function useConnectComposioToolkit() {
  const queryClient = useQueryClient()
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

      // Centered popup (Google OAuth style): ~520×680 over the current window.
      const width = 520
      const height = 680
      const left = Math.max(0, (window.innerWidth - width) / 2)
      const top = Math.max(0, (window.innerHeight - height) / 2)
      const popup = window.open(
        data.connectUrl,
        `composio-connect-${data.toolkit}`,
        `width=${width},height=${height},left=${left},top=${top},popup=yes,noopener,noreferrer`,
      )
      if (!popup) {
        // Popup blocked → fall back to a normal tab so the flow still works.
        toast.error('Popup blocked — opening in a new tab instead')
        window.open(data.connectUrl, '_blank', 'noopener,noreferrer')
      }

      // Poll while OAuth completes. When the toolkit flips to connected,
      // close the popup and refresh status everywhere.
      const toolkitsKey = ['composio-toolkits', orgId]
      const startedAt = Date.now()
      const interval = setInterval(async () => {
        if (Date.now() - startedAt > 5 * 60_000) {
          clearInterval(interval)
          return
        }
        try {
          await queryClient.invalidateQueries({ queryKey: toolkitsKey })
          const fresh = queryClient.getQueryData<ComposioToolkit[]>(toolkitsKey)
          const nowConnected = fresh?.some(
            (t) => t.slug === data.toolkit && t.connected,
          )
          if (nowConnected) {
            clearInterval(interval)
            if (popup && !popup.closed) popup.close()
            toast.success(`${data.toolkit} connected successfully`)
          }
        } catch {
          // transient — keep polling
        }
      }, 3_000)

      // Stop polling when leaving the page.
      window.addEventListener(
        'pagehide',
        () => {
          clearInterval(interval)
        },
        { once: true },
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start toolkit connection')
    },
  })
}
