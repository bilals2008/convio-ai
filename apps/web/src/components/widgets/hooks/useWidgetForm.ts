import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import type { WidgetDetail, ApiError } from '../types'
import { type ThemeMode } from '../constants'
import type { WidgetDraft as WidgetAiDraft } from '../components/DesignAiTab'
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

  const { data: embedSnippet } = useQuery({
    queryKey: ['widget-embed', widgetId],
    queryFn: async () => (await widgetsApi.getEmbed(widgetId)).data.data.snippet as string,
    enabled: Boolean(widgetId),
  })

  const [name, setName] = useState('')
  const [domains, setDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState('')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#1cca4a')
  const [backgroundColor, setBackgroundColor] = useState('#1c1c1c')
  const [textColor, setTextColor] = useState('#f3f4f6')
  const [promptBgColor, setPromptBgColor] = useState('#2a2a2a')
const [headerGradientStart, setHeaderGradientStart] = useState('#1cca4a')
const [headerGradientEnd, setHeaderGradientEnd] = useState('#0d7a34')
  const [headerGradientDirection, setHeaderGradientDirection] = useState(135)
  const [headerGradient, setHeaderGradient] = useState(true)
  const [borderColor, setBorderColor] = useState('')
  const [inputBgColor, setInputBgColor] = useState('')
  const [sendBtnColor, setSendBtnColor] = useState('')
  const [footerBgColor, setFooterBgColor] = useState('')
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
  const [launcherLabel, setLauncherLabel] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [showPoweredBy, setShowPoweredBy] = useState(true)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('appearance')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const initializedWidgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!widget) return
    if (initializedWidgetId.current === widget.id) return
    initializedWidgetId.current = widget.id
    setName(widget.name)
    setDomains(widget.allowedDomains ?? [])
    setPosition(widget.config.position ?? 'bottom-right')
    setPrimaryColor(widget.config.primaryColor ?? '#1cca4a')
    setBackgroundColor(widget.config.backgroundColor ?? '#1c1c1c')
    setTextColor(widget.config.textColor ?? '#f3f4f6')
    setPromptBgColor(widget.config.promptBgColor ?? '#2a2a2a')
    setHeaderGradientStart(widget.config.headerGradientStart ?? '#1cca4a')
    setHeaderGradientEnd(widget.config.headerGradientEnd ?? '#0d7a34')
    setHeaderGradientDirection(widget.config.headerGradientDirection ?? 135)
    setHeaderGradient(widget.config.headerGradient ?? true)
    setBorderColor(widget.config.borderColor ?? '')
    setInputBgColor(widget.config.inputBgColor ?? '')
    setSendBtnColor(widget.config.sendBtnColor ?? '')
    setFooterBgColor(widget.config.footerBgColor ?? '')
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
        primaryColor: widget.config.primaryColor ?? '#1cca4a',
        backgroundColor: widget.config.backgroundColor ?? '#1c1c1c',
        textColor: widget.config.textColor ?? '#f3f4f6',
        promptBgColor: widget.config.promptBgColor ?? '#2a2a2a',
        headerGradientStart: widget.config.headerGradientStart ?? '#1cca4a',
        headerGradientEnd: widget.config.headerGradientEnd ?? '#0d7a34',
        headerGradientDirection: widget.config.headerGradientDirection ?? 135,
        headerGradient: widget.config.headerGradient ?? true,
        borderColor: widget.config.borderColor ?? '',
        inputBgColor: widget.config.inputBgColor ?? '',
        sendBtnColor: widget.config.sendBtnColor ?? '',
        footerBgColor: widget.config.footerBgColor ?? '',
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
        footerBgColor,
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
        launcherLabel,
        placeholderText,
        showPoweredBy,
        quickReplies: quickReplies.join(','),
      }
      return JSON.stringify(current) !== JSON.stringify(saved)
    }, [widget, name, domains, position, primaryColor, backgroundColor, textColor, promptBgColor, headerGradientStart, headerGradientEnd, headerGradientDirection, headerGradient, borderColor, inputBgColor, sendBtnColor, footerBgColor, widgetHeight, widgetWidth, launcherSize, borderRadius, agentName, agentAvatar, themeMode, headerTitle, headerSubtitle, showOnlineIndicator, launcherLabel, placeholderText, showPoweredBy, quickReplies])

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
          footerBgColor,
          widgetHeight,
          widgetWidth,
          launcherSize,
          borderRadius,
          agentName,
          themeMode,
          headerTitle,
          headerSubtitle,
          showOnlineIndicator,
          launcherLabel,
          placeholderText,
          showPoweredBy,
          quickReplies,
          greeting: widget?.config?.greeting || 'Hi there!',
          agentAvatar,
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
      if (draft.name) setName(draft.name)
      if (draft.primaryColor) setPrimaryColor(draft.primaryColor)
      if (draft.backgroundColor) setBackgroundColor(draft.backgroundColor)
      if (draft.textColor) setTextColor(draft.textColor)
      if (draft.promptBgColor) setPromptBgColor(draft.promptBgColor)
      if (draft.headerGradientStart) setHeaderGradientStart(draft.headerGradientStart)
      if (draft.headerGradientEnd) setHeaderGradientEnd(draft.headerGradientEnd)
      if (draft.headerGradientDirection !== undefined) setHeaderGradientDirection(draft.headerGradientDirection)
      if (draft.borderColor) setBorderColor(draft.borderColor)
      if (draft.inputBgColor) setInputBgColor(draft.inputBgColor)
      if (draft.sendBtnColor) setSendBtnColor(draft.sendBtnColor)
      if (draft.footerBgColor) setFooterBgColor(draft.footerBgColor)
      if (draft.agentName) setAgentName(draft.agentName)
      if (draft.headerTitle) setHeaderTitle(draft.headerTitle)
      if (draft.headerSubtitle) setHeaderSubtitle(draft.headerSubtitle)
      if (draft.placeholderText) setPlaceholderText(draft.placeholderText)
      if (draft.quickReplies) setQuickReplies(draft.quickReplies.slice(0, 4))
      if (draft.themeMode) setThemeMode(draft.themeMode)
      if (draft.position) setPosition(draft.position)
      if (draft.widgetWidth) setWidgetWidth(draft.widgetWidth)
      if (draft.launcherSize) setLauncherSize(draft.launcherSize)
      if (draft.borderRadius) setBorderRadius(draft.borderRadius)
      setActiveTab('appearance')
      toast.success('AI design applied — review and save')
    },
    [],
  )

  return {
    widget,
    isLoading,
    embedSnippet,
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
    footerBgColor,
    setFooterBgColor,
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
    applyAiDraft,
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
