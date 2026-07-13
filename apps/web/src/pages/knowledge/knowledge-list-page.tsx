import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Upload,
  Type,
  HelpCircle,
  Loader2,
  Table2,
  FileJson,
  FileCode,
  Zap,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { KnowledgeCard } from '@/components/knowledge/knowledge-card'
import { NoKnowledgeBases } from '@/components/knowledge/kb-empty-states'
import { SourcePickerModal, type SourceType } from '@/components/knowledge/source-picker-modal'
import { toast } from 'sonner'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
  createdAt: string
  updatedAt: string
}

const quickSources = [
  { id: 'file-upload' as SourceType, label: 'File', icon: Upload, color: 'bg-primary/10 text-primary' },
  { id: 'website' as SourceType, label: 'Website', icon: null, color: 'bg-blue-500/10 text-blue-500', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google-chrome/default.svg' },
  { id: 'custom-text' as SourceType, label: 'Text', icon: Type, color: 'bg-teal-500/10 text-teal-500' },
  { id: 'faq' as SourceType, label: 'FAQ', icon: HelpCircle, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'csv' as SourceType, label: 'CSV', icon: Table2, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'json' as SourceType, label: 'JSON', icon: FileJson, color: 'bg-amber-500/10 text-amber-500' },
  { id: 'markdown' as SourceType, label: 'Markdown', icon: FileCode, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'api' as SourceType, label: 'API', icon: Zap, color: 'bg-purple-500/10 text-purple-500' },
  { id: 'sitemap' as SourceType, label: 'Sitemap', icon: Link2, color: 'bg-cyan-500/10 text-cyan-500' },
]

export default function KnowledgeListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sourceModalOpen, setSourceModalOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')

  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as KnowledgeBase[]
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      setDeleteId(null)
      toast.success('Knowledge base deleted')
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      knowledgeApi.create({ name: createName.trim() || 'Untitled', description: createDesc.trim(), organizationId: orgId! }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      const createdId = res.data?.data?.id as string | undefined
      setCreateOpen(false)
      setCreateName('')
      setCreateDesc('')
      toast.success('Knowledge base created')
      if (createdId) navigate(`/knowledge/${createdId}`)
    },
    onError: (err: unknown) => toast.error(`Failed to create: ${err instanceof Error ? err.message : String(err)}`),
  })

  const filtered = useMemo(() =>
    knowledgeBases.filter((kb) =>
      !search || kb.name.toLowerCase().includes(search.toLowerCase()) || kb.description?.toLowerCase().includes(search.toLowerCase())
    ), [knowledgeBases, search]
  )

  const loading = orgLoading || isLoading

  const handleSourceSelect = (sourceId: SourceType) => {
    setCreateOpen(true)
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage context for your AI agents
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" />
          Create Knowledge Base
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search knowledge bases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 bg-muted/30 border-border/60"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {quickSources.map((source) => (
          <button
            key={source.id}
            onClick={() => handleSourceSelect(source.id)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            {source.logo ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-background border border-border/40">
                <img src={source.logo} alt="" className="size-3" loading="lazy" />
              </div>
            ) : source.icon ? (
              <div className={cn('flex size-5 shrink-0 items-center justify-center rounded', source.color)}>
                <source.icon className="size-3" />
              </div>
            ) : null}
            {source.label}
          </button>
        ))}
        <button
          onClick={() => setSourceModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-3.5" />
          More
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 && !search ? (
        <NoKnowledgeBases />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No knowledge bases match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((kb) => (
            <KnowledgeCard key={kb.id} kb={kb} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Base</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge base and all its documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SourcePickerModal
        open={sourceModalOpen}
        onOpenChange={setSourceModalOpen}
        onSelect={handleSourceSelect}
      />

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open)
        if (!open) { setCreateName(''); setCreateDesc('') }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>Add a name and optional description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Product Docs"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="What is this knowledge base for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); setCreateName(''); setCreateDesc('') }}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!createName.trim() || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
