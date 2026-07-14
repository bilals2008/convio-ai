import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Copy, Check } from 'lucide-react'
import { deployments as deploymentsApi } from '@/lib/api'
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

interface KapsoNumber {
  phoneNumberId: string
  displayName: string | null
  displayPhone: string | null
  kind: string | null
  inUse?: boolean
}

interface DeploymentFormProps {
  agents: { id: string; name: string }[]
  onSave: (data: { agentId: string; channel: Channel; config: Record<string, string> }) => Promise<{ setupLinkUrl?: string } | void>
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

export function DeploymentForm({ agents, onSave, onCancel }: DeploymentFormProps) {
  const [agentId, setAgentId] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const [config, setConfig] = useState<Record<string, string>>({})
  const [whatsappProvider, setWhatsappProvider] = useState('meta')
  const [saving, setSaving] = useState(false)
  const [setupLinkUrl, setSetupLinkUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [kapsoNumbers, setKapsoNumbers] = useState<KapsoNumber[]>([])
  const [kapsoNumbersLoading, setKapsoNumbersLoading] = useState(false)
  // '' = connect a new number (setup link), otherwise an existing phoneNumberId
  const [kapsoNumberChoice, setKapsoNumberChoice] = useState('')

  const fields = channelFields[channel]
  const useTwilio = channel === 'whatsapp' && whatsappProvider === 'twilio'
  const useKapso = channel === 'whatsapp' && whatsappProvider === 'kapso'

  // Load already-connected Kapso numbers so the user can reuse one instead of
  // hitting the free-plan "one number" limit with a second setup link.
  useEffect(() => {
    if (!useKapso) return
    let cancelled = false
    setKapsoNumbersLoading(true)
    deploymentsApi
      .kapsoNumbers()
      .then((res) => {
        if (cancelled) return
        const raw = res.data?.data ?? res.data ?? []
        setKapsoNumbers(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {
        if (!cancelled) setKapsoNumbers([])
      })
      .finally(() => {
        if (!cancelled) setKapsoNumbersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useKapso])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let finalConfig = { ...config }
    if (useTwilio) finalConfig.provider = 'twilio'
    else if (useKapso) {
      finalConfig.provider = 'kapso'
      // Reuse an existing connected number when chosen; otherwise leave
      // phoneNumberId unset so the backend runs the setup-link flow.
      if (kapsoNumberChoice) finalConfig.phoneNumberId = kapsoNumberChoice
      else delete finalConfig.phoneNumberId
    } else delete finalConfig.provider

    const result = await onSave({ agentId, channel, config: finalConfig })
    if (result && result.setupLinkUrl) {
      setSetupLinkUrl(result.setupLinkUrl)
    }
    setSaving(false)
  }

  const handleCopy = () => {
    if (setupLinkUrl) {
      navigator.clipboard.writeText(setupLinkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="sm:max-w-md">
        {setupLinkUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>WhatsApp Setup</DialogTitle>
              <DialogDescription>
                Click the link below to connect your WhatsApp number via Kapso.
                No API keys needed — just login with Facebook.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <p className="text-sm font-medium">Setup Link</p>
                <div className="flex items-center gap-2">
                  <Input value={setupLinkUrl} readOnly className="text-xs" />
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(setupLinkUrl, '_blank')}
                >
                  <ExternalLink className="size-3" />
                  Open Setup Link
                </Button>
                <p className="text-xs text-muted-foreground">
                  After connecting, you'll be redirected back here automatically.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onCancel}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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

              {useKapso ? (
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Select value={kapsoNumberChoice} onValueChange={setKapsoNumberChoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={kapsoNumbersLoading ? 'Loading numbers…' : 'Connect a new number'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Connect a new number</SelectItem>
                      {kapsoNumbers.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Already connected</SelectLabel>
                          {kapsoNumbers.map((n) => (
                            <SelectItem key={n.phoneNumberId} value={n.phoneNumberId}>
                              <span className="flex items-center gap-2">
                                {n.displayPhone || n.displayName || n.phoneNumberId}
                                {n.inUse && (
                                  <Badge variant="destructive" className="text-[9px]">In use</Badge>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const chosen = kapsoNumbers.find((n) => n.phoneNumberId === kapsoNumberChoice)
                      if (chosen?.inUse) {
                        return 'This number is already in use by another deployment — creating will fail.'
                      }
                      return kapsoNumberChoice
                        ? 'This agent will use the selected connected number. No setup link needed.'
                        : "You'll get a setup link to connect a new WhatsApp number via Facebook login."
                    })()}
                  </p>
                </div>
              ) : useTwilio ? twilioFields.map((field) => (
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
                <Button type="submit" disabled={!agentId || saving}>
                  {saving ? <Loader2 className="size-3 animate-spin" /> : null}
                  Create Deployment
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
