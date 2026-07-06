import { useState } from 'react'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'

const documentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('txt'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('csv'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('md'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('json'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('pdf'), name: z.string().min(1).max(200) }),
  z.object({ type: z.literal('url'), name: z.string().min(1).max(200), url: z.string().url('Valid URL required') }),
])

interface DocumentUploadFormProps {
  onSubmit: (data: { name: string; type: DocType; content?: string; url?: string }) => void
  loading?: boolean
}

export function DocumentUploadForm({ onSubmit, loading }: DocumentUploadFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<DocType>('txt')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = documentSchema.safeParse({ name, type, content, url })
    if (!result.success) {
      setErrors(result.error.errors.map((e) => e.message))
      return
    }
    setErrors([])
    onSubmit({ name, type: result.data.type, content: 'content' in result.data ? result.data.content : undefined, url: 'url' in result.data ? result.data.url : undefined })
    setName('')
    setContent('')
    setUrl('')
  }

  const needsContent = ['txt', 'csv', 'md', 'json'].includes(type)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-destructive">{e}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="doc-name">Name *</Label>
          <Input
            id="doc-name"
            placeholder="Document name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as DocType)} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="txt">TXT</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {needsContent && (
        <div className="space-y-2">
          <Label htmlFor="doc-content">Content *</Label>
          <Textarea
            id="doc-content"
            placeholder="Paste document content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            className="min-h-[120px]"
          />
        </div>
      )}

      {type === 'url' && (
        <div className="space-y-2">
          <Label htmlFor="doc-url">URL *</Label>
          <Input
            id="doc-url"
            type="url"
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {loading ? 'Uploading...' : 'Add Document'}
      </Button>
    </form>
  )
}
