import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { KnowledgeCard } from '@/components/knowledge/knowledge-card'
import { KnowledgeDeleteDialog } from '@/components/knowledge/knowledge-delete-dialog'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  organizationId: string
  createdAt: string
  updatedAt: string
}

export default function KnowledgeListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteKb, setDeleteKb] = useState<KnowledgeBase | null>(null)

  const { data: kbData, isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      try {
        const res = await knowledgeApi.list(orgId!)
        return (res.data.data || []) as KnowledgeBase[]
      } catch {
        return [] as KnowledgeBase[]
      }
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
    },
  })

  const kbs = kbData || []

  const filteredKbs = search
    ? kbs.filter(
        (kb) =>
          kb.name.toLowerCase().includes(search.toLowerCase()) ||
          kb.description?.toLowerCase().includes(search.toLowerCase())
      )
    : kbs

  const loadingSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ))

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Base"
        description="Manage documents for RAG-powered responses"
        action={
          <Button onClick={() => navigate('/knowledge/new')}>
            <Plus className="size-4" />
            Create Knowledge Base
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search knowledge bases..."
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loadingSkeletons}</div>
      )}

      {!isLoading && filteredKbs.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases yet"
          description={
            search
              ? 'No knowledge bases match your search.'
              : 'Create a knowledge base to add documents for your agents.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Create Knowledge Base', onClick: () => navigate('/knowledge/new') }
          }
        />
      )}

      {!isLoading && filteredKbs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredKbs.map((kb) => (
            <KnowledgeCard
              key={kb.id}
              kb={kb}
              onDelete={() => setDeleteKb(kb)}
            />
          ))}
        </div>
      )}

      {deleteKb && (
        <KnowledgeDeleteDialog
          open={!!deleteKb}
          onOpenChange={(open) => { if (!open) setDeleteKb(null) }}
          kbName={deleteKb.name}
          documentCount={deleteKb.documentCount}
          onConfirm={() => {
            deleteMutation.mutate(deleteKb.id)
            setDeleteKb(null)
          }}
        />
      )}
    </PageContainer>
  )
}
