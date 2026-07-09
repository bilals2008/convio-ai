import { useState, useRef } from 'react'
import { z } from 'zod'
import { Loader2, Upload, FileText } from 'lucide-react'
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
import { knowledge as knowledgeApi } from '@/lib/api'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'

const documentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('txt'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('csv'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('md'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('json'), name: z.string().min(1).max(200), content: z.string().min(1) }),
  z.object({ type: z.literal('pdf'), name: z.string().min(1).max(200), file: z.instanceof(File).refine((f) => f.type === 'application/pdf', 'Must be a PDF file') }),
  z.object({ type: z.literal('url'), name: z.string().min(1).max(200), url: z.string().url('Valid URL required') }),
])

interface DocumentUploadFormProps {
  onSubmit: (data: { name: string; type: DocType; content?: string; url?: string }) => void
  knowledgeBaseId: string
  loading?: boolean
}

export function DocumentUploadForm({ onSubmit, knowledgeBaseId, loading }: DocumentUploadFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<DocType>('txt')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (type === 'pdf') {
      const result = documentSchema.safeParse({ name, type, file })
      if (!result.success) {
        setErrors(result.error.errors.map((e) => e.message))
        return
      }
      if (!file) return
      setErrors([])
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        await knowledgeApi.uploadPdf(knowledgeBaseId, formData)
        onSubmit({ name, type: 'pdf' })
      } finally {
        setUploading(false)
      }
      setName('')
      setFile(null)
      return
    }

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
  const isBusy = loading || uploading

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
            disabled={isBusy}
          />
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as DocType)} disabled={isBusy}>
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
            disabled={isBusy}
            className="min-h-[120px]"
          />
        </div>
      )}

      {type === 'pdf' && (
        <div className="space-y-2">
          <Label>PDF File *</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="size-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select a PDF file</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setFile(f)
                if (!name) setName(f.name.replace(/\.pdf$/i, ''))
              }
            }}
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
            disabled={isBusy}
          />
        </div>
      )}

      <Button type="submit" disabled={isBusy}>
        {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {isBusy ? 'Uploading...' : 'Add Document'}
      </Button>
    </form>
  )
}
