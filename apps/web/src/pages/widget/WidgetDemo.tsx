import { useState, useCallback } from 'react'
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
import { Copy, Check, ArrowLeft, Settings2, Code2, Palette, MessageSquare, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Position = 'bottom-right' | 'bottom-left'

interface DemoConfig {
  botId: string
  position: Position
  primaryColor: string
  greeting: string
  botName: string
  quickReplies: string
}

const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.convio.com/widget.js';
    script.dataset.botId = 'YOUR_BOT_ID';
    script.dataset.position = 'bottom-right';
    script.dataset.primary = '#fb923c';
    document.body.appendChild(script);
  })();
</script>`

const presets: { label: string; color: string }[] = [
  { label: 'Orange', color: '#fb923c' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Slate', color: '#475569' },
]

export default function WidgetDemoPage() {
  const [config, setConfig] = useState<DemoConfig>({
    botId: 'demo-bot',
    position: 'bottom-right',
    primaryColor: '#fb923c',
    greeting: "Hi there! I'm a Convio chatbot. How can I help you today?",
    botName: 'Convio Demo',
    quickReplies: 'What can you help with?\nHow does pricing work?\nTell me about features\nGet started guide',
  })
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const quickRepliesArray = config.quickReplies
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const widgetProps: ChatWidgetProps = {
    botId: config.botId,
    position: config.position,
    greeting: config.greeting,
    botName: config.botName,
    quickReplies: quickRepliesArray,
    theme: {
      primaryColor: config.primaryColor,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
  }

  const update = (patch: Partial<DemoConfig>) => setConfig((c) => ({ ...c, ...patch }))

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">Widget Builder</h1>
              <Badge variant="secondary" className="text-[10px]">Preview</Badge>
            </div>
          </div>
          <Button
            size="sm"
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
                    <Label className="text-xs">Bot ID</Label>
                    <Input
                      value={config.botId}
                      onChange={(e) => update({ botId: e.target.value })}
                      placeholder="demo-bot"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Bot Name</Label>
                    <Input
                      value={config.botName}
                      onChange={(e) => update({ botName: e.target.value })}
                      placeholder="My Chatbot"
                      className="h-9 text-sm"
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
                          <TooltipTrigger asChild>
                            <button
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
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {p.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => update({ primaryColor: e.target.value })}
                      className="h-8 text-xs font-mono"
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
                <div className="relative group">
                  <pre className="rounded-lg bg-muted p-3 text-[11px] leading-relaxed overflow-x-auto">
                    <code className="text-muted-foreground">{embedCode}</code>
                  </pre>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
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
            </div>
          </Card>
        </div>
      </div>

      <ChatWidget key={`${config.position}-${config.primaryColor}`} {...widgetProps} />
    </div>
  )
}
