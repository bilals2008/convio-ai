import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Brain, MoreVertical, Thermometer } from 'lucide-react'

const agents = [
  { id: '1', name: 'Support Agent', model: 'GPT-4o', temperature: 0.7, tools: 3 },
  { id: '2', name: 'Sales Agent', model: 'Claude 3.5 Sonnet', temperature: 0.5, tools: 5 },
  { id: '3', name: 'FAQ Agent', model: 'GPT-4o-mini', temperature: 0.3, tools: 2 },
]

export default function Agents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Configure your AI brains</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          New Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>Manage your AI agent configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.model}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Thermometer className="size-4" />
                    {agent.temperature}
                  </div>
                  <Badge variant="secondary">{agent.tools} tools</Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
