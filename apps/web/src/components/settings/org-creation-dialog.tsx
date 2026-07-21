import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Building2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { organizations as orgsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { usePlan } from '@/lib/hooks/use-billing'
import { OrgPlanUpgrade } from '@/components/shared/org-plan-upgrade'

interface OrgCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrgCreationDialog({ open, onOpenChange }: OrgCreationDialogProps) {
  const queryClient = useQueryClient()
  const { orgs } = useOrg()
  const { data: plan } = usePlan()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setSlugManuallyEdited(false)
      setShowUpgrade(false)
    }
  }, [open])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugManuallyEdited) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  const createOrg = useMutation({
    mutationFn: async () => {
      const res = await orgsApi.create({ name, slug })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization created')
      onOpenChange(false)
    },
    onError: (error) => {
      const data = (error as any)?.response?.data
      if (data?.error === 'PLAN_LIMIT_EXCEEDED') {
        setShowUpgrade(true)
      } else {
        toast.error(error.message || 'Failed to create organization')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    createOrg.mutate()
  }

  const planName = plan?.name || 'free'
  const planLimits: Record<string, number> = { free: 1, pro: 3, business: 5, enterprise: Infinity }
  const limit = planLimits[planName] ?? 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showUpgrade ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowUpgrade(false)}
              >
                <ArrowLeft className="size-3.5" />
              </Button>
              <DialogTitle className="text-sm">Upgrade your plan</DialogTitle>
            </div>
            <OrgPlanUpgrade
              currentOrgs={orgs.length}
              currentPlan={planName}
              limit={limit}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="size-4 text-primary" />
                </span>
                Create Organization
              </DialogTitle>
              <DialogDescription>
                Set up your workspace to start building AI agents.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="My Organization"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={createOrg.isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug</Label>
                <Input
                  id="org-slug"
                  placeholder="my-organization"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugManuallyEdited(true)
                  }}
                  disabled={createOrg.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createOrg.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrg.isPending || !name.trim() || !slug.trim()}>
                {createOrg.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
