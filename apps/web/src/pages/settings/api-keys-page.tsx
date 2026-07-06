import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Key } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiKeyTable } from '@/components/settings/api-key-table'
import { ApiKeyCreateDialog } from '@/components/settings/api-key-create-dialog'
import { ApiKeyDeleteDialog } from '@/components/settings/api-key-delete-dialog'
import api from '@/lib/api'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsedAt?: string
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<{ name: string; key: string } | null>(null)

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      try {
        const res = await api.get('/api-keys')
        return (res.data.data || []) as ApiKey[]
      } catch {
        return [] as ApiKey[]
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/api-keys', { name })
      return res.data.data as { name: string; key: string }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setCreatedKey(data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setDeleteKeyId(null)
    },
  })

  const deleteKeyName = apiKeys?.find((k) => k.id === deleteKeyId)?.name || ''

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="API Keys" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access to Convio"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Generate Key
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate with the Convio API. Keep them secure and never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API keys"
              description="Generate an API key to start using the Convio API."
              action={{ label: 'Generate Key', onClick: () => setCreateOpen(true) }}
            />
          ) : (
            <ApiKeyTable
              keys={apiKeys}
              onDelete={(id) => setDeleteKeyId(id)}
              loading={deleteMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      <ApiKeyCreateDialog
        open={createOpen}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); setCreatedKey(null) } }}
        onSubmit={(name) => createMutation.mutate(name)}
        loading={createMutation.isPending}
        createdKey={createdKey}
      />

      {deleteKeyId && (
        <ApiKeyDeleteDialog
          open={!!deleteKeyId}
          onOpenChange={(open) => { if (!open) setDeleteKeyId(null) }}
          keyName={deleteKeyName}
          onConfirm={() => deleteMutation.mutate(deleteKeyId)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
