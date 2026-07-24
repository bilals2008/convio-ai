import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Check, BookOpen, HelpCircle, Building2, Headphones, Search, FileText, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

export interface KbTemplate {
  id: string
  name: string
  description: string
  documents: Array<{ name: string; type: string; content: string }>
}

interface KnowledgeTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTemplateId?: string | null
  onSelect: (template: KbTemplate) => void
  disabled?: boolean
}

const templateMeta: Record<string, { icon: typeof BookOpen; color: string; bgColor: string; chips: string[] }> = {
  'product-docs': { icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10', chips: ['API Docs', 'Guides', 'Tutorials'] },
  'faq-base': { icon: HelpCircle, color: 'text-pink-500', bgColor: 'bg-pink-500/10', chips: ['Questions', 'Categories', 'Answers'] },
  'company-wiki': { icon: Building2, color: 'text-amber-500', bgColor: 'bg-amber-500/10', chips: ['Policies', 'Teams', 'Processes'] },
  'support-articles': { icon: Headphones, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', chips: ['Guides', 'Troubleshooting', 'How-to'] },
}

export function KnowledgeTemplateModal({ open, onOpenChange, activeTemplateId, onSelect, disabled }: KnowledgeTemplateModalProps) {
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['knowledge-templates', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.templates(orgId!)
      return (res.data.data || []) as KbTemplate[]
    },
    enabled: !!orgId,
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return templates
    const q = search.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    )
  }, [templates, search])

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch('') }}>
      <DialogContent style={{ maxWidth: '80vw' }} className="h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>Pre-built knowledge base with starter documents ready to go.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {search ? `No templates matching "${search}"` : 'No templates available.'}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((template) => {
                const isSelected = template.id === activeTemplateId
                const meta = templateMeta[template.id] || { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10', chips: [] }
                const Icon = meta.icon
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelect(template)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md disabled:opacity-50',
                      isSelected
                        ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/60 bg-muted/30 hover:border-primary/40'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}

                    <div className={`flex size-10 items-center justify-center rounded-xl ${meta.bgColor} ${meta.color}`}>
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{template.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {meta.chips.map((chip) => (
                        <span key={chip} className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between w-full pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <FileText className="size-3" />
                        {template.documents.length} docs
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Use Template <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}