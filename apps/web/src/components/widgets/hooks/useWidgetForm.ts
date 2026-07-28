import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import type { WidgetDetail, ApiError } from '../types'
import { type LauncherTemplate, type ThemeMode, type LauncherIcon } from '../constants'
import { sanitizeDomain } from '../helpers'

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
  const [domains, setDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState('')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#fb923c')
  const [backgroundColor, setBackgroundColor] = useState('#1c1c1c')
  const [textColor, setTextColor] = useState('#f3f4f6')
  const [promptBgColor, setPromptBgColor] = useState('#2a2a2a')
  const [headerGradientStart, setHeaderGradientStart] = useState('#fb923c')
  const [headerGradientEnd, setHeaderGradientEnd] = useState('#c2410c')
  const [headerGradientDirection, setHeaderGradientDirection] = useState(135)
  const [headerGradient, setHeaderGradient] = useState(true)
  const [borderColor, setBorderColor] = useState('')
  const [inputBgColor, setInputBgColor] = useState('')
  const [sendBtnColor, setSendBtnColor] = useState('')
  const [widgetHeight, setWidgetHeight] = useState(540)
  const [widgetWidth, setWidgetWidth] = useState<'narrow' | 'default' | 'wide'>('default')
  const [launcherSize, setLauncherSize] = useState<'small' | 'default' | 'large'>('default')
  const [borderRadius, setBorderRadius] = useState<'none' | 'default' | 'full'>('default')
  const [agentName, setAgentName] = useState('')
  const [agentAvatar, setAgentAvatar] = useState('')
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')
  const [headerTitle, setHeaderTitle] = useState('')
  const [headerSubtitle, setHeaderSubtitle] = useState('')
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(true)
  const [launcherIcon, setLauncherIcon] = useState<LauncherIcon>('chat')
  const [launcherLabel, setLauncherLabel] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [showPoweredBy, setShowPoweredBy] = useState(true)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('appearance')
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!widget) return
    setName(widget.name)
    setDomains(widget.allowedDomains ?? [])
    setPosition(widget.config.position ?? 'bottom-right')
    setPrimaryColor(widget.config.primaryColor ?? '#fb923c')
    setBackgroundColor(widget.config.backgroundColor ?? '#1c1c1c')
    setTextColor(widget.config.textColor ?? '#f3f4f6')
    setPromptBgColor(widget.config.promptBgColor ?? '#2a2a2a')
    setHeaderGradientStart(widget.config.headerGradientStart ?? '#fb923c')
    setHeaderGradientEnd(widget.config.headerGradientEnd ?? '#c2410c')
    setHeaderGradientDirection(widget.config.headerGradientDirection ?? 135)
    setHeaderGradient(widget.config.headerGradient ?? true)
    setBorderColor(widget.config.borderColor ?? '')
    setInputBgColor(widget.config.inputBgColor ?? '')
    setSendBtnColor(widget.config.sendBtnColor ?? '')
    setWidgetHeight(widget.config.widgetHeight ?? 540)
    setWidgetWidth(widget.config.widgetWidth ?? 'default')
    setLauncherSize(widget.config.launcherSize ?? 'default')
    setBorderRadius(widget.config.borderRadius ?? 'default')
    setAgentName(widget.config.agentName ?? widget.agent.name ?? '')
    setAgentAvatar(widget.config.agentAvatar ?? '')
    setThemeMode(widget.config.themeMode ?? 'auto')
    setHeaderTitle(widget.config.headerTitle ?? '')
    setHeaderSubtitle(widget.config.headerSubtitle ?? '')
    setShowOnlineIndicator(widget.config.showOnlineIndicator ?? true)
    setLauncherIcon(widget.config.launcherIcon ?? 'chat')
    setLauncherLabel(widget.config.launcherLabel ?? '')
    setPlaceholderText(widget.config.placeholderText ?? '')
    setShowPoweredBy(widget.config.showPoweredBy ?? true)
    setQuickReplies(widget.config.quickReplies ?? [])
  }, [widget])

   const isDirty = useMemo(() => {
     if (!widget) return false
      const saved = {
        name: widget.name,
        domains: (widget.allowedDomains ?? []).join(','),
        position: widget.config.position ?? 'bottom-right',
        primaryColor: widget.config.primaryColor ?? '#fb923c',
        backgroundColor: widget.config.backgroundColor ?? '#1c1c1c',
        textColor: widget.config.textColor ?? '#f3f4f6',
        promptBgColor: widget.config.promptBgColor ?? '#2a2a2a',
        headerGradientStart: widget.config.headerGradientStart ?? '#fb923c',
        headerGradientEnd: widget.config.headerGradientEnd ?? '#c2410c',
        headerGradientDirection: widget.config.headerGradientDirection ?? 135,
        headerGradient: widget.config.headerGradient ?? true,
        borderColor: widget.config.borderColor ?? '',
        inputBgColor: widget.config.inputBgColor ?? '',
        sendBtnColor: widget.config.sendBtnColor ?? '',
        widgetHeight: widget.config.widgetHeight ?? 540,
        widgetWidth: widget.config.widgetWidth ?? 'default',
        launcherSize: widget.config.launcherSize ?? 'default',
        borderRadius: widget.config.borderRadius ?? 'default',
        agentName: widget.config.agentName ?? widget.agent.name ?? '',
        agentAvatar: widget.config.agentAvatar ?? '',
        themeMode: widget.config.themeMode ?? 'auto',
        headerTitle: widget.config.headerTitle ?? '',
        headerSubtitle: widget.config.headerSubtitle ?? '',
        showOnlineIndicator: widget.config.showOnlineIndicator ?? true,
        launcherIcon: widget.config.launcherIcon ?? 'chat',
        launcherLabel: widget.config.launcherLabel ?? '',
        placeholderText: widget.config.placeholderText ?? '',
        showPoweredBy: widget.config.showPoweredBy ?? true,
        quickReplies: (widget.config.quickReplies ?? []).join(','),
      }
      const current = {
        name,
        domains: domains.join(','),
        position,
        primaryColor,
        backgroundColor,
        textColor,
        promptBgColor,
        headerGradientStart,
        headerGradientEnd,
        headerGradientDirection,
        headerGradient,
        borderColor,
        inputBgColor,
        sendBtnColor,
        widgetHeight,
        widgetWidth,
        launcherSize,
        borderRadius,
        agentName,
        agentAvatar,
        themeMode,
        headerTitle,
        headerSubtitle,
        showOnlineIndicator,
        launcherIcon,
        launcherLabel,
        placeholderText,
        showPoweredBy,
        quickReplies: quickReplies.join(','),
      }
      return JSON.stringify(current) !== JSON.stringify(saved)
    }, [widget, name, domains, position, primaryColor, backgroundColor, textColor, promptBgColor, headerGradientStart, headerGradientEnd, headerGradientDirection, headerGradient, borderColor, inputBgColor, sendBtnColor, widgetHeight, widgetWidth, launcherSize, borderRadius, agentName, agentAvatar, themeMode, headerTitle, headerSubtitle, showOnlineIndicator, launcherIcon, launcherLabel, placeholderText, showPoweredBy, quickReplies])

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
          position,
          primaryColor,
          backgroundColor,
          textColor,
          promptBgColor,
          headerGradientStart,
          headerGradientEnd,
          headerGradientDirection,
          headerGradient,
          borderColor,
          inputBgColor,
          sendBtnColor,
          widgetHeight,
          widgetWidth,
          launcherSize,
          borderRadius,
          agentName,
          themeMode,
          headerTitle,
          headerSubtitle,
          showOnlineIndicator,
          launcherIcon,
          launcherLabel,
          placeholderText,
          showPoweredBy,
          quickReplies,
          greeting: widget?.config?.greeting || 'Hi there!',
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

  const applyTemplate = useCallback(
    (template: LauncherTemplate) => {
      const cfg = template.config
      if (cfg.primaryColor !== undefined) setPrimaryColor(cfg.primaryColor)
      if (cfg.backgroundColor !== undefined) setBackgroundColor(cfg.backgroundColor)
      if (cfg.textColor !== undefined) setTextColor(cfg.textColor)
      if (cfg.promptBgColor !== undefined) setPromptBgColor(cfg.promptBgColor)
      if (cfg.headerGradientStart !== undefined) setHeaderGradientStart(cfg.headerGradientStart)
      if (cfg.headerGradientEnd !== undefined) setHeaderGradientEnd(cfg.headerGradientEnd)
      if (cfg.borderColor !== undefined) setBorderColor(cfg.borderColor)
      if (cfg.inputBgColor !== undefined) setInputBgColor(cfg.inputBgColor)
      if (cfg.sendBtnColor !== undefined) setSendBtnColor(cfg.sendBtnColor)
      if (cfg.position !== undefined) setPosition(cfg.position)
      if (cfg.widgetHeight !== undefined) setWidgetHeight(cfg.widgetHeight)
      if (cfg.widgetWidth !== undefined) setWidgetWidth(cfg.widgetWidth)
      if (cfg.launcherSize !== undefined) setLauncherSize(cfg.launcherSize)
      if (cfg.borderRadius !== undefined) setBorderRadius(cfg.borderRadius)
      setActiveTemplate(template.id)
    },
    [],
  )

  return {
    widget,
    isLoading,
    name,
    setName,
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
    promptBgColor,
    setPromptBgColor,
    headerGradientStart,
    setHeaderGradientStart,
    headerGradientEnd,
    setHeaderGradientEnd,
    headerGradientDirection,
    setHeaderGradientDirection,
    headerGradient,
    setHeaderGradient,
    borderColor,
    setBorderColor,
    inputBgColor,
    setInputBgColor,
    sendBtnColor,
    setSendBtnColor,
    widgetHeight,
    setWidgetHeight,
    widgetWidth,
    setWidgetWidth,
    launcherSize,
    setLauncherSize,
    borderRadius,
    setBorderRadius,
    agentName,
    setAgentName,
    agentAvatar,
    setAgentAvatar,
    themeMode,
    setThemeMode,
    headerTitle,
    setHeaderTitle,
    headerSubtitle,
    setHeaderSubtitle,
    showOnlineIndicator,
    setShowOnlineIndicator,
    launcherIcon,
    setLauncherIcon,
    launcherLabel,
    setLauncherLabel,
    placeholderText,
    setPlaceholderText,
    showPoweredBy,
    setShowPoweredBy,
    quickReplies,
    setQuickReplies,
    copied,
    activeTab,
    setActiveTab,
    activeTemplate,
    setActiveTemplate,
    applyTemplate,
    deleteOpen,
    setDeleteOpen,
    isDirty,
    domains,
    save,
    deleteWidget,
    copyEmbed,
    addDomain,
    removeDomain,
  }
}
