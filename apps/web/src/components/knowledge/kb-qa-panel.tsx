import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Pencil, Trash2, GripVertical, X, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { knowledge as knowledgeApi } from '@/lib/api'
import { toast } from 'sonner'

export function KbQaPanel({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ question: '', answer: '' })
  const [addOpen, setAddOpen] = useState(false)
  const [addValues, setAddValues] = useState({ question: '', answer: '' })

  const { data: pairs = [], isLoading } = useQuery({
    queryKey: ['knowledge-base-qa', knowledgeBaseId],
    queryFn: async () => {
      const res = await knowledgeApi.getQa(knowledgeBaseId)
      return res.data.data as QaPair[]
    },
    enabled: !!knowledgeBaseId,
  })

  const addMutation = useMutation({
    mutationFn: () => knowledgeApi.addQa(knowledgeBaseId, addValues),
    onSuccess: () => {
      setAddOpen(false)
      setAddValues({ question: '', answer: '' })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-qa', knowledgeBaseId] })
      toast.success('Q&A pair added')
    },
    onError: () => toast.error('Failed to add pair'),
  })

  const updateMutation = useMutation({
    mutationFn: (qa: QaPair) => knowledgeApi.updateQa(knowledgeBaseId, qa.id, qa),
    onSuccess: () => {
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-qa', knowledgeBaseId] })
      toast.success('Saved')
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (qaId: string) => knowledgeApi.deleteQa(knowledgeBaseId, qaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-qa', knowledgeBaseId] })
      toast.success('Deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addValues.question.trim() || !addValues.answer.trim()) return
    addMutation.mutate()
  }

  const handleEditSubmit = (e: React.FormEvent, qa: QaPair) => {
    e.preventDefault()
    if (!editValues.question.trim() || !editValues.answer.trim()) return
    updateMutation.mutate({ ...qa, question: editValues.question, answer: editValues.answer })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="size-5 text-primary" />
          Q&A Pairs
          {pairs.length > 0 && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs tabular-nums">{pairs.length}</span>
          )}
        </h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-3.5 mr-1.5" />
          Add pair
        </Button>
      </div>

      {pairs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-12 text-center">
          <BookOpen className="size-12 mx-auto text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No Q&A pairs yet. Add your first one.</p>
          <Button size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5 mr-1.5" />
            Add pair
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40">
          {pairs.map((qa) => (
            <div key={qa.id} className="p-4 hover:bg-muted/30 transition-colors">
              {editingId === qa.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, qa)} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Question</label>
                    <Input
                      value={editValues.question}
                      onChange={(e) => setEditValues({ ...editValues, question: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Answer</label>
                    <Textarea
                      value={editValues.answer}
                      onChange={(e) => setEditValues({ ...editValues, answer: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="size-3.5 mr-1.5" />
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                  <GripVertical className="size-5 text-muted-foreground/50 self-center select-none" />
                  <div className="space-y-1">
                    <p className="font-medium">{qa.question}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{qa.answer}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditValues({ question: qa.question, answer: qa.answer }); setEditingId(qa.id) }} aria-label="Edit">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(qa.id)} disabled={deleteMutation.isPending} aria-label="Delete">
                      {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Q&A pair</DialogTitle>
            <DialogDescription>This pair will be searchable by your agents immediately after indexing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Question <span className="text-destructive">*</span></label>
              <Input
                value={addValues.question}
                onChange={(e) => setAddValues({ ...addValues, question: e.target.value })}
                placeholder="e.g. What are your opening hours?"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Answer <span className="text-destructive">*</span></label>
              <Textarea
                value={addValues.answer}
                onChange={(e) => setAddValues({ ...addValues, answer: e.target.value })}
                placeholder="e.g. We're open Mon–Fri 9am–6pm, Sat 10am–2pm."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setAddOpen(false); setAddValues({ question: '', answer: '' }) }}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={!addValues.question.trim() || !addValues.answer.trim() || addMutation.isPending}>
                {addMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Add pair
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface QaPair {
  id: string
  question: string
  answer: string
  position: number
  createdAt: string
  updatedAt: string
}