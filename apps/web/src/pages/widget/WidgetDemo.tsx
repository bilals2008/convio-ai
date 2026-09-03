import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatWidget, chatWidgetPropsFromConfig } from '@/components/widget'
import { Navigate } from 'react-router-dom'
import { publicApi } from '@/lib/api'

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = 'html, body, #root { background: transparent !important; background-color: transparent !important; }'
  document.head.appendChild(style)
}

export function WidgetEmbedPage() {
  const params = new URLSearchParams(window.location.search)
  const widgetKey = params.get('widgetKey')
  const host = params.get('host') || undefined
  const visitorId = params.get('visitorId') || undefined
  const preview = params.get('preview') === 'true'

  const [widgetToken, setWidgetToken] = useState<string | undefined>()
  const [currentPath, setCurrentPath] = useState<string | undefined>(params.get('path') || undefined)

  useEffect(() => {
    if (window.parent === window) return
    // Ask the embedding page for the signed domain token; widget.js fetches it
    // from the API and posts it back.
    window.parent.postMessage({
      type: 'convio-init',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    }, '*')
    const onMessage = (event: MessageEvent) => {
      if (!event.data) return
      // Keep hiddenPages rules in sync with the embedding page's URL.
      if (event.data.type === 'convio-path' && typeof event.data.path === 'string') {
        setCurrentPath(event.data.path)
      }
      if (event.data.type === 'convio-token' && typeof event.data.token === 'string') {
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
    document.documentElement.classList.add('convio-embed')
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    // Embedded widgets must wait for the signed domain token (posted back by
    // widget.js) before fetching config. Without it the request is rejected in
    // production — the iframe's own origin isn't in the widget's allowlist — so
    // firing early just burns a 403 retry and delays first paint.
    enabled: !!widgetKey && (preview || !host || !!widgetToken),
  })

  if (configLoading) {
    // In the embedded frame this renders inside a launcher-sized viewport, so
    // show nothing rather than a floating spinner on a painted canvas.
    if (host) return null
    return <div className="flex h-dvh w-dvw items-center justify-center" style={{ background: 'transparent' }}>
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  }

  if (widgetConfig) {
    return (
      <ChatWidget
        {...chatWidgetPropsFromConfig(widgetConfig, {
          agentId: widgetConfig.agent.id,
          publicKey: widgetKey!,
          host,
          visitorId,
          currentPath,
          widgetToken,
          preview,
        })}
      />
    )
  }

  return null
}

export default function WidgetDemoPage() {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'
  if (!isEmbed) return <Navigate to="/widgets" replace />
  return <WidgetEmbedPage />
}
