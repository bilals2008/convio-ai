import { useState, useMemo } from 'react'
import { Check, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import avatarPresets from '@/lib/config/avatar-presets.json'

interface AvatarPresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSelect: (url: string) => void
}

const categoryMeta: Record<string, { label: string; color: string }> = {
  support: { label: 'Support', color: 'bg-blue-500/10 text-blue-500' },
  business: { label: 'Business', color: 'bg-amber-500/10 text-amber-500' },
  education: { label: 'Education', color: 'bg-green-500/10 text-green-500' },
  developer: { label: 'Developer', color: 'bg-purple-500/10 text-purple-500' },
  researcher: { label: 'Researcher', color: 'bg-pink-500/10 text-pink-500' },
}

export function AvatarPresetModal({ open, onOpenChange, value, onSelect }: AvatarPresetModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(avatarPresets.map((a) => a.category))
    return ['all', ...Array.from(cats)]
  }, [])

  const filtered = useMemo(() => {
    let result = avatarPresets
    if (activeCategory !== 'all') {
      result = result.filter((a) => a.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, search])

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSearch(''); setActiveCategory('all') } }}>
      <DialogContent style={{ maxWidth: '80vw' }} className="h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle>Choose a preset avatar</DialogTitle>
          <DialogDescription>Select an avatar for your agent.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search avatars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat
              const meta = cat !== 'all' ? categoryMeta[cat] : null
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {meta?.label || 'All'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {search ? `No avatars matching "${search}"` : 'No avatars available.'}
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-10">
              {filtered.map((avatar) => {
                const isSelected = avatar.url === value
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      onSelect(avatar.url)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'group relative size-12 rounded-xl overflow-hidden ring-2 transition-all hover:ring-primary/50 hover:scale-105',
                      isSelected ? 'ring-primary' : 'ring-transparent'
                    )}
                  >
                    <img src={avatar.url} alt={avatar.name} className="size-full object-cover" />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Check className="size-5 text-primary" />
                      </span>
                    )}
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