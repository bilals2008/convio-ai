import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { ArrowLeft, CreditCard, Eye, Link, ListChecks, Loader2, Palette, Tag, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminPlans } from '@/admin/hooks/use-admin'
import { adminApi, type AdminPlan } from '@/admin/services/admin-api'

const planFormSchema = z.object({
  key: z.string().trim().min(1, 'Plan key is required').max(50, 'Key must be 50 characters or less'),
  name: z.string().trim().min(1, 'Plan name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string(),
  price: z.string(),
  priceMonthly: z.string().refine((v) => v.trim() === '' || !Number.isNaN(Number(v)), { message: 'Enter a number' }),
  yearlyPrice: z.string(),
  period: z.string(),
  badge: z.string(),
  cta: z.string(),
  href: z.string(),
  variant: z.string(),
  icon: z.string(),
  iconColor: z.string(),
  sortOrder: z.string().refine((v) => v.trim() === '' || !Number.isNaN(Number(v)), { message: 'Enter a number' }),
  highlighted: z.boolean(),
  comingSoon: z.boolean(),
  active: z.boolean(),
  featuresText: z.string(),
  agents: z.string(),
  messagesPerMonth: z.string(),
  knowledgeBases: z.string(),
  organizations: z.string(),
  providerMonthlyProductId: z.string(),
  providerYearlyProductId: z.string(),
})

type PlanFormValues = z.infer<typeof planFormSchema>

const CREATE_DEFAULTS: PlanFormValues = {
  key: '',
  name: '',
  description: '',
  price: '',
  priceMonthly: '',
  yearlyPrice: '',
  period: '',
  badge: '',
  cta: '',
  href: '',
  variant: 'outline',
  icon: '',
  iconColor: '',
  sortOrder: '0',
  highlighted: false,
  comingSoon: false,
  active: true,
  featuresText: '',
  agents: '',
  messagesPerMonth: '',
  knowledgeBases: '',
  organizations: '',
  providerMonthlyProductId: '',
  providerYearlyProductId: '',
}

const toPlanValues = (plan?: AdminPlan): PlanFormValues => ({
  key: plan?.key ?? '',
  name: plan?.name ?? '',
  description: plan?.description ?? '',
  price: plan?.price ?? '',
  priceMonthly: plan?.priceMonthly?.toString() ?? '',
  yearlyPrice: plan?.yearlyPrice ?? '',
  period: plan?.period ?? '',
  badge: plan?.badge ?? '',
  cta: plan?.cta ?? '',
  href: plan?.href ?? '',
  variant: plan?.variant ?? 'outline',
  icon: plan?.icon ?? '',
  iconColor: plan?.iconColor ?? '',
  sortOrder: plan?.sortOrder?.toString() ?? '0',
  highlighted: plan?.highlighted ?? false,
  comingSoon: plan?.comingSoon ?? false,
  active: plan?.active ?? true,
  featuresText: (plan?.features ?? []).map((f) => f.text).join('\n'),
  agents: plan?.limits?.agents?.toString() ?? '',
  messagesPerMonth: plan?.limits?.messagesPerMonth?.toString() ?? '',
  knowledgeBases: plan?.limits?.knowledgeBases?.toString() ?? '',
  organizations: plan?.limits?.organizations?.toString() ?? '',
  providerMonthlyProductId: plan?.providerMonthlyProductId ?? '',
  providerYearlyProductId: plan?.providerYearlyProductId ?? '',
})

function FormField({ label, required, error, hint, className, children }: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function CardSection({ icon: Icon, title, description, children }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function AdminPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = id !== 'new'

  const { data: plans, isLoading } = useAdminPlans()
  const plan = useMemo(() => (isEdit ? plans?.find((p) => p.id === id) : undefined), [plans, id, isEdit])
  const formValues = useMemo(() => (plan ? toPlanValues(plan) : CREATE_DEFAULTS), [plan])

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    values: formValues,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      isEdit && plan ? adminApi.updatePlan(plan.id, payload) : adminApi.createPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success(isEdit ? 'Plan updated' : 'Plan created')
      navigate('/admin/pricing')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to save plan. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deletePlan(plan!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success('Plan deleted')
      navigate('/admin/pricing')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to delete plan.'),
  })

  const saving = saveMutation.isPending

  const isHighlighted = useWatch({ control: form.control, name: 'highlighted' })
  const isComingSoon = useWatch({ control: form.control, name: 'comingSoon' })
  const isActive = useWatch({ control: form.control, name: 'active' })

  const handleSubmit = form.handleSubmit((data) => {
    const num = (s: string) => (s.trim() === '' ? null : Number(s))
    saveMutation.mutate({
      key: data.key.trim(),
      name: data.name.trim(),
      description: data.description || null,
      price: data.price || null,
      priceMonthly: num(data.priceMonthly),
      yearlyPrice: data.yearlyPrice || null,
      period: data.period || null,
      badge: data.badge || null,
      highlighted: data.highlighted,
      comingSoon: data.comingSoon,
      active: data.active,
      cta: data.cta || null,
      href: data.href || null,
      variant: (data.variant as 'default' | 'outline') || null,
      icon: data.icon || null,
      iconColor: data.iconColor || null,
      sortOrder: num(data.sortOrder) ?? 0,
      features: data.featuresText.split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ text })),
      limits: {
        agents: num(data.agents),
        messagesPerMonth: num(data.messagesPerMonth),
        knowledgeBases: num(data.knowledgeBases),
        organizations: num(data.organizations),
      },
      providerMonthlyProductId: data.providerMonthlyProductId || null,
      providerYearlyProductId: data.providerYearlyProductId || null,
    })
  })

  const handleDelete = () => {
    if (!plan) return
    if (!confirm(`Delete the "${plan.name}" plan? This does not change orgs already on this plan.`)) return
    deleteMutation.mutate()
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
          <div className="space-y-6 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isEdit && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Plan not found.</p>
        <Button variant="link" onClick={() => navigate('/admin/pricing')}>Back to plans</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/pricing')}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft className="size-3.5" />
          Pricing
        </button>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button variant="outline" size="sm" disabled={saving || deleteMutation.isPending} onClick={handleDelete} className="text-red-500 hover:text-red-500">
              {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/pricing')} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <ListChecks className="size-3.5" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? plan!.name : 'New plan'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit ? 'Edit pricing, features, limits, and visibility. Changes apply immediately.' : 'Add a new plan. Changes apply immediately after saving.'}
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <CardSection icon={Tag} title="General" description="Identity and short description.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Key" required error={form.formState.errors.key?.message} hint="Unique id used by billing, e.g. pro">
                <Input className="h-9 font-mono" placeholder="pro" disabled={!!plan} {...form.register('key')} />
              </FormField>
              <FormField label="Name" required error={form.formState.errors.name?.message}>
                <Input className="h-9" placeholder="Pro" {...form.register('name')} />
              </FormField>
            </div>
            <FormField label="Description" className="mt-4">
              <Input className="h-9" placeholder="For growing businesses" {...form.register('description')} />
            </FormField>
          </CardSection>

          <CardSection icon={CreditCard} title="Pricing" description="Display values and the numeric amount billed monthly.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Price (display)" error={form.formState.errors.priceMonthly?.message} hint="Shown on the pricing card">
                <Input className="h-9" placeholder="$39/mo" {...form.register('price')} />
              </FormField>
              <FormField label="Monthly ($)" hint="Numeric amount used by billing">
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="39" {...form.register('priceMonthly')} />
              </FormField>
              <FormField label="Yearly (display)">
                <Input className="h-9" placeholder="$31" {...form.register('yearlyPrice')} />
              </FormField>
              <FormField label="Period">
                <Input className="h-9" placeholder="/month" {...form.register('period')} />
              </FormField>
            </div>
          </CardSection>

          <CardSection icon={Palette} title="Appearance" description="Badge, icon, button, and ordering on the pricing page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Badge">
                <Input className="h-9" placeholder="Most Popular" {...form.register('badge')} />
              </FormField>
              <FormField label="Icon">
                <NativeSelect className="w-full" {...form.register('icon')}>
                  <option value="">None</option>
                  <option value="zap">Zap</option>
                  <option value="star">Star</option>
                  <option value="shield">Shield</option>
                  <option value="crown">Crown</option>
                </NativeSelect>
              </FormField>
              <FormField label="CTA button">
                <Input className="h-9" placeholder="Start Free Trial" {...form.register('cta')} />
              </FormField>
              <FormField label="Href">
                <Input className="h-9" placeholder="/signup" {...form.register('href')} />
              </FormField>
              <FormField label="Button variant">
                <NativeSelect className="w-full" {...form.register('variant')}>
                  <option value="outline">Outline</option>
                  <option value="default">Default</option>
                </NativeSelect>
              </FormField>
              <FormField label="Icon color (tailwind)">
                <Input className="h-9" placeholder="text-primary" {...form.register('iconColor')} />
              </FormField>
            </div>
            <FormField label="Sort order" error={form.formState.errors.sortOrder?.message} className="mt-4 sm:max-w-[140px]">
              <Input className="h-9" type="number" min="0" step="1" {...form.register('sortOrder')} />
            </FormField>
          </CardSection>

          <CardSection icon={ListChecks} title="Features & limits" description="Feature bullets (one per line). Blank limit means unlimited.">
            <FormField label="Features (one per line)">
              <Textarea rows={8} className="font-mono text-xs" placeholder={'10 AI agents\n25,000 messages/mo\nAll channels'} {...form.register('featuresText')} />
            </FormField>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Agents">
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('agents')} />
              </FormField>
              <FormField label="Messages / mo">
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('messagesPerMonth')} />
              </FormField>
              <FormField label="Knowledge bases">
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('knowledgeBases')} />
              </FormField>
              <FormField label="Organizations">
                <Input className="h-9" type="number" min="0" step="1" placeholder="∞" {...form.register('organizations')} />
              </FormField>
            </div>
          </CardSection>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="lg:sticky lg:top-6 lg:space-y-6">
            <CardSection icon={Eye} title="Visibility" description="Where the plan shows up.">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Highlighted</Label>
                    <p className="text-xs text-muted-foreground">Standout card on the pricing page.</p>
                  </div>
                  <Switch checked={isHighlighted} onCheckedChange={(c) => form.setValue('highlighted', c, { shouldDirty: true })} disabled={saving} />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Coming soon</Label>
                    <p className="text-xs text-muted-foreground">Shown but not purchasable yet.</p>
                  </div>
                  <Switch checked={isComingSoon} onCheckedChange={(c) => form.setValue('comingSoon', c, { shouldDirty: true })} disabled={saving} />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium">Active</Label>
                    <p className="text-xs text-muted-foreground">Visible on the public pricing page.</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={(c) => form.setValue('active', c, { shouldDirty: true })} disabled={saving} />
                </div>
              </div>
            </CardSection>

            <CardSection icon={Link} title="Provider" description="Creem product IDs for checkout and webhook mapping.">
              <div className="space-y-4">
                <FormField label="Creem monthly product ID">
                  <Input className="h-9 font-mono text-xs" placeholder="prod_..." {...form.register('providerMonthlyProductId')} />
                </FormField>
                <FormField label="Creem yearly product ID">
                  <Input className="h-9 font-mono text-xs" placeholder="prod_..." {...form.register('providerYearlyProductId')} />
                </FormField>
              </div>
            </CardSection>
          </div>
        </div>
      </form>
    </div>
  )
}
