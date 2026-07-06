import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'

export default function ConversationDetail() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversation</h1>
        <p className="text-muted-foreground">View and respond to a conversation</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Conversation Detail</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            View full conversation history with message bubbles, tool calls, and reasoning indicators.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
