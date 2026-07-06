import { useNavigate } from 'react-router-dom'
import { Brain, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => navigate(`/agents/${agent.id}/edit`)}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              {agent.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {agent.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
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

        <Badge variant="secondary" className="w-fit text-xs">
          {agent.model}
        </Badge>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Temperature: {agent.temperature}</span>
          <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
