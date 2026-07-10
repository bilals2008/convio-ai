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
import { apiKeys as apiKeysClient } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsedAt?: string
}

interface CreatedKey {
  name: string
  key: string
}

export default function ApiKeysPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys', orgId],
    queryFn: async () => {
      const res = await apiKeysClient.list(orgId!)
      return (res.data.data || []) as ApiKey[]
    },
    enabled: !!orgId,
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiKeysClient.create(orgId!, name)
      return res.data.data as CreatedKey
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] })
      setCreatedKey(data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeysClient.delete(orgId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] })
      setDeleteKeyId(null)
    },
  })

  const deleteKeyName = apiKeys?.find((k) => k.id === deleteKeyId)?.name || ''

  if (orgLoading || isLoading) {
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
