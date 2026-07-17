import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { deployments as deploymentsApi } from '@/lib/api'
import { Copy, Check, Trash2, Loader2, Globe, Play } from 'lucide-react'
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

interface DeploymentDetailProps {
  deploymentId: string | null
  agentName: string
  onClose: () => void
  onDelete: (id: string) => void
}

export function DeploymentDetail({ deploymentId, agentName, onClose, onDelete }: DeploymentDetailProps) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: async () => {
      if (!deploymentId) return null
      const res = await deploymentsApi.get(deploymentId)
      return res.data.data
    },
    enabled: !!deploymentId,
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

  if (!deploymentId) return null

  const ch = channelLogos[data?.channel] || channelLogos.web
  const config = (data?.config || {}) as Record<string, unknown>
  const configKeys = Object.keys(config).filter((k) => !k.startsWith('kapso'))

  return (
    <Dialog open={!!deploymentId} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[500px]">
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

            <div className="space-y-4">
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

              {/* Info */}
              <div className="space-y-2">
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
              </div>

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

              {/* Test & Delete */}
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
                  onClick={() => { onDelete(data.id); onClose() }}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>

              {/* Test Result */}
              {testMutation.data && (
                <div className={cn(
                  'rounded-lg p-3 text-xs',
                  testMutation.data.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}>
                  {testMutation.data.message}
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
