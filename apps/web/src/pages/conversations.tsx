import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'

const conversations = [
  { id: '1', user: 'User A', bot: 'Support Bot', channel: 'web', lastMessage: 'Thanks for the help!', time: '2m ago', status: 'active' },
  { id: '2', user: 'User B', bot: 'Sales Bot', channel: 'whatsapp', lastMessage: 'What are your pricing plans?', time: '5m ago', status: 'active' },
  { id: '3', user: 'User C', bot: 'FAQ Bot', channel: 'telegram', lastMessage: 'How do I reset my password?', time: '1h ago', status: 'closed' },
]

export default function Conversations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">View and manage chat conversations</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Conversations</CardTitle>
              <CardDescription>Browse through chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="size-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{conv.user}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {conv.lastMessage}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{conv.channel}</Badge>
                      <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                        {conv.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-3" />
                        {conv.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat Preview</CardTitle>
            <CardDescription>Select a conversation to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
