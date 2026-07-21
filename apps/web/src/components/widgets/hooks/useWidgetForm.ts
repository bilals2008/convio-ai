import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import type { WidgetDetail, PromptItem, ApiError } from '../types'
import { generateId, sanitizeDomain } from '../helpers'
import { MAX_PROMPTS } from '../constants'

export function useWidgetForm(widgetId: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const { data: widget, isLoading } = useQuery({
    queryKey: ['widget', widgetId],
    queryFn: async () => (await widgetsApi.get(widgetId)).data.data as WidgetDetail,
    enabled: Boolean(widgetId),
  })

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [prompts, setPrompts] = useState<PromptItem[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState('')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#fb923c')
  const [backgroundColor, setBackgroundColor] = useState('#1c1c1c')
  const [textColor, setTextColor] = useState('#f3f4f6')
  const [agentName, setAgentName] = useState('')
  const [agentAvatar, setAgentAvatar] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!widget) return
    setName(widget.name)
    setGreeting(widget.config.greeting ?? '')
    setPrompts((widget.config.quickReplies ?? []).map((text) => ({ id: generateId(), text })))
    setDomains(widget.allowedDomains ?? [])
    setPosition(widget.config.position ?? 'bottom-right')
    setPrimaryColor(widget.config.primaryColor ?? '#fb923c')
    setBackgroundColor(widget.config.backgroundColor ?? '#1c1c1c')
    setTextColor(widget.config.textColor ?? '#f3f4f6')
    setAgentName(widget.config.agentName ?? widget.agent.name ?? '')
    setAgentAvatar(widget.config.agentAvatar ?? '')
  }, [widget])

  const isDirty = useMemo(() => {
    if (!widget) return false
    const saved = {
      name: widget.name,
      greeting: widget.config.greeting ?? '',
      prompts: (widget.config.quickReplies ?? []).join('\n'),
      domains: (widget.allowedDomains ?? []).join(','),
      position: widget.config.position ?? 'bottom-right',
      primaryColor: widget.config.primaryColor ?? '#fb923c',
      backgroundColor: widget.config.backgroundColor ?? '#1c1c1c',
      textColor: widget.config.textColor ?? '#f3f4f6',
      agentName: widget.config.agentName ?? widget.agent.name ?? '',
      agentAvatar: widget.config.agentAvatar ?? '',
    }
    const current = {
      name,
      greeting,
      prompts: prompts.map((p) => p.text).join('\n'),
      domains: domains.join(','),
      position,
      primaryColor,
      backgroundColor,
      textColor,
      agentName,
      agentAvatar,
    }
    return JSON.stringify(current) !== JSON.stringify(saved)
  }, [widget, name, greeting, prompts, domains, position, primaryColor, backgroundColor, textColor, agentName, agentAvatar])

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
        config: {
          greeting,
          quickReplies: prompts.map((p) => p.text),
          position,
          primaryColor,
          backgroundColor,
          textColor,
          agentName,
          ...(agentAvatar ? { agentAvatar } : {}),
        },
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
      } else if (status === 400 && error?.response?.data?.details) {
        const msgs = error.response.data.details.map((d) => d.message).join('. ')
        toast.error(msgs || 'Please check your inputs and try again.')
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

  const addPrompt = useCallback(() => {
    setPrompts((prev) => {
      if (prev.length >= MAX_PROMPTS) return prev
      return [...prev, { id: generateId(), text: 'New prompt' }]
    })
  }, [])

  const updatePrompt = useCallback((pid: string, text: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === pid ? { ...p, text } : p)))
  }, [])

  const removePrompt = useCallback((pid: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== pid))
  }, [])

  return {
    widget,
    isLoading,
    name,
    setName,
    greeting,
    setGreeting,
    prompts,
    domainInput,
    setDomainInput,
    position,
    setPosition,
    primaryColor,
    setPrimaryColor,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    agentName,
    setAgentName,
    agentAvatar,
    setAgentAvatar,
    copied,
    activeTab,
    setActiveTab,
    deleteOpen,
    setDeleteOpen,
    isDirty,
    domains,
    save,
    deleteWidget,
    copyEmbed,
    addDomain,
    removeDomain,
    addPrompt,
    updatePrompt,
    removePrompt,
  }
}
