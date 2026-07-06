import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
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
} from '@/components/ui/select'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const channelSchema = z.enum(['web', 'whatsapp', 'slack', 'discord', 'telegram', 'api'])

interface IntegrationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { channel: Channel; config: Record<string, string> }) => void
  loading?: boolean
  initialChannel?: Channel
  initialConfig?: Record<string, string>
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

export function IntegrationForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  initialChannel = 'web',
  initialConfig = {},
}: IntegrationFormProps) {
  const [channel, setChannel] = useState<Channel>(initialChannel)
  const [config, setConfig] = useState<Record<string, string>>(initialConfig)

  const fields = channelFields[channel]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ channel, config })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Integration</DialogTitle>
          <DialogDescription>Set up your channel integration</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => { setChannel(v as Channel); setConfig({}) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Widget</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={config[field.key] || ''}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                disabled={loading}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Save Integration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
