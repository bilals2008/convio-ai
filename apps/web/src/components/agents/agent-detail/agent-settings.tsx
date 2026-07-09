import { Globe, Link, Code, MessageCircle } from 'lucide-react'
import { AgentDeployment } from '@/components/agents/agent-deployment'

interface AgentSettingsProps {
  deploymentOptions: Array<{ id: string; enabled: boolean }>
  onDeploymentToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
}

export function AgentSettings({
  deploymentOptions,
  onDeploymentToggle,
  disabled,
}: AgentSettingsProps) {
  const options = [
    {
      id: 'web-chat-widget',
      label: 'Web Chat Widget',
      description: 'Add to your website',
      icon: <Globe className="size-4" />,
      enabled: deploymentOptions.find(o => o.id === 'web-chat-widget')?.enabled ?? true,
    },
    {
      id: 'shareable-link',
      label: 'Shareable Link',
      description: 'Create a public link',
      icon: <Link className="size-4" />,
      enabled: deploymentOptions.find(o => o.id === 'shareable-link')?.enabled ?? false,
    },
    {
      id: 'api-access',
      label: 'API Access',
      description: 'Access via API',
      icon: <Code className="size-4" />,
      enabled: deploymentOptions.find(o => o.id === 'api-access')?.enabled ?? false,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: 'Connect on WhatsApp',
      icon: <MessageCircle className="size-4" />,
      enabled: deploymentOptions.find(o => o.id === 'whatsapp')?.enabled ?? false,
    },
  ]

  return (
    <AgentDeployment
      options={options}
      onToggle={onDeploymentToggle}
      disabled={disabled}
    />
  )
}
