import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table'
import { Megaphone, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAdminAnnouncements } from '@/admin/hooks/use-admin'
import { adminApi, type Announcement } from '@/admin/services/admin-api'
import { useQueryClient } from '@tanstack/react-query'

const priorityBadge = (p: string) => {
  const map: Record<string, string> = { low: 'bg-muted text-muted-foreground', normal: 'bg-blue-500/10 text-blue-500', high: 'bg-amber-500/10 text-amber-500', critical: 'bg-red-500/10 text-red-500' }
  return <Badge variant="secondary" className={map[p] || 'bg-muted text-muted-foreground'}>{p}</Badge>
}

export default function AdminAnnouncementsPage() {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursors, setCursors] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [modal, setModal] = useState<{ open: boolean; edit?: Announcement }>({ open: false })
  const queryClient = useQueryClient()
  const limit = 25

  const { data, isLoading } = useAdminAnnouncements({ search: search || undefined, limit, cursor })

  const columns = useMemo<ColumnDef<Announcement>[]>(() => [
    { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.title}</span> },
    { accessorKey: 'priority', header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => priorityBadge(row.original.priority) },
    { id: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => row.original.published
        ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Published</Badge>
        : <Badge variant="secondary" className="bg-muted text-muted-foreground">Draft</Badge> },
    { accessorKey: 'createdAt', header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    { id: 'actions', header: null,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setModal({ open: true, edit: row.original })}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-500" onClick={async () => { await adminApi.deleteAnnouncement(row.original.id); queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] }) }}><Trash2 className="size-4" /></Button>
        </div>
      ) },
  ], [queryClient])

  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Platform-wide announcements for all users."
        actions={
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search announcements..." />
            <Button size="sm" onClick={() => setModal({ open: true })}><Plus className="size-4 mr-1" /> New</Button>
          </div>
        }
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{columns.map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="py-8"><EmptyState icon={Megaphone} title="No announcements yet" description="Create your first platform announcement." action={<Button size="sm" onClick={() => setModal({ open: true })}><Plus className="size-4 mr-1" /> Create</Button>} /></TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">{data?.data?.length ?? 0} announcements</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={() => { const prev = [...cursors]; setCursor(prev.pop()); setCursors(prev) }}><ChevronLeftIcon className="size-4" /> Previous</Button>
            <Button variant="outline" size="sm" disabled={!data?.nextCursor} onClick={() => { setCursors([...cursors, cursor!]); setCursor(data!.nextCursor!) }}>Next <ChevronRightIcon className="size-4" /></Button>
          </div>
        </div>
      </div>

      {modal.open && <AnnouncementModal announcement={modal.edit} onClose={() => setModal({ open: false })} onSaved={() => { setModal({ open: false }); queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] }) }} />}
    </div>
  )
}

function AnnouncementModal({ announcement, onClose, onSaved }: { announcement?: Announcement; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(announcement?.title || '')
  const [body, setBody] = useState(announcement?.body || '')
  const [priority, setPriority] = useState(announcement?.priority || 'normal')
  const [published, setPublished] = useState(announcement?.published || false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (announcement) {
        await adminApi.updateAnnouncement(announcement.id, { title, body, priority, published })
      } else {
        await adminApi.createAnnouncement({ title, body, priority, published })
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{announcement ? 'Edit' : 'New'} Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Body</label>
            <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Priority</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
                Published
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : announcement ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
