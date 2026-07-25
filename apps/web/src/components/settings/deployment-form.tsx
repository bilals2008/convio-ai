import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, ExternalLink, Copy, Check, ArrowUpRight, Settings2, RefreshCw } from 'lucide-react'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Channel = 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

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
  whatsapp: { label: 'WhatsApp', logo: `${CDN}/whatsapp/default.svg` },
  slack: { label: 'Slack', logo: `${CDN}/slack/default.svg`, disabled: true },
  discord: { label: 'Discord', logo: `${CDN}/discord/default.svg` },
  telegram: { label: 'Telegram', logo: `${CDN}/telegram/default.svg` },
  api: { label: 'API', logo: null, disabled: true },
}

const channelFields: Record<Channel, { label: string; key: string; placeholder: string }[]> = {
  whatsapp: [],
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

export function DeploymentForm({ agents, onSave, onCancel }: DeploymentFormProps) {
  const queryClient = useQueryClient()
  const [agentId, setAgentId] = useState('')
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [config, setConfig] = useState<Record<string, string>>({})
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
  const [provider, setProvider] = useState<'kapso' | 'twilio'>('kapso')
  const [twilioShowFields, setTwilioShowFields] = useState(false)
  const [kapsoShowFields, setKapsoShowFields] = useState(false)
  const [connectingNew, setConnectingNew] = useState(false)

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
  const isWhatsApp = channel === 'whatsapp'

  useEffect(() => {
    if (!isWhatsApp || provider !== 'kapso') return
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
  }, [isWhatsApp, provider])

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

  const handleConnectNew = async () => {
    if (!agentId) {
      toast.error('Select an agent first')
      return
    }
    setConnectingNew(true)
    try {
      const result = await onSave({ agentId, channel: 'whatsapp', config: { provider: 'kapso' } })
      if (result?.setupLinkUrl) {
        setSetupLinkUrl(result.setupLinkUrl)
        if (result.deploymentId) setCreatedDeploymentId(result.deploymentId)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect WhatsApp')
    } finally {
      setConnectingNew(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let finalConfig = { ...config }
      if (isWhatsApp) {
        finalConfig.provider = provider
          if (provider === 'kapso') {
            if (kapsoShowFields) {
              finalConfig.kapsoApiKey = config.kapsoApiKey || ''
              finalConfig.phoneNumberId = config.phoneNumberId || ''
              finalConfig.webhookSecret = config.webhookSecret || ''
            } else if (kapsoNumberChoice) {
              finalConfig.phoneNumberId = kapsoNumberChoice
            }
          }
      } else delete finalConfig.provider

      const result = await onSave({ agentId, channel, config: finalConfig })
      if (result && result.setupLinkUrl) {
        setSetupLinkUrl(result.setupLinkUrl)
        if (result.deploymentId) setCreatedDeploymentId(result.deploymentId)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create deployment')
    } finally {
      setSaving(false)
    }
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
                <Select value={channel} onValueChange={(v) => { setChannel(v as Channel); setConfig({}); setProvider('kapso'); setTwilioShowFields(false); setKapsoShowFields(false); setDiscordStep('invite') }}>
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
                              {key === 'api' ? 'A' : 'W'}
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

              {isWhatsApp ? (
                <>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={provider} onValueChange={(v) => { setProvider(v as 'kapso' | 'twilio'); setTwilioShowFields(v === 'twilio'); setKapsoShowFields(false); setConfig({}) }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kapso">Kapso (no credentials needed)</SelectItem>
                        <SelectItem value="twilio">Twilio WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {provider === 'kapso' ? (
                    kapsoShowFields ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="kapso-apiKey">Kapso API Key</Label>
                          <Input id="kapso-apiKey" value={config.kapsoApiKey || ''} onChange={(e) => setConfig({ ...config, kapsoApiKey: e.target.value })} placeholder="ka_..." type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kapso-phoneNumberId">Phone Number ID</Label>
                          <Input id="kapso-phoneNumberId" value={config.phoneNumberId || ''} onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })} placeholder="kapso_phone_..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kapso-webhookSecret">Webhook Secret (optional)</Label>
                          <Input id="kapso-webhookSecret" value={config.webhookSecret || ''} onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })} placeholder="For webhook signature verification" type="password" />
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => { setKapsoShowFields(false); setConfig({}) }}
                        >
                          Close
                        </button>
                      </div>
                    ) : kapsoNumbers.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={`${CDN}/whatsapp/default.svg`} alt="WhatsApp" className="size-4" />
                          <Label className="text-sm font-medium m-0">Connected WhatsApp Numbers</Label>
                        </div>
                        <Select value={kapsoNumberChoice} onValueChange={setKapsoNumberChoice}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a number" />
                          </SelectTrigger>
                          <SelectContent>
                            {kapsoNumbers.map((n) => (
                              <SelectItem key={n.phoneNumberId} value={n.phoneNumberId} disabled={n.inUse}>
                                <span className="flex items-center gap-2">
                                  {n.displayPhone || n.displayName || n.phoneNumberId}
                                  {n.inUse && <Badge variant="destructive" className="text-[9px]">In use</Badge>}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {kapsoNumberChoice && (
                          <p className="text-xs text-muted-foreground">This agent will use the selected number.</p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.preventDefault()
                            handleConnectNew()
                          }}
                          disabled={!agentId || connectingNew}
                        >
                          {connectingNew ? <Loader2 className="size-3.5 animate-spin" /> : <img src={`${CDN}/whatsapp/default.svg`} alt="" className="size-4" />}
                          Connect a different number
                        </Button>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
                          onClick={() => setKapsoShowFields(true)}
                        >
                          <Settings2 className="size-3" />
                          Use your own Kapso credentials
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <img src={`${CDN}/whatsapp/default.svg`} alt="WhatsApp" className="size-5" />
                            <p className="text-sm font-medium">Connect WhatsApp</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            No WhatsApp number connected yet. Click below to connect one via Facebook login.
                          </p>
                          <Button
                            type="button"
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.preventDefault()
                              handleConnectNew()
                            }}
                            disabled={!agentId || connectingNew}
                          >
                            {connectingNew ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <img src={`${CDN}/whatsapp/default.svg`} alt="" className="size-4" />
                            )}
                            {connectingNew ? 'Connecting...' : 'Connect WhatsApp Number'}
                          </Button>
                          {!agentId && (
                            <p className="text-xs text-amber-500 text-center">Select an agent first to continue</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
                          onClick={() => setKapsoShowFields(true)}
                        >
                          <Settings2 className="size-3" />
                          Use your own Kapso credentials
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Enter your Twilio WhatsApp credentials. Each deployment needs its own Twilio number.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="twilio-accountSid">Account SID</Label>
                        <Input id="twilio-accountSid" value={config.accountSid || ''} onChange={(e) => setConfig({ ...config, accountSid: e.target.value })} placeholder="AC..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twilio-authToken">Auth Token</Label>
                        <Input id="twilio-authToken" value={config.authToken || ''} onChange={(e) => setConfig({ ...config, authToken: e.target.value })} placeholder="Auth token" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twilio-phoneNumber">Phone Number</Label>
                        <Input id="twilio-phoneNumber" value={config.phoneNumber || ''} onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })} placeholder="+1234567890" />
                      </div>
                    </div>
                  )}
                </>
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
                            <SelectValue placeholder={guildsLoading ? 'Loading servers...' : 'Select a server'}>
                              {guilds.find((g) => g.id === selectedGuildId)?.name}
                            </SelectValue>
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
              ) : fields.map((field) => (
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
                {!(channel === 'discord' && !discordAdvanced) && !(isWhatsApp && provider === 'kapso' && !kapsoShowFields && kapsoNumbers.length === 0) && (
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


