import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AgentChatPanel } from '@/components/agents/agent-chat-panel'

interface AgentTestChatProps {
  agentConfig: {
    name: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    providerKeyId?: string
  }
}

const mockConversations = [
  {
    id: '1',
    title: 'Pricing Plans',
    preview: 'Tell me about your pricing...',
    timestamp: '2 min ago',
    active: true,
  },
  {
    id: '2',
    title: 'Integrations',
    preview: 'What platforms do you support?',
    timestamp: '1 hour ago',
    active: false,
  },
  {
    id: '3',
    title: 'Refund Policy',
    preview: 'How does the refund process work?',
    timestamp: '3 hours ago',
    active: false,
  },
]

export function AgentTestChat({ agentConfig }: AgentTestChatProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <AgentChatPanel
              agentConfig={agentConfig}
              className="min-h-[600px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Conversations</h3>
            <Button variant="outline" size="sm" className="w-full mb-3">
              + New
            </Button>
            <div className="space-y-2">
              {mockConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    conv.active
                      ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium text-sm">{conv.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{conv.preview}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{conv.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full text-destructive hover:text-destructive">
          <Trash2 className="size-4 mr-2" />
          Clear Conversations
        </Button>
      </div>
    </div>
  )
}
