import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, ExternalLink, Copy, Check, ArrowUpRight, Settings2, RefreshCw, Monitor } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

interface KapsoNumber {
  phoneNumberId: string
  displayName: string | null
  displayPhone: string | null
  kind: string | null
  inUse?: boolean
}

interface Guild {
  id: string
  name: string
  icon: string | null
  deployed: boolean
}

interface DeploymentFormProps {
  agents: { id: string; name: string }[]
  onSave: (data: { agentId: string; channel: Channel; config: Record<string, unknown> }) => Promise<{ setupLinkUrl?: string; deploymentId?: string } | void>
  onCancel: () => void
}

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const channelMeta: Record<Channel, { label: string; logo: string | null; disabled?: boolean }> = {
  web: { label: 'Web Widget', logo: null },
  whatsapp: { label: 'WhatsApp', logo: `${CDN}/whatsapp/default.svg` },
  slack: { label: 'Slack', logo: `${CDN}/slack/default.svg`, disabled: true },
  discord: { label: 'Discord', logo: `${CDN}/discord/default.svg` },
  telegram: { label: 'Telegram', logo: `${CDN}/telegram/default.svg` },
  api: { label: 'API', logo: null, disabled: true },
}

const channelFields: Record<Channel, { label: string; key: string; placeholder: string }[]> = {
  web: [
    { label: 'Allowed Origins', key: 'allowedOrigins', placeholder: 'https://example.com, https://app.example.com' },
    { label: 'Trigger Delay (ms)', key: 'triggerDelay', placeholder: '0' },
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
    { label: 'Public Key', key: 'publicKey', placeholder: 'Public key from Discord Developer Portal' },
    { label: 'Guild ID (optional)', key: 'guildId', placeholder: 'Guild ID' },
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
  const queryClient = useQueryClient()
  const [agentId, setAgentId] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const [config, setConfig] = useState<Record<string, string>>({})
  const [whatsappProvider, setWhatsappProvider] = useState('meta')
  const [discordAdvanced, setDiscordAdvanced] = useState(false)
  const [discordInviteLoading, setDiscordInviteLoading] = useState(false)
  const [discordStep, setDiscordStep] = useState<'invite' | 'guilds'>('invite')
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [guildsLoading, setGuildsLoading] = useState(false)
  const [selectedGuildId, setSelectedGuildId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [setupLinkUrl, setSetupLinkUrl] = useState('')
  const [createdDeploymentId, setCreatedDeploymentId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selectedAgentName = agents.find((a) => a.id === agentId)?.name

  const handleClose = () => {
    if (createdDeploymentId) {
      deploymentsApi.delete(createdDeploymentId).catch(() => {})
    }
    setCreatedDeploymentId(null)
    setDiscordStep('invite')
    onCancel()
  }
  const [kapsoNumbers, setKapsoNumbers] = useState<KapsoNumber[]>([])
  const [kapsoNumbersLoading, setKapsoNumbersLoading] = useState(false)
  const [kapsoNumberChoice, setKapsoNumberChoice] = useState('')

  const fields = channelFields[channel]
  const useTwilio = channel === 'whatsapp' && whatsappProvider === 'twilio'
  const useKapso = channel === 'whatsapp' && whatsappProvider === 'kapso'

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

  const handleDiscordOneClick = async () => {
    if (!agentId) return
    setDiscordInviteLoading(true)
    try {
      const res = await deploymentsApi.discordInviteUrl(agentId)
      const inviteUrl = res.data?.data?.inviteUrl
      if (inviteUrl) {
        window.open(inviteUrl, '_blank', 'width=500,height=700')
        setDiscordStep('guilds')
        loadGuilds()
      }
    } catch {
      setDiscordAdvanced(true)
    } finally {
      setDiscordInviteLoading(false)
    }
  }

  const loadGuilds = async () => {
    setGuildsLoading(true)
    try {
      const res = await deploymentsApi.discordGuilds()
      const raw = res.data?.data ?? res.data ?? []
      setGuilds(Array.isArray(raw) ? raw : [])
    } catch {
      setGuilds([])
    } finally {
      setGuildsLoading(false)
    }
  }

  const handleDiscordConnect = async () => {
    if (!agentId || !selectedGuildId) return
    setConnecting(true)
    try {
      const guild = guilds.find((g) => g.id === selectedGuildId)
      await deploymentsApi.discordConnect(agentId, selectedGuildId, guild?.name)
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      onCancel()
    } catch {
      // stay open on error
    } finally {
      setConnecting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let finalConfig = { ...config }
    if (channel === 'web') {
      if (finalConfig.allowedOrigins) {
        finalConfig.allowedOrigins = finalConfig.allowedOrigins.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
      if (finalConfig.triggerDelay) {
        finalConfig.triggerDelay = parseInt(finalConfig.triggerDelay as string, 10)
      }
      finalConfig.showBranding = finalConfig.showBranding === 'true'
    }
    if (useTwilio) finalConfig.provider = 'twilio'
    else if (useKapso) {
      finalConfig.provider = 'kapso'
      if (kapsoNumberChoice) finalConfig.phoneNumberId = kapsoNumberChoice
      else delete finalConfig.phoneNumberId
    } else delete finalConfig.provider

    const result = await onSave({ agentId, channel, config: finalConfig })
    if (result && result.setupLinkUrl) {
      setSetupLinkUrl(result.setupLinkUrl)
      if (result.deploymentId) setCreatedDeploymentId(result.deploymentId)
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
    <Dialog open onOpenChange={(open) => { if (!open) handleClose() }}>
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
              <Button type="button" variant="ghost" onClick={(e) => { e.preventDefault(); handleClose() }}>
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
                    <SelectValue placeholder="Select an agent">{selectedAgentName}</SelectValue>
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
                <Select value={channel} onValueChange={(v) => { setChannel(v as Channel); setConfig({}); setWhatsappProvider('meta'); setDiscordStep('invite') }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(channelMeta) as [Channel, { label: string; logo: string | null; disabled?: boolean }][]).map(([key, { label, logo, disabled }]) => (
                      <SelectItem key={key} value={key} disabled={disabled}>
                        <div className="flex items-center gap-2.5">
                          {logo ? (
                            <img src={logo} alt={label} className="size-4 shrink-0" />
                          ) : (
                            <div className="size-4 shrink-0 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {key === 'web' ? 'W' : 'A'}
                            </div>
                          )}
                          {label}
                          {disabled && (
                            <Badge variant="secondary" className="text-[9px]">Coming soon</Badge>
                          )}
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
                            <SelectItem key={n.phoneNumberId} value={n.phoneNumberId} disabled={n.inUse}>
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
              ) : channel === 'web' ? (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-md bg-muted flex items-center justify-center">
                        <Monitor className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Web Widget Settings</p>
                        <p className="text-xs text-muted-foreground">Configure how the widget appears on your site</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={config.position || 'bottom-right'} onValueChange={(v) => setConfig({ ...config, position: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Trigger</Label>
                      <Select value={config.trigger || 'auto'} onValueChange={(v) => setConfig({ ...config, trigger: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="on-scroll">On Scroll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showBranding">Show Branding</Label>
                        <p className="text-xs text-muted-foreground">Display Convio branding on the widget</p>
                      </div>
                      <Switch
                        id="showBranding"
                        checked={config.showBranding === 'true'}
                        onCheckedChange={(checked) => setConfig({ ...config, showBranding: checked ? 'true' : 'false' })}
                      />
                    </div>
                  </div>

                  {channelFields.web.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.key === 'triggerDelay' ? 'number' : 'text'}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              ) : channel === 'discord' && !discordAdvanced ? (
                <div className="space-y-3">
                  {discordStep === 'invite' ? (
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-md bg-[#5865F2]/10 flex items-center justify-center">
                          <img src={channelMeta.discord.logo!} alt="Discord" className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">One-click setup</p>
                          <p className="text-xs text-muted-foreground">No credentials needed</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click below to add our bot to your Discord server. Then select the server from the list.
                      </p>
                      <Button
                        type="button"
                        className="w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                        disabled={!agentId || discordInviteLoading}
                        onClick={handleDiscordOneClick}
                      >
                        {discordInviteLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ArrowUpRight className="size-3.5" />
                        )}
                        Add to Discord
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-md bg-[#5865F2]/10 flex items-center justify-center">
                            <img src={channelMeta.discord.logo!} alt="Discord" className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Select a server</p>
                            <p className="text-xs text-muted-foreground">Choose where to install the bot</p>
                          </div>
                        </div>
                        <Select value={selectedGuildId} onValueChange={setSelectedGuildId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={guildsLoading ? 'Loading servers...' : 'Select a server'} />
                          </SelectTrigger>
                          <SelectContent>
                            {guildsLoading ? (
                              <SelectItem value="" disabled>Loading...</SelectItem>
                            ) : guilds.length === 0 ? (
                              <SelectItem value="" disabled>No servers found. Add the bot to a server first.</SelectItem>
                            ) : (
                              guilds.map((g) => (
                                <SelectItem key={g.id} value={g.id} disabled={g.deployed}>
                                  <div className="flex items-center gap-2">
                                    {g.icon && <img src={g.icon} alt="" className="size-4 rounded-full" />}
                                    <span>{g.name}</span>
                                    {g.deployed && <Badge variant="secondary" className="text-[9px]">Deployed</Badge>}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={loadGuilds}
                            disabled={guildsLoading}
                          >
                            <RefreshCw className={cn('size-3', guildsLoading && 'animate-spin')} />
                            Refresh
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 gap-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                            disabled={!selectedGuildId || connecting}
                            onClick={handleDiscordConnect}
                          >
                            {connecting ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                            Connect to Server
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setDiscordAdvanced(true)}
                  >
                    <Settings2 className="size-3" />
                    Use your own Discord app
                  </button>
                </div>
              ) : channel === 'discord' && discordAdvanced ? (
                <div className="space-y-3">
                  {channelFields.discord.map((field) => (
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
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => { setDiscordAdvanced(false); setDiscordStep('invite') }}
                  >
                    <ArrowUpRight className="size-3" />
                    Use one-click setup instead
                  </button>
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
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                {!(channel === 'discord' && !discordAdvanced) && (
                  <Button type="submit" disabled={!agentId || saving}>
                    {saving ? <Loader2 className="size-3 animate-spin" /> : null}
                    Create Deployment
                  </Button>
                )}
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


