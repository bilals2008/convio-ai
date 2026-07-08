import { useState } from 'react'
import { Bot, Search, Loader2, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface BotOption {
  id: string
  name: string
  status: string
  agentName?: string
  agentModel?: string
  conversations?: number
}

interface BotSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bots: BotOption[]
  loading: boolean
  onSelect: (botId: string) => void
}

export function BotSelectorDialog({
  open,
  onOpenChange,
  bots,
  loading,
  onSelect,
}: BotSelectorDialogProps) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? bots.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.agentName?.toLowerCase().includes(search.toLowerCase())
      )
    : bots

  const activeBots = filtered.filter((b) => b.status === 'active')
  const otherBots = filtered.filter((b) => b.status !== 'active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Bot</DialogTitle>
          <DialogDescription>
            Choose which chatbot to start a conversation with
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search bots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {search ? 'No bots match your search' : 'No bots available'}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {activeBots.map((bot) => (
              <button
                key={bot.id}
                type="button"
                onClick={() => onSelect(bot.id)}
                className="w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 shrink-0">
                  <Bot className="size-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{bot.name}</span>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 shrink-0">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {bot.agentName && <span>{bot.agentName}</span>}
                    {bot.agentModel && (
                      <Badge variant="outline" className="text-[9px] font-normal py-0 h-4">
                        {bot.agentModel}
                      </Badge>
                    )}
                  </div>
                </div>
                {bot.conversations != null && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                    <MessageSquare className="size-3" />
                    {bot.conversations}
                  </div>
                )}
              </button>
            ))}

            {otherBots.length > 0 && activeBots.length > 0 && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase text-muted-foreground/60">
                Other
              </div>
            )}

            {otherBots.map((bot) => (
              <button
                key={bot.id}
                type="button"
                onClick={() => onSelect(bot.id)}
                className="w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-muted shrink-0">
                  <Bot className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{bot.name}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">
                      {bot.status}
                    </Badge>
                  </div>
                  {bot.agentName && (
                    <span className="text-[11px] text-muted-foreground">{bot.agentName}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
