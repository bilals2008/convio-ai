import { MessageSquare, Bot, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BotWidgetPreviewProps {
  name: string
  welcomeMessage: string
  widgetColor: string
  avatar: string
}

export function BotWidgetPreview({ name, welcomeMessage, widgetColor, avatar }: BotWidgetPreviewProps) {
  const initial = name ? name.charAt(0).toUpperCase() : 'B'
  const previewWelcome = welcomeMessage || `Hi! I'm ${name || 'your bot'}. How can I help?`

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-2 rounded-full bg-emerald-500" />
        Live Preview
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: widgetColor }}>
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
            {avatar ? (
              <img src={avatar} alt={name} className="size-8 rounded-full object-cover" />
            ) : (
              <Bot className="size-4 text-white" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{name || 'Bot Name'}</h4>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>

        <div className="space-y-3 p-4 min-h-[180px] bg-muted/30">
          <div className="flex items-start gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: widgetColor }}
            >
              <Bot className="size-3 text-white" />
            </div>
            <div className="rounded-lg bg-card px-3 py-2 text-sm shadow-sm max-w-[200px]">
              {previewWelcome}
            </div>
          </div>

          <div className="flex items-end gap-2 justify-end">
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-foreground max-w-[150px]">
              Hello! I need help.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t p-3">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            disabled
          />
          <Button size="icon" style={{ backgroundColor: widgetColor }} disabled>
            <Send className="size-4 text-white" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex size-14 items-center justify-center rounded-full shadow-lg cursor-default',
        )}
        style={{ backgroundColor: widgetColor }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="size-14 rounded-full object-cover" />
        ) : (
          <MessageSquare className="size-6 text-white" />
        )}
      </div>
    </div>
  )
}
