import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { type WidgetDetail, type WidgetConfig, type WidgetDraft, type ApiError } from '../types'
import { DEFAULT_WIDGET_CONFIG } from '../constants'
import { sanitizeDomain, isValidDomain, MAX_DOMAIN_LENGTH, MAX_DOMAINS } from '../helpers'

// Resolved config for a widget: stored values merged over defaults, with the
// agent's name as fallback for agentName.
function resolveConfig(widget: WidgetDetail): WidgetConfig {
  return {
    ...DEFAULT_WIDGET_CONFIG,
    ...widget.config,
    quickReplies: widget.config.quickReplies ?? [],
    agentName: widget.config.agentName ?? widget.agent.name ?? '',
  }
}

export function useWidgetForm(widgetId: string | undefined) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const widgetQuery = useQuery({
    queryKey: ['widget', widgetId],
    queryFn: async () => (await widgetsApi.get(widgetId!)).data.data as WidgetDetail,
    enabled: Boolean(widgetId),
  })
  const widget = widgetQuery.data

  const { data: embedSnippet } = useQuery({
    queryKey: ['widget-embed', widgetId],
    queryFn: async () => (await widgetsApi.getEmbed(widgetId!)).data.data.snippet as string,
    enabled: Boolean(widgetId),
  })

  const [name, setName] = useState('')
  const [domains, setDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState('')
  const [config, setConfigState] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('appearance')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const initializedWidgetId = useRef<string | null>(null)

  // Patch-style setter: setConfig({ primaryColor: '#fff' }) merges over current.
  const setConfig = useCallback((patch: Partial<WidgetConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }))
  }, [])

  // Seeds the editable form from a server payload. Used both on first load and
  // after a save, so the local state always mirrors what the API actually stored
  // (which clears the "Unsaved" indicator).
  const syncFromWidget = useCallback((next: WidgetDetail) => {
    initializedWidgetId.current = next.id
    setName(next.name)
    setDomains(next.allowedDomains ?? [])
    setConfigState(resolveConfig(next))
  }, [])

  useEffect(() => {
    if (!widget) return
    if (initializedWidgetId.current === widget.id) return
    syncFromWidget(widget)
  }, [widget, syncFromWidget])

  const isDirty = useMemo(() => {
    if (!widget) return false
    const saved = {
      name: widget.name,
      domains: (widget.allowedDomains ?? []).join(','),
      config: resolveConfig(widget),
    }
    const current = { name, domains: domains.join(','), config }
    return JSON.stringify(current) !== JSON.stringify(saved)
  }, [widget, name, domains, config])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const save = useMutation({
    mutationFn: (status?: string) =>
      widgetsApi.update(widgetId!, {
        name,
        status,
        allowedDomains: domains,
        config: {
          ...config,
          greeting: config.greeting?.trim() || DEFAULT_WIDGET_CONFIG.greeting,
        },
      }),
    onSuccess: (response, status) => {
      const updated = response.data.data as WidgetDetail
      syncFromWidget(updated)
      queryClient.setQueryData(['widget', widgetId], updated)
      queryClient.invalidateQueries({ queryKey: ['widget', widgetId] })
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success(
        status === 'active' ? 'Widget published' : status === 'paused' ? 'Widget paused' : 'Widget saved',
      )
    },
    onError: (error: ApiError) => {
      const status = error?.response?.status
      if (status === 402) {
        toast.error('You have reached your plan limit. Upgrade to publish or save more widgets.', {
          action: { label: 'Upgrade', onClick: () => navigate('/settings/billing') },
          duration: 8000,
        })
      } else if (status === 400) {
        const msg = error?.response?.data?.message
        toast.error(msg || 'Please check your inputs and try again.')
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.')
      }
    },
  })

  const deleteWidget = useMutation({
    mutationFn: () => widgetsApi.delete(widgetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget deleted')
      navigate('/widgets')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const copyEmbed = useCallback(async () => {
    const response = await widgetsApi.getEmbed(widgetId!)
    await navigator.clipboard.writeText(response.data.data.snippet)
    setCopied(true)
    toast.success('Embed code copied')
    window.setTimeout(() => setCopied(false), 2000)
  }, [widgetId])

  const addDomain = useCallback(() => {
    const d = sanitizeDomain(domainInput)
    if (!d) return
    if (d.length > MAX_DOMAIN_LENGTH) {
      toast.error('That domain is too long.')
      return
    }
    if (!isValidDomain(d)) {
      toast.error('Enter a valid domain without a protocol, e.g. example.com')
      return
    }
    if (domains.includes(d)) {
      toast.error('Domain already added')
      return
    }
    if (domains.length >= MAX_DOMAINS) {
      toast.error(`You can allow up to ${MAX_DOMAINS} domains.`)
      return
    }
    setDomains((prev) => [...prev, d])
    setDomainInput('')
  }, [domainInput, domains])

  const removeDomain = useCallback((d: string) => {
    setDomains((prev) => prev.filter((x) => x !== d))
  }, [])

  const applyAiDraft = useCallback(
    (draft: WidgetDraft) => {
      const { name: draftName, ...rest } = draft
      if (draftName) setName(draftName)
      if (rest.quickReplies) rest.quickReplies = rest.quickReplies.slice(0, 4)
      setConfig(rest)
      setActiveTab('appearance')
      toast.success('AI design applied — review and save')
    },
    [setConfig],
  )

  return {
    widget,
    isLoading: widgetQuery.isLoading,
    isError: widgetQuery.isError,
    refetch: widgetQuery.refetch,
    embedSnippet,
    name,
    setName,
    domainInput,
    setDomainInput,
    domains,
    addDomain,
    removeDomain,
    config,
    setConfig,
    copied,
    activeTab,
    setActiveTab,
    applyAiDraft,
    deleteOpen,
    setDeleteOpen,
    isDirty,
    save,
    deleteWidget,
    copyEmbed,
  }
}
