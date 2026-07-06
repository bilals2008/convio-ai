import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Bot, MoreVertical } from 'lucide-react'

const bots = [
  { id: '1', name: 'Support Bot', status: 'active', agent: 'GPT-4o', conversations: 234 },
  { id: '2', name: 'Sales Bot', status: 'active', agent: 'Claude 3.5', conversations: 156 },
  { id: '3', name: 'FAQ Bot', status: 'draft', agent: 'GPT-4o-mini', conversations: 0 },
]

export default function Bots() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bots</h1>
          <p className="text-muted-foreground">Manage your chatbots</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          New Bot
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <Card key={bot.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{bot.name}</CardTitle>
                  <CardDescription>{bot.agent}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                  {bot.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {bot.conversations} conversations
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
