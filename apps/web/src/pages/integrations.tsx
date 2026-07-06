import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Globe, MessageCircle, Send } from 'lucide-react'

const integrations = [
  { id: '1', name: 'Web Widget', icon: Globe, status: 'active', description: 'Embed on your website' },
  { id: '2', name: 'WhatsApp', icon: MessageCircle, status: 'active', description: 'WhatsApp Business API' },
  { id: '3', name: 'Telegram', icon: Send, status: 'active', description: 'Telegram Bot API' },
  { id: '4', name: 'Discord', icon: Globe, status: 'inactive', description: 'Discord Bot' },
  { id: '5', name: 'Slack', icon: Globe, status: 'inactive', description: 'Slack App' },
]

export default function Integrations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect your bots to different channels</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          New Integration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <integration.icon className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                {integration.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {integration.status === 'active' ? 'Configure' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
