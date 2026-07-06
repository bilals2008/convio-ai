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
import { integrations as integrationsApi } from '@/lib/api'

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

const MOCK_ORG_ID = 'mock-org-id'

export default function IntegrationsPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', MOCK_ORG_ID],
    queryFn: async () => {
      try {
        const res = await integrationsApi.list(MOCK_ORG_ID)
        return (res.data.data || []) as IntegrationItem[]
      } catch {
        return [] as IntegrationItem[]
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: { channel: Channel; config: Record<string, string> }) =>
      integrationsApi.create({ ...data, organizationId: MOCK_ORG_ID }),
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Integrations" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
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

      {!integrations || integrations.length === 0 ? (
        <EmptyState
          icon={Link}
          title="No integrations yet"
          description="Add your first integration to deploy a bot to a channel."
          action={{ label: 'Add Integration', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onEdit={(id) => { setEditId(id); setFormOpen(true) }}
              onDelete={(id) => setDeleteId(id)}
              onTest={handleTest}
            />
          ))}
        </div>
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
