import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatWidget } from '@/components/widget'
import { Navigate } from 'react-router-dom'
import { publicApi } from '@/lib/api'

type Position = 'bottom-right' | 'bottom-left'

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = 'html, body, #root { background: transparent !important; }'
  document.head.appendChild(style)
}

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

export function WidgetEmbedPage() {
  const params = new URLSearchParams(window.location.search)
  const widgetKey = params.get('widgetKey')
  const host = params.get('host') || undefined
  const visitorId = params.get('visitorId') || undefined
  const preview = params.get('preview') === 'true'

  const [widgetToken, setWidgetToken] = useState<string | undefined>()

  useEffect(() => {
    if (window.parent === window) return
    // Ask the embedding page for the signed domain token; widget.js fetches it
    // from the API and posts it back.
    window.parent.postMessage({
      type: 'convio-init',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    }, '*')
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'convio-token' && typeof event.data.token === 'string') {
        setWidgetToken(event.data.token)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const root = document.getElementById('root')
    const targets = [document.documentElement, document.body, root].filter(Boolean) as HTMLElement[]
    for (const el of targets) {
      el.style.setProperty('background', 'transparent', 'important')
      el.style.setProperty('background-color', 'transparent', 'important')
      el.style.setProperty('margin', '0', 'important')
      el.style.setProperty('padding', '0', 'important')
      el.style.setProperty('min-height', '0', 'important')
      el.style.setProperty('height', 'auto', 'important')
      el.style.setProperty('width', 'auto', 'important')
    }
    document.documentElement.style.setProperty('color-scheme', 'normal')
    return () => {
      for (const el of targets) {
        el.style.removeProperty('background')
        el.style.removeProperty('background-color')
        el.style.removeProperty('margin')
        el.style.removeProperty('padding')
        el.style.removeProperty('min-height')
        el.style.removeProperty('height')
        el.style.removeProperty('width')
      }
      document.documentElement.style.removeProperty('color-scheme')
    }
  }, [])

  const { data: widgetConfig, isLoading: configLoading } = useQuery({
    queryKey: ['widget-config', widgetKey, host, widgetToken],
    queryFn: async () => {
      const headers: Record<string, string> = {}
      if (host) headers['X-Widget-Host'] = host
      if (widgetToken) headers['X-Widget-Token'] = widgetToken
      if (preview) {
        const { supabase } = await import('@/lib/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
      }
      return (await publicApi.get(`/public/widgets/${widgetKey}${preview ? '?preview=true' : ''}`, { headers })).data.data
    },
    enabled: !!widgetKey,
  })

  if (configLoading) {
    return <div className="flex h-dvh w-dvw items-center justify-center" style={{ background: 'transparent' }}>
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  }

  if (widgetConfig) {
    const config = widgetConfig.config || {}
    const position = (config.position as Position) || 'bottom-right'
    const primaryColor = config.primaryColor || '#1cca4a'
    const backgroundColor = config.backgroundColor || '#1c1c1c'
    const greeting = config.greeting || "Hi there! How can I help you today?"
    const agentName = config.agentName || widgetConfig.agent?.name || 'Assistant'
    const agentAvatar = config.agentAvatar || widgetConfig.agent?.avatar
    const quickReplies = (config.quickReplies || []).map((s: string) => s.trim()).filter(Boolean)

    return <ChatWidget
      agentId={widgetConfig.agent.id}
      publicKey={widgetKey!}
      host={host}
      visitorId={visitorId}
      widgetToken={widgetToken}
      preview={preview}
      position={position}
      greeting={greeting}
      agentName={agentName}
      agentAvatar={agentAvatar}
      quickReplies={quickReplies}
      themeMode={config.themeMode || 'auto'}
      widgetWidth={config.widgetWidth || 'default'}
      launcherSize={config.launcherSize || 'default'}
      borderRadius={config.borderRadius || 'default'}
      headerGradient={config.headerGradient !== false}
      headerTitle={config.headerTitle || undefined}
      headerSubtitle={config.headerSubtitle || undefined}
      showOnlineIndicator={config.showOnlineIndicator}
      launcherLabel={config.launcherLabel || undefined}
      placeholderText={config.placeholderText || undefined}
      showPoweredBy={config.showPoweredBy}
      widgetHeight={config.widgetHeight}
      theme={{
        primaryColor,
        backgroundColor,
        textColor: config.textColor || (isLightColor(backgroundColor) ? '#1f2937' : '#f3f4f6'),
        promptBgColor: config.promptBgColor || '#2a2a2a',
        headerGradientStart: config.headerGradientStart || '#1cca4a',
        headerGradientEnd: config.headerGradientEnd || '#0d7a34',
        headerGradientDirection: `${config.headerGradientDirection ?? 135}deg`,
        borderColor: config.borderColor || '',
        inputBgColor: config.inputBgColor || '',
        sendBtnColor: config.sendBtnColor || '',
        footerBgColor: config.footerBgColor || '',
      }}
    />
  }

  return null
}

export default function WidgetDemoPage() {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'
  if (!isEmbed) return <Navigate to="/widgets" replace />
  return <WidgetEmbedPage />
}
