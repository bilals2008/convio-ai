import { useNavigate } from 'react-router-dom'
import { Brain, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const MODEL_BADGE_CLASSES: Record<string, string> = {
  'auto/': 'bg-purple-500/10 text-purple-600',
  'aug/': 'bg-blue-500/10 text-blue-600',
  'gpt-': 'bg-emerald-500/10 text-emerald-600',
  'claude-': 'bg-amber-500/10 text-amber-600',
  'gemini-': 'bg-sky-500/10 text-sky-600',
  'llama-': 'bg-emerald-500/10 text-emerald-600',
  'ddgw/': 'bg-rose-500/10 text-rose-600',
  'oc/': 'bg-teal-500/10 text-teal-600',
  'tllm/': 'bg-indigo-500/10 text-indigo-600',
}

function getModelBadgeClass(model: string): string {
  for (const [prefix, cls] of Object.entries(MODEL_BADGE_CLASSES)) {
    if (model.startsWith(prefix)) return cls
  }
  return 'bg-muted text-muted-foreground'
}

interface Agent {
  id: string
  name: string
  description?: string
  model: string
  systemPrompt: string
  temperature: number
  createdAt: string
}

interface AgentCardProps {
  agent: Agent
  onDelete: (id: string) => void
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-all hover:bg-muted/30 hover:shadow-sm group"
      onClick={() => navigate(`/agents/${agent.id}/edit`)}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Brain className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{agent.name}</h3>
              {agent.description ? (
                <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
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
                navigate(`/agents/${agent.id}/edit`)
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(agent.id)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`text-xs ${getModelBadgeClass(agent.model)}`}>
            {agent.model.length > 25 ? agent.model.slice(0, 22) + '...' : agent.model}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Temp {agent.temperature}
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[60%]">
            {agent.systemPrompt.slice(0, 50)}{agent.systemPrompt.length > 50 ? '...' : ''}
          </p>
          <span className="text-xs text-muted-foreground">
            {new Date(agent.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
