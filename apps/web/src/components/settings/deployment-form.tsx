import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

interface DeploymentFormProps {
  agents: { id: string; name: string }[]
  onSave: (data: { agentId: string; channel: Channel; config: Record<string, string> }) => void
  onCancel: () => void
}

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const channelMeta: Record<Channel, { label: string; logo: string | null }> = {
  web: { label: 'Web Widget', logo: null },
  whatsapp: { label: 'WhatsApp', logo: `${CDN}/whatsapp/default.svg` },
  slack: { label: 'Slack', logo: `${CDN}/slack/default.svg` },
  discord: { label: 'Discord', logo: `${CDN}/discord/default.svg` },
  telegram: { label: 'Telegram', logo: `${CDN}/telegram/default.svg` },
  api: { label: 'API', logo: null },
}

const channelFields: Record<Channel, { label: string; key: string; placeholder: string }[]> = {
  web: [
    { label: 'Allowed Origins', key: 'allowedOrigins', placeholder: 'https://example.com' },
    { label: 'Position', key: 'position', placeholder: 'bottom-right' },
  ],
  whatsapp: [
    { label: 'Phone Number ID', key: 'phoneNumberId', placeholder: 'Phone number ID' },
    { label: 'Access Token', key: 'accessToken', placeholder: 'Access token' },
    { label: 'Verify Token', key: 'verifyToken', placeholder: 'Verify token' },
  ],
  slack: [
    { label: 'Bot Token', key: 'botToken', placeholder: 'xoxb-...' },
    { label: 'App Token', key: 'appToken', placeholder: 'xapp-...' },
    { label: 'Signing Secret', key: 'signingSecret', placeholder: 'Signing secret' },
  ],
  discord: [
    { label: 'Bot Token', key: 'botToken', placeholder: 'Bot token' },
    { label: 'Application ID', key: 'applicationId', placeholder: 'Application ID' },
    { label: 'Guild ID', key: 'guildId', placeholder: 'Guild ID (optional)' },
  ],
  telegram: [
    { label: 'Bot Token', key: 'botToken', placeholder: 'Bot token from BotFather' },
    { label: 'Webhook URL', key: 'webhookUrl', placeholder: 'https://...' },
  ],
  api: [
    { label: 'Webhook URL', key: 'webhookUrl', placeholder: 'https://...' },
    { label: 'Allowed IP Ranges', key: 'allowedIpRanges', placeholder: '0.0.0.0/0' },
  ],
}

const twilioFields = [
  { label: 'Account SID', key: 'twilioAccountSid', placeholder: 'AC...' },
  { label: 'Auth Token', key: 'twilioAuthToken', placeholder: 'Auth token' },
  { label: 'Twilio Number', key: 'twilioNumber', placeholder: '+14155238886' },
]

const kapsoFields = [
  { label: 'API Key', key: 'kapsoApiKey', placeholder: 'Kapso API key' },
  { label: 'Phone Number ID', key: 'phoneNumberId', placeholder: 'Phone number ID from Kapso' },
]

export function DeploymentForm({ agents, onSave, onCancel }: DeploymentFormProps) {
  const [agentId, setAgentId] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const [config, setConfig] = useState<Record<string, string>>({})
  const [whatsappProvider, setWhatsappProvider] = useState('meta')

  const fields = channelFields[channel]
  const useTwilio = channel === 'whatsapp' && whatsappProvider === 'twilio'
  const useKapso = channel === 'whatsapp' && whatsappProvider === 'kapso'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let finalConfig = { ...config }
    if (useTwilio) finalConfig.provider = 'twilio'
    else if (useKapso) finalConfig.provider = 'kapso'
    else delete finalConfig.provider
    onSave({ agentId, channel, config: finalConfig })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Deployment</DialogTitle>
          <DialogDescription>Set up your channel deployment</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Agents</SelectLabel>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => { setChannel(v as Channel); setConfig({}); setWhatsappProvider('meta') }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(channelMeta) as [Channel, { label: string; logo: string | null }][]).map(([key, { label, logo }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2.5">
                      {logo ? (
                        <img src={logo} alt={label} className="size-4 shrink-0" />
                      ) : (
                        <div className="size-4 shrink-0 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {key === 'web' ? 'W' : 'A'}
                        </div>
                      )}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {channel === 'whatsapp' && (
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={whatsappProvider} onValueChange={(v) => { setWhatsappProvider(v); setConfig({}) }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meta">
                    <div className="flex items-center gap-2.5">
                      <img src={`${CDN}/meta/default.svg`} alt="Meta" className="size-4 shrink-0" />
                      Meta / WhatsApp Business
                      <Badge variant="secondary" className="text-[9px]">Production</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="twilio">
                    <div className="flex items-center gap-2.5">
                      <img src={`${CDN}/twilio/default.svg`} alt="Twilio" className="size-4 shrink-0" />
                      Twilio Sandbox
                      <Badge variant="secondary" className="text-[9px]">Demo</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="kapso">
                    <div className="flex items-center gap-2.5">
                      <div className="size-4 shrink-0 rounded bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">K</div>
                      Kapso
                      <Badge variant="secondary" className="text-[9px]">Free</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {useKapso ? kapsoFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={config[field.key] || ''}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          )) : useTwilio ? twilioFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={config[field.key] || ''}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          )) : fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={config[field.key] || ''}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!agentId}>
              Create Deployment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
