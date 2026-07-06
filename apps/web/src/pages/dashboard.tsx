import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Bot, 
  Brain, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { title: 'Total Conversations', value: '1,234', change: '+12%', icon: MessageSquare, color: 'text-info', bg: 'bg-info/10' },
  { title: 'Active Bots', value: '5', change: '+1', icon: Bot, color: 'text-success', bg: 'bg-success/10' },
  { title: 'AI Agents', value: '3', change: '+1', icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Messages Today', value: '3,891', change: '+15%', icon: BarChart3, color: 'text-warning', bg: 'bg-warning/10' },
]

const features = [
  {
    icon: Brain,
    title: 'AI Agents',
    description: 'Configure AI brains with custom prompts, models, and tools',
    href: '/agents',
    color: 'text-primary',
  },
  {
    icon: Bot,
    title: 'Chatbots',
    description: 'Create and deploy chatbots to multiple channels',
    href: '/bots',
    color: 'text-success',
  },
  {
    icon: Globe,
    title: 'Multi-channel',
    description: 'Deploy to Web, WhatsApp, Telegram, Discord, Slack',
    href: '/integrations',
    color: 'text-info',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track conversations, messages, and performance',
    href: '/analytics',
    color: 'text-warning',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute -right-20 -top-20 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 size-40 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              <Sparkles className="mr-1 size-3" />
              AI-Powered
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to <span className="text-primary">Convio</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">
            Build, deploy, and manage AI chatbots across multiple channels. 
            Create intelligent agents with custom prompts, tools, and knowledge bases.
          </p>
          
          <div className="flex items-center gap-4">
            <Link to="/agents">
              <Button size="lg" className="gap-2">
                <Plus className="size-4" />
                Create Agent
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/bots">
              <Button size="lg" variant="outline" className="gap-2">
                <Bot className="size-4" />
                View Bots
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted mb-4 group-hover:bg-primary/10 transition-colors">
                    <feature.icon className={`size-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Zap className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Get Started in Minutes</h3>
              <p className="text-sm text-muted-foreground">
                Create your first AI agent, configure a chatbot, and deploy to your website.
              </p>
            </div>
            <Link to="/agents">
              <Button>
                Start Building
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
