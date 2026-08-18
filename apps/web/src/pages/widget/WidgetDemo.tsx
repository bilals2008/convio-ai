import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatWidget } from '@/components/widget'
import type { ChatWidgetProps } from '@/components/widget'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, ArrowLeft, Settings2, Code2, Palette, MessageSquare, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { agents as agentsApi, publicApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

type Position = 'bottom-right' | 'bottom-left'

interface DemoConfig {
  agentId: string
  position: Position
  primaryColor: string
  backgroundColor: string
  greeting: string
  agentName: string
  quickReplies: string
  homeMenu: { icon: string; label: string; description: string }[]
}

const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

function getEmbedScript(agentId: string, position: string, primaryColor: string) {
  const params = new URLSearchParams({ embed: 'true', agentId: agentId || 'YOUR_AGENT_ID' })
  if (position) params.set('position', position)
  if (primaryColor) params.set('primaryColor', primaryColor)
  return `<script async>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${appUrl}/widget/demo?${params.toString()}';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:80px;height:80px;border:none;z-index:2147483647;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);border-radius:28px;overflow:hidden;background:transparent;transition:all 0.3s ease;';
    iframe.title = 'Chat Widget';
    document.body.appendChild(iframe);
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'convio-resize') {
        iframe.style.width = e.data.width + 'px';
        iframe.style.height = e.data.height + 'px';
        if (e.data.open) {
          iframe.style.borderRadius = '12px';
          iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.16)';
        } else {
          iframe.style.borderRadius = '28px';
          iframe.style.boxShadow = 'none';
        }
      }
    });
  })();
</script>`
}

function getEmbedIframe(agentId: string, position?: string, primaryColor?: string) {
  const params = new URLSearchParams({ embed: 'true', agentId: agentId || 'YOUR_AGENT_ID' })
  if (position) params.set('position', position)
  if (primaryColor) params.set('primaryColor', primaryColor)
  return `<iframe
  src="${appUrl}/widget/demo?${params.toString()}"
  width="400"
  height="600"
  frameborder="0"
  style="border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);background:transparent;"
></iframe>`
}

const presets: { label: string; color: string }[] = [
  { label: 'Convio', color: '#1cca4a' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Slate', color: '#475569' },
]

const bgPresets: { label: string; color: string }[] = [
  { label: 'Dark', color: '#1c1c1c' },
  { label: 'Charcoal', color: '#2d2d2d' },
  { label: 'White', color: '#ffffff' },
  { label: 'Light Gray', color: '#f5f5f5' },
]

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function WidgetEmbedPage() {
  const params = new URLSearchParams(window.location.search)
  const widgetKey = params.get('widgetKey')
  const agentId = params.get('agentId')
  const host = params.get('host') || undefined

  const preview = params.get('preview') === 'true'

  useEffect(() => {
    const root = document.getElementById('root')
    const targets = [document.documentElement, document.body, root].filter(Boolean) as HTMLElement[]
    for (const el of targets) {
      el.style.setProperty('background', 'transparent', 'important')
      el.style.setProperty('background-color', 'transparent', 'important')
    }
    document.documentElement.style.setProperty('color-scheme', 'normal')
    return () => {
      for (const el of targets) {
        el.style.removeProperty('background')
        el.style.removeProperty('background-color')
      }
      document.documentElement.style.removeProperty('color-scheme')
    }
  }, [])

  const { data: widgetConfig, isLoading: configLoading } = useQuery({
    queryKey: ['widget-config', widgetKey, host],
    queryFn: async () => (
      await publicApi.get(`/public/widgets/${widgetKey}${preview ? '?preview=true' : ''}`, {
        headers: host ? { 'X-Widget-Host': host } : undefined,
      })
    ).data.data,
    enabled: !!widgetKey,
  })

  if (widgetKey && configLoading) {
    return <div className="flex h-dvh w-dvw items-center justify-center bg-background">
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  }

  if (widgetKey && widgetConfig) {
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
      publicKey={widgetKey}
      host={host}
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

  if (agentId) {
    const position = (params.get('position') as Position) || 'bottom-right'
    const primaryColor = params.get('primaryColor') || '#1cca4a'
    const backgroundColor = params.get('backgroundColor') || '#1c1c1c'
    const greeting = params.get('greeting') || "Hi there! I'm an AI assistant. How can I help you today?"
    const agentName = params.get('agentName') || 'Convio Demo'
    const agentAvatar = params.get('agentAvatar') || undefined
    const quickReplies = (params.get('quickReplies') || 'What can you help with?\nHow does pricing work?\nTell me about features\nGet started guide').split('\n').map(s => s.trim()).filter(Boolean)
    return <ChatWidget agentId={agentId} position={position} greeting={greeting} agentName={agentName} agentAvatar={agentAvatar} quickReplies={quickReplies} theme={{ primaryColor, backgroundColor, textColor: config?.textColor || (isLightColor(backgroundColor) ? '#1f2937' : '#f3f4f6') }} />
  }  return null
}

export default function WidgetDemoPage() {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'
  if (isEmbed) return <WidgetEmbedPage />
  return <WidgetDemoEditor />
}

function WidgetDemoEditor() {
  const { orgId } = useOrg()

  const [config, setConfig] = useState<DemoConfig>({
    agentId: '',
    position: 'bottom-right',
    primaryColor: '#1cca4a',
    backgroundColor: '#1c1c1c',
    greeting: "Hi there! I'm a Convio agent. How can I help you today?",
    agentName: 'Convio Demo',
    quickReplies: 'What can you help with?\nHow does pricing work?\nTell me about features\nGet started guide',
    homeMenu: [],
  })
  const [copied, setCopied] = useState(false)
  const [embedTab, setEmbedTab] = useState<'script' | 'iframe'>('iframe')

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      try {
        const res = await agentsApi.list(orgId!)
        return (res.data.data || []) as Array<{ id: string; name: string; status: string; agent?: { model?: string } }>
      } catch {
        return []
      }
    },
    enabled: !!orgId,
  })

  const agents = agentsData || []

  const currentEmbed = embedTab === 'script'
    ? getEmbedScript(config.agentId, config.position, config.primaryColor)
    : getEmbedIframe(config.agentId, config.position, config.primaryColor)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentEmbed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [currentEmbed])

  const HOME_MENU_PRESETS = [
    { icon: 'chat', label: 'Talk to Sales', description: 'Learn about pricing and plans' },
    { icon: 'doc', label: 'Browse Docs', description: 'Read documentation and guides' },
    { icon: 'order', label: 'Check Order', description: 'Track your order status' },
    { icon: 'support', label: 'Get Help', description: 'Troubleshoot issues' },
    { icon: 'star', label: 'Features', description: 'See what Convio can do' },
    { icon: 'email', label: 'Contact Us', description: 'Send us a message' },
  ]

  const toggleHomeMenuItem = useCallback((preset: typeof HOME_MENU_PRESETS[number]) => {
    setConfig((c) => {
      const exists = c.homeMenu.find((m) => m.label === preset.label)
      if (exists) return { ...c, homeMenu: c.homeMenu.filter((m) => m.label !== preset.label) }
      if (c.homeMenu.length >= 6) return c
      return { ...c, homeMenu: [...c.homeMenu, preset] }
    })
  }, [])

  const quickRepliesArray = config.quickReplies
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const widgetProps: ChatWidgetProps = {
    agentId: config.agentId,
    position: config.position,
    greeting: config.greeting,
    agentName: config.agentName,
    quickReplies: quickRepliesArray,
    homeMenu: config.homeMenu.length > 0 ? config.homeMenu : undefined,
    theme: {
      primaryColor: config.primaryColor,
      backgroundColor: config.backgroundColor,
      textColor: isLightColor(config.backgroundColor) ? '#1f2937' : '#f3f4f6',
    },
  }

  const update = (patch: Partial<DemoConfig>) => setConfig((c) => ({ ...c, ...patch }))

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">Widget Builder</h1>
              <Badge variant="secondary" className="text-[10px]">Preview</Badge>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Home Menu
                      <span className="ml-1 font-normal text-muted-foreground">(click to toggle)</span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {HOME_MENU_PRESETS.map((preset) => {
                        const active = config.homeMenu.some((m) => m.label === preset.label)
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => toggleHomeMenuItem(preset)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all',
                              active
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                            )}
                          >
                            {active ? '✓' : ''} {preset.label}
                          </button>
                        )
                      })}
                    </div>
                    {config.homeMenu.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setConfig((c) => ({ ...c, homeMenu: [] }))}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline"
                      >
                        Clear all ({config.homeMenu.length} selected)
                      </button>
                    )}
                  </div>
                </div>
          <Button
            size="default"
            variant={copied ? 'secondary' : 'outline'}
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy Embed Code
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-4 pr-2">
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Settings2 className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">Configuration</h2>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Agent</Label>
                    {agentsLoading ? (
                      <div className="h-9 rounded-md border bg-muted animate-pulse" />
                    ) : agents.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2">
                        No agents found. Create an agent first.
                      </div>
                    ) : (
                      <Select
                        value={config.agentId}
                        onValueChange={(value) => {
                          const agent = agents.find((a) => a.id === value)
                          update({
                            agentId: value,
                            agentName: agent?.name || config.agentName,
                          })
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Choose an agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="size-3.5 text-muted-foreground" />
                                <span>{agent.name}</span>
                                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-[9px] ml-auto">
                                  {agent.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Agent Name</Label>
                    <Input
                      value={config.agentName}
                      onChange={(e) => update({ agentName: e.target.value })}
                      placeholder="My Agent"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Greeting Message</Label>
                    <Textarea
                      value={config.greeting}
                      onChange={(e) => update({ greeting: e.target.value })}
                      rows={3}
                      placeholder="Hi! How can I help you?"
                      className="text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Quick Replies
                      <span className="ml-1 font-normal text-muted-foreground">(one per line)</span>
                    </Label>
                    <Textarea
                      value={config.quickReplies}
                      onChange={(e) => update({ quickReplies: e.target.value })}
                      rows={4}
                      placeholder="Question 1&#10;Question 2"
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Palette className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">Appearance</h2>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((p) => (
                        <Tooltip key={p.color}>
                          <TooltipTrigger
                            type="button"
                            onClick={() => update({ primaryColor: p.color })}
                            className={cn(
                              'size-8 rounded-lg border-2 transition-all hover:scale-110',
                              config.primaryColor === p.color
                                ? 'border-foreground scale-110 shadow-md'
                                : 'border-transparent'
                            )}
                            style={{ backgroundColor: p.color }}
                          />
                          <TooltipContent side="bottom" className="text-xs">
                            {p.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => update({ primaryColor: e.target.value })}
                      className="h-10 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {bgPresets.map((p) => (
                        <Tooltip key={p.color}>
                          <TooltipTrigger
                            type="button"
                            onClick={() => update({ backgroundColor: p.color })}
                            className={cn(
                              'size-8 rounded-lg border-2 transition-all hover:scale-110',
                              config.backgroundColor === p.color
                                ? 'border-foreground scale-110 shadow-md'
                                : 'border-muted'
                            )}
                            style={{ backgroundColor: p.color }}
                          />
                          <TooltipContent side="bottom" className="text-xs">
                            {p.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => update({ backgroundColor: e.target.value })}
                      className="h-10 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Position</Label>
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                      {(['bottom-right', 'bottom-left'] as Position[]).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => update({ position: pos })}
                          className={cn(
                            'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                            config.position === pos
                              ? 'bg-card text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {pos === 'bottom-right' ? 'Right' : 'Left'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Code2 className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">Embed Code</h2>
                </div>
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setEmbedTab('iframe')}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                      embedTab === 'iframe'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Iframe (Local)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedTab('script')}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                      embedTab === 'script'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Script (Production)
                  </button>
                </div>
                <div className="relative group">
                  <pre className="rounded-lg bg-muted p-3 text-[11px] leading-relaxed overflow-x-auto">
                    <code className="text-muted-foreground">{currentEmbed}</code>
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {embedTab === 'iframe'
                    ? 'Paste this in your HTML to embed the widget locally.'
                    : 'Use this after deploying widget.js to your CDN.'}
                </p>
              </Card>
            </div>
          </ScrollArea>

          <Card className="overflow-hidden py-0">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] text-muted-foreground ml-2 font-medium uppercase tracking-wide">
                  Live Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  {config.position === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                </Badge>
              </div>
            </div>
            <div className="relative bg-muted/30 h-[520px] flex items-center justify-center">
              {!config.agentId ? (
                <div className="text-center max-w-[280px] space-y-3">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm border">
                    <MessageSquare className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Select an Agent</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose an agent from the configuration panel to preview the widget.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-[280px] space-y-3">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm border">
                    <MessageSquare className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Widget Active</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click the chat button at the {config.position === 'bottom-right' ? 'bottom-right' : 'bottom-left'} corner to open the widget preview.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <Rocket className="size-3" />
                    <span>Powered by Convio</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {config.agentId && (
        <ChatWidget key={`${config.agentId}-${config.position}-${config.primaryColor}`} {...widgetProps} />
      )}
    </div>
  )
}
