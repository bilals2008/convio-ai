import { useState } from 'react'
import { Copy, Check, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsedAt?: string
}

interface ApiKeyTableProps {
  keys: ApiKey[]
  onDelete: (id: string) => void
  loading?: boolean
}

export function ApiKeyTable({ keys, onDelete, loading }: ApiKeyTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No API keys yet</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{key.name}</TableCell>
            <TableCell>
              <code className="text-xs font-mono text-muted-foreground">{key.keyPreview}</code>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(key.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(key.id, key.keyPreview)}
                  disabled={loading}
                >
                  {copiedId === key.id ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(key.id)}
                  disabled={loading}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
