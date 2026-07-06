import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface KnowledgeFormData {
  name: string
  description: string
}

interface KnowledgeFormProps {
  data: KnowledgeFormData
  onChange: (data: KnowledgeFormData) => void
  errors: Partial<Record<keyof KnowledgeFormData, string>>
  disabled?: boolean
}

export function KnowledgeForm({ data, onChange, errors, disabled }: KnowledgeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kb-name">Name *</Label>
        <Input
          id="kb-name"
          placeholder="Enter knowledge base name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          disabled={disabled}
          maxLength={200}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kb-description">Description</Label>
        <Textarea
          id="kb-description"
          placeholder="Brief description (optional)"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          disabled={disabled}
          maxLength={1000}
          rows={3}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>
    </div>
  )
}

export type { KnowledgeFormData }
