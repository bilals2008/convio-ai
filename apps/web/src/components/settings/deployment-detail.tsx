import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deployments as deploymentsApi, conversations as conversationsApi } from '@/lib/api'
import { Copy, Check, Trash2, Loader2, Globe, Play, MessageSquare, Users, Hash, Bot, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const channelLogos: Record<string, { logo: string | null; fallback: string }> = {
  web: { logo: null, fallback: 'W' },
  whatsapp: { logo: `${CDN}/whatsapp/default.svg`, fallback: 'WA' },
  slack: { logo: `${CDN}/slack/default.svg`, fallback: 'S' },
  discord: { logo: `${CDN}/discord/default.svg`, fallback: 'D' },
  telegram: { logo: `${CDN}/telegram/default.svg`, fallback: 'T' },
  api: { logo: null, fallback: 'A' },
}

interface ConversationSummary {
  id: string
  status: string
  channel: string
  contactName?: string
  userName?: string
  createdAt: string
  messages: { id: string; role: string; content: string; createdAt: string }[]
}

interface DeploymentDetailProps {
  deploymentId: string | null
  agentName: string
  onClose: () => void
  onDelete: (id: string) => void
}

const statusBadgeStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:hover:bg-emerald-400/20',
  waiting: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20',
  resolved: 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20',
  closed: 'bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:hover:bg-zinc-400/20',
  archived: 'bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:hover:bg-zinc-400/20',
}

export function DeploymentDetail({ deploymentId, agentName, onClose, onDelete }: DeploymentDetailProps) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [nickname, setNickname] = useState('')
  const [convFilter, setConvFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: async () => {
      if (!deploymentId) return null
      const res = await deploymentsApi.get(deploymentId)
      return res.data.data
    },
    enabled: !!deploymentId,
  })

  const agentId = data?.agentId as string | undefined
  const config = (data?.config || {}) as Record<string, unknown>
  const isDiscord = data?.channel === 'discord'

  const conversationsQuery = useQuery({
    queryKey: ['deployment-conversations', agentId],
    queryFn: async () => {
      if (!agentId) return []
      const res = await conversationsApi.listByAgent(agentId, { limit: 100 })
      const raw = res.data?.data || res.data || []
      return Array.isArray(raw) ? raw : []
    },
    enabled: !!agentId,
  })

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await deploymentsApi.test(deploymentId!)
      return res.data.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await deploymentsApi.update(deploymentId!, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment', deploymentId] })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    },
  })

  const nicknameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      const res = await deploymentsApi.updateNickname(deploymentId!, newNickname)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment', deploymentId] })
    },
  })

  if (!deploymentId) return null

  const ch = channelLogos[data?.channel] || channelLogos.web
  const configKeys = Object.keys(config).filter(
    (k) => !k.startsWith('kapso') && !['botToken', 'accessToken', 'appToken', 'signingSecret', 'apiKey', 'publicKey'].includes(k)
  )

  // Filter conversations to only show this deployment's channel
  const channelConversations = (conversationsQuery.data || []).filter(
    (c: ConversationSummary) => c.channel === data?.channel
  )

  const filteredConvs = convFilter === 'all'
    ? channelConversations
    : channelConversations.filter((c: ConversationSummary) => c.status === convFilter)

  const totalMessages = channelConversations.reduce((sum: number, c: ConversationSummary) => sum + (c.messages?.length || 0), 0)
  const activeConvs = channelConversations.filter((c: ConversationSummary) => c.status === 'active').length
  const closedConvs = channelConversations.filter((c: ConversationSummary) => c.status === 'closed').length
  const uniqueUsers = new Set(channelConversations.map((c: ConversationSummary) => c.contactName || c.userName || c.id)).size

  return (
    <Dialog open={!!deploymentId} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted shrink-0">
                  {ch.logo ? (
                    <img src={ch.logo} alt={data.channel} className="size-5" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{ch.fallback}</span>
                  )}
                </div>
                <div>
                  <DialogTitle className="capitalize">{data.channel} Deployment</DialogTitle>
                  <p className="text-sm text-muted-foreground">{agentName}</p>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="conversations">Conversations</TabsTrigger>
              </TabsList>

              <ScrollArea className="max-h-[55vh] pr-2 mt-4">
                <TabsContent value="info" className="space-y-4 mt-0">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      {['active', 'inactive', 'pending', 'error'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatusMutation.mutate(s)}
                          disabled={updateStatusMutation.isPending || data.status === s}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            data.status === s
                              ? s === 'active' ? 'bg-success/10 text-success'
                                : s === 'error' ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Details */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Details</span>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deployment ID</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs">{data.id.slice(0, 8)}...</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(data.id)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 1500)
                          }}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Agent</span>
                      <span>{agentName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Channel</span>
                      <span className="capitalize">{data.channel}</span>
                    </div>
                  </div>

                  {/* Discord Nickname */}
                  {isDiscord && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Bot Nickname</span>
                        <p className="text-xs text-muted-foreground">
                          Set a custom name for the bot in your Discord server
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Enter nickname..."
                            defaultValue={(config.botNickname as string) || ''}
                            onChange={(e) => setNickname(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (nickname) nicknameMutation.mutate(nickname)
                            }}
                            disabled={nicknameMutation.isPending || !nickname}
                          >
                            {nicknameMutation.isPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="size-3.5" />
                            )}
                            Update
                          </Button>
                        </div>
                        {nicknameMutation.isSuccess && (
                          <p className="text-xs text-success">Nickname updated!</p>
                        )}
                        {nicknameMutation.isError && (
                          <p className="text-xs text-destructive">Failed to update nickname</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Config */}
                  {configKeys.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Configuration</p>
                        <div className="space-y-1.5 bg-muted/30 rounded-lg p-3">
                          {configKeys.map((key) => {
                            const val = config[key]
                            const displayVal = typeof val === 'string' && val.length > 20
                              ? val.slice(0, 20) + '...'
                              : String(val ?? '—')
                            return (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{key}</span>
                                <code className="text-foreground max-w-[200px] truncate">{displayVal}</code>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testMutation.mutate()}
                      disabled={testMutation.isPending}
                    >
                      {testMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Play className="size-3.5" />
                      )}
                      Test Connection
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { const id = data.id; onClose(); onDelete(id) }}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>

                  {testMutation.data && (
                    <div className={cn(
                      'rounded-lg p-3 text-xs',
                      testMutation.data.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}>
                      {testMutation.data.message}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 mt-0">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MessageSquare className="size-4" />
                        <span className="text-xs font-medium">Total Conversations</span>
                      </div>
                      <p className="text-2xl font-bold">{channelConversations.length}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Hash className="size-4" />
                        <span className="text-xs font-medium">Total Messages</span>
                      </div>
                      <p className="text-2xl font-bold">{totalMessages}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="size-4" />
                        <span className="text-xs font-medium">Unique Users</span>
                      </div>
                      <p className="text-2xl font-bold">{uniqueUsers}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Bot className="size-4" />
                        <span className="text-xs font-medium">Active / Closed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{activeConvs}</p>
                        <span className="text-muted-foreground">/</span>
                        <p className="text-2xl font-bold text-muted-foreground">{closedConvs}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Status Chart */}
                  {channelConversations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium mb-3 block">Status Distribution</span>
                        <div className="space-y-2">
                          {['active', 'waiting', 'resolved', 'closed', 'archived'].map((status) => {
                            const count = channelConversations.filter(
                              (c: ConversationSummary) => c.status === status
                            ).length
                            if (count === 0) return null
                            const pct = (count / channelConversations.length) * 100
                            return (
                              <div key={status} className="flex items-center gap-3">
                                <Badge className={cn('text-[10px] capitalize', statusBadgeStyles[status])} variant="outline">
                                  {status}
                                </Badge>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all',
                                      status === 'active' ? 'bg-emerald-500' :
                                      status === 'waiting' ? 'bg-amber-500' :
                                      status === 'resolved' ? 'bg-sky-500' :
                                      'bg-zinc-400'
                                    )}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {channelConversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Conversations will appear here once users interact with this deployment
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="conversations" className="space-y-4 mt-0">
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2">
                    {[
                      { value: 'all', label: `All (${channelConversations.length})` },
                      { value: 'active', label: `Active (${activeConvs})` },
                      { value: 'closed', label: `Closed (${closedConvs})` },
                    ].map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setConvFilter(f.value)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          convFilter === f.value
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Conversations List */}
                  {filteredConvs.length > 0 ? (
                    <div className="space-y-1">
                      {filteredConvs.map((conv: ConversationSummary) => {
                        const lastMsg = conv.messages?.[0]
                        return (
                          <div key={conv.id}>
                            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5 text-xs">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="font-medium shrink-0">
                                  {conv.contactName || conv.userName || 'Anonymous'}
                                </span>
                                <span className="text-muted-foreground/50">·</span>
                                <span className="truncate text-muted-foreground">
                                  {lastMsg ? lastMsg.content.slice(0, 50) : 'No messages'}
                                </span>
                              </div>
                              <Badge className={cn('text-[10px] ml-2 shrink-0 capitalize', statusBadgeStyles[conv.status])} variant="outline">
                                {conv.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No conversations</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {convFilter === 'active' ? 'No active conversations' : 'No closed conversations'}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
