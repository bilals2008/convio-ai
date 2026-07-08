import { useNavigate } from 'react-router-dom'
import { Bot, Pencil, Trash2, MessageSquare, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type BotStatus = 'draft' | 'active' | 'paused' | 'archived'

interface Chatbot {
  id: string
  name: string
  description?: string
  avatar?: string
  widgetColor: string
  status: BotStatus
  agentId: string
  agentName?: string
  conversations?: number
  updatedAt: string
}

const statusConfig: Record<BotStatus, { label: string; className: string; dot: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', className: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground opacity-60', dot: 'bg-muted-foreground' },
}

interface BotCardProps {
  bot: Chatbot
  onDelete: (id: string) => void
}

export function BotCard({ bot, onDelete }: BotCardProps) {
  const navigate = useNavigate()
  const initial = bot.name.charAt(0).toUpperCase()
  const statusCfg = statusConfig[bot.status] || statusConfig.draft

  return (
    <Card
      className="cursor-pointer transition-all hover:bg-muted/30 hover:shadow-sm group"
      onClick={() => navigate(`/chatbots/${bot.id}/edit`)}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className="flex size-10 items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ backgroundColor: bot.widgetColor }}
              >
                {bot.avatar ? (
                  <img src={bot.avatar} alt={bot.name} className="size-10 rounded-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              {bot.status === 'active' && (
                <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border">
                  <Circle className="size-2 fill-emerald-500 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{bot.name}</h3>
              {bot.description ? (
                <p className="text-sm text-muted-foreground line-clamp-1">{bot.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">No description</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                navigate(`/chatbots/${bot.id}/edit`)
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(bot.id)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={statusCfg.className}>
            <Circle className={`size-1.5 ${statusCfg.dot} mr-1 rounded-full`} />
            {statusCfg.label}
          </Badge>
          {bot.agentName && (
            <Badge variant="secondary" className="text-xs">
              <Bot className="size-3 mr-0.5" />
              {bot.agentName}
            </Badge>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="size-3.5" />
            <span className="font-medium">{bot.conversations || 0}</span>
            <span>chats</span>
          </span>
          <span>{new Date(bot.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
