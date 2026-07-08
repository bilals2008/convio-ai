import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Link } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { IntegrationCard } from '@/components/settings/integration-card'
import { IntegrationForm } from '@/components/settings/integration-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { bots as botsApi, integrations as integrationsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'
type IntegrationStatus = 'active' | 'inactive' | 'pending' | 'error'

interface IntegrationItem {
  id: string
  channel: Channel
  botName: string
  botId: string
  status: IntegrationStatus
  config: Record<string, string>
  updatedAt: string
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: botsList } = useQuery({
    queryKey: ['bots-for-integrations', orgId],
    queryFn: async () => {
      const res = await botsApi.list(orgId!)
      return (res.data.data || []) as { id: string; name: string }[]
    },
    enabled: !!orgId,
  })

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', orgId],
    queryFn: async () => {
      if (!botsList || botsList.length === 0) return []
      const results = await Promise.allSettled(
        botsList.map((bot) => integrationsApi.list(bot.id))
      )
      return results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r, i) => {
          const items = (r.value.data.data || []) as IntegrationItem[]
          return items.map((item) => ({ ...item, botName: item.botName || botsList[i].name }))
        })
    },
    enabled: !!orgId && !!botsList,
  })

  const createMutation = useMutation({
    mutationFn: (data: { channel: Channel; config: Record<string, string> }) => {
      const botId = botsList?.[0]?.id
      if (!botId) throw new Error('No bot available')
      return integrationsApi.create(botId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setFormOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setDeleteId(null)
    },
  })

  const handleTest = async (id: string) => {
    await integrationsApi.test(id)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect your bots to different channels"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add Integration
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && (!integrations || integrations.length === 0) ? (
        <EmptyState
          icon={Link}
          title="No integrations yet"
          description="Add your first integration to deploy a bot to a channel."
          action={{ label: 'Add Integration', onClick: () => setFormOpen(true) }}
        />
      ) : (
        !isLoading && (
          <div className="space-y-3">
            {integrations?.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onEdit={(id) => { setEditId(id); setFormOpen(true) }}
                onDelete={(id) => setDeleteId(id)}
                onTest={handleTest}
              />
            ))}
          </div>
        )
      )}

      <IntegrationForm
        open={formOpen}
        onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditId(null) } }}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
        initialChannel={editId ? integrations?.find((i) => i.id === editId)?.channel : undefined}
        initialConfig={editId ? integrations?.find((i) => i.id === editId)?.config : undefined}
      />

      {deleteId && (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => { if (!open) setDeleteId(null) }}
          title="Delete Integration"
          description="This will disconnect this channel. Any active conversations on this channel will be closed."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => deleteMutation.mutate(deleteId)}
        />
      )}
    </div>
  )
}
