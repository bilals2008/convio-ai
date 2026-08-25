import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { type WidgetDetail, type WidgetConfig, type ApiError } from '../types'
import { DEFAULT_WIDGET_CONFIG } from '../constants'
import type { WidgetDraft as WidgetAiDraft } from '../components/DesignAiTab'
import { sanitizeDomain } from '../helpers'

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

export function useWidgetForm(widgetId: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const { data: widget, isLoading } = useQuery({
    queryKey: ['widget', widgetId],
    queryFn: async () => (await widgetsApi.get(widgetId)).data.data as WidgetDetail,
    enabled: Boolean(widgetId),
  })

  const { data: embedSnippet } = useQuery({
    queryKey: ['widget-embed', widgetId],
    queryFn: async () => (await widgetsApi.getEmbed(widgetId)).data.data.snippet as string,
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

  useEffect(() => {
    if (!widget) return
    if (initializedWidgetId.current === widget.id) return
    initializedWidgetId.current = widget.id
    setName(widget.name)
    setDomains(widget.allowedDomains ?? [])
    setConfigState(resolveConfig(widget))
  }, [widget])

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
      widgetsApi.update(widgetId, {
        name,
        status,
        allowedDomains: domains,
        // greeting is not editable in this form — pass the stored value through
        config: { ...config, greeting: widget?.config?.greeting || 'Hi there!' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget', widgetId] })
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget saved')
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
    mutationFn: () => widgetsApi.delete(widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget deleted')
      navigate('/widgets')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const copyEmbed = useCallback(async () => {
    const response = await widgetsApi.getEmbed(widgetId)
    await navigator.clipboard.writeText(response.data.data.snippet)
    setCopied(true)
    toast.success('Embed code copied')
    window.setTimeout(() => setCopied(false), 2000)
  }, [widgetId])

  const addDomain = useCallback(() => {
    const d = sanitizeDomain(domainInput)
    if (!d) return
    if (domains.includes(d)) {
      toast.error('Domain already added')
      return
    }
    setDomains((prev) => [...prev, d])
    setDomainInput('')
  }, [domainInput, domains])

  const removeDomain = useCallback((d: string) => {
    setDomains((prev) => prev.filter((x) => x !== d))
  }, [])

  const applyAiDraft = useCallback(
    (draft: WidgetAiDraft) => {
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
    isLoading,
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
