import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const orgSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

interface OrgInfoFormProps {
  name: string
  slug: string
  plan: string
  logo?: string
  onSubmit: (data: { name: string; slug: string; logo?: string }) => void
  loading?: boolean
}

export function OrgInfoForm({ name: initialName, slug: initialSlug, plan, logo: initialLogo, onSubmit, loading }: OrgInfoFormProps) {
  const [name, setName] = useState(initialName)
  const [slug, setSlug] = useState(initialSlug)
  const [logo, setLogo] = useState(initialLogo || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = orgSchema.safeParse({ name, slug })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit({ name, slug, logo: logo || undefined })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Info</CardTitle>
        <CardDescription>Update your organization details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Organization name"
                disabled={loading}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="organization-slug"
                disabled={loading}
                aria-invalid={!!errors.slug}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-logo">Logo URL</Label>
            <Input
              id="org-logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <Badge variant="secondary" className="capitalize">{plan}</Badge>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
