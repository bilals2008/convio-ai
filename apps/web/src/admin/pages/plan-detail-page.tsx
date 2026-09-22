import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CreditCard,
  Eye,
  Link2,
  ListChecks,
  Loader2,
  Palette,
  Plug,
  RefreshCw,
  Tag,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormField, CardSection } from '@/components/admin/plan-form-sections'
import { toast } from '@/lib/toast'
import {
  useAdminPlans,
  useCreateCreemProduct,
  useCreemStatus,
  useLinkCreemProduct,
  usePlanCreemStatus,
  useSyncCreemProduct,
} from '@/admin/hooks/use-admin'
import {
  adminApi,
  type AdminPlan,
  type CreemPeriod,
  type PlanCreemPeriodStatus,
} from '@/admin/services/admin-api'
import { cn } from '@/lib/utils'

const planFormSchema = z.object({
  key: z.string().trim().min(1, 'Plan key is required').max(50, 'Key must be 50 characters or less'),
  name: z.string().trim().min(1, 'Plan name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string(),
  price: z.string(),
  priceMonthly: z.string().refine((v) => v.trim() === '' || !Number.isNaN(Number(v)), { message: 'Enter a number' }),
  priceYearly: z.string().refine((v) => v.trim() === '' || !Number.isNaN(Number(v)), { message: 'Enter a number' }),
  yearlyPrice: z.string(),
  period: z.string(),
  badge: z.string(),
  cta: z.string(),
  href: z.string(),
  variant: z.string(),
  icon: z.string(),
  iconColor: z.string(),
  sortOrder: z.string().refine((v) => v.trim() === '' || !Number.isNaN(Number(v)), { message: 'Enter a number' }),
  trialPeriodDays: z.string().refine((v) => v.trim() === '' || Number(v) >= 1, { message: 'Enter 1 or more days' }),
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
  priceYearly: '',
  yearlyPrice: '',
  period: '',
  badge: '',
  cta: '',
  href: '',
  variant: 'outline',
  icon: '',
  iconColor: '',
  sortOrder: '0',
  trialPeriodDays: '',
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
  priceYearly: plan?.priceYearly?.toString() ?? '',
  yearlyPrice: plan?.yearlyPrice ?? '',
  period: plan?.period ?? '',
  badge: plan?.badge ?? '',
  cta: plan?.cta ?? '',
  href: plan?.href ?? '',
  variant: plan?.variant ?? 'outline',
  icon: plan?.icon ?? '',
  iconColor: plan?.iconColor ?? '',
  sortOrder: plan?.sortOrder?.toString() ?? '0',
  trialPeriodDays: plan?.trialPeriodDays?.toString() ?? '',
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

function formatCents(cents: number | null, currency = 'USD') {
  if (cents === null) return '—'
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function CreemPeriodRow({
  label,
  status,
  busy,
  actionsDisabled,
  onCreate,
  onSync,
  onLink,
}: {
  label: string
  status: PlanCreemPeriodStatus
  busy: boolean
  actionsDisabled: boolean
  onCreate: () => void
  onSync: () => void
  onLink: () => void
}) {
  const hasId = !!status.productId
  const hasMismatch = status.found && status.mismatches.length > 0

  const chip = !hasId
    ? { text: 'Not linked', className: 'bg-muted text-muted-foreground' }
    : !status.found
      ? { text: 'Not found', className: 'bg-destructive/10 text-destructive' }
      : hasMismatch
        ? { text: 'Mismatch', className: 'bg-amber-500/10 text-amber-600' }
        : { text: 'Verified', className: 'bg-emerald-500/10 text-emerald-600' }

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="secondary" className={cn('shrink-0', chip.className)}>{chip.text}</Badge>
            {status.source === 'env' && <span className="text-[11px] text-muted-foreground">from .env</span>}
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {status.productId ?? 'No Creem product linked'}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatCents(status.amountCents)}</span>
      </div>

      {status.product && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>Creem: {status.product.name}</span>
          <span>{formatCents(status.product.price, status.product.currency)}</span>
          <span className={cn(status.product.status !== 'active' && 'text-destructive')}>{status.product.status}</span>
          <span>{status.product.trialPeriodDays ? `${status.product.trialPeriodDays}d trial` : 'no trial'}</span>
        </div>
      )}

      {status.mismatches.length > 0 && (
        <ul className="mt-2 space-y-1">
          {status.mismatches.map((m) => (
            <li key={m} className="flex items-start gap-1.5 text-[11px] text-amber-600">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!hasId ? (
          <Button type="button" variant="outline" size="sm" onClick={onCreate} disabled={busy || actionsDisabled}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
            Create in Creem
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onSync} disabled={busy || actionsDisabled || !status.found}>
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Sync to Creem
            </Button>
            {status.source === 'env' && (
              <Button type="button" variant="outline" size="sm" onClick={onLink} disabled={busy || actionsDisabled || !status.found}>
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}
                Save to plan
              </Button>
            )}
          </>
        )}
      </div>
    </div>
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

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [busyPeriod, setBusyPeriod] = useState<CreemPeriod | null>(null)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    values: formValues,
  })

  const creemGlobal = useCreemStatus()
  const creemStatus = usePlanCreemStatus(plan?.id, isEdit && !!plan)
  const createCreem = useCreateCreemProduct(plan?.id ?? '')
  const syncCreem = useSyncCreemProduct(plan?.id ?? '')
  const linkCreem = useLinkCreemProduct(plan?.id ?? '')

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
  const formDirty = form.formState.isDirty

  const isHighlighted = useWatch({ control: form.control, name: 'highlighted' })
  const isComingSoon = useWatch({ control: form.control, name: 'comingSoon' })
  const isActive = useWatch({ control: form.control, name: 'active' })
  const trialDays = useWatch({ control: form.control, name: 'trialPeriodDays' })
  const previewName = useWatch({ control: form.control, name: 'name' })
  const previewPrice = useWatch({ control: form.control, name: 'price' })
  const previewBadge = useWatch({ control: form.control, name: 'badge' })

  const handleSubmit = form.handleSubmit((data) => {
    const num = (s: string) => (s.trim() === '' ? null : Number(s))
    saveMutation.mutate({
      key: data.key.trim(),
      name: data.name.trim(),
      description: data.description || null,
      price: data.price || null,
      priceMonthly: num(data.priceMonthly),
      priceYearly: num(data.priceYearly),
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
      trialPeriodDays: num(data.trialPeriodDays),
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

  // Cmd/Ctrl+S saves, matching the rest of the admin panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (!saving) void handleSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSubmit, saving])

  // The Creem actions read the saved plan, so they must not run on unsaved edits.
  const runCreemAction = async (period: CreemPeriod, action: () => Promise<unknown>) => {
    setBusyPeriod(period)
    try {
      await action()
    } catch {
      // useCreemMutation already surfaces the error as a toast.
    } finally {
      setBusyPeriod(null)
    }
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

  const mode = creemGlobal.data?.mode
  const periods = creemStatus.data?.periods ?? []

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
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/pricing')} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || (isEdit && !formDirty)}>
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

      {mode && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            mode === 'test' ? 'border-amber-500/30 bg-amber-500/5' : 'border-destructive/30 bg-destructive/5',
          )}
        >
          <Plug className={cn('size-4 shrink-0', mode === 'test' ? 'text-amber-600' : 'text-destructive')} />
          <div className="min-w-0 text-xs">
            <p className="font-medium text-foreground">
              {mode === 'test' ? 'Creem is in TEST mode' : 'Creem is in LIVE mode'}
            </p>
            <p className="text-muted-foreground">
              {mode === 'test'
                ? 'No real payments. Product IDs here only work in TEST.'
                : 'Changes affect real customers and payments.'}
            </p>
          </div>
        </div>
      )}

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

          <CardSection icon={CreditCard} title="Pricing" description="Display values and the numeric amounts sent to Creem.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Price (display)" hint="Shown on the pricing card">
                <Input className="h-9" placeholder="$39/mo" {...form.register('price')} />
              </FormField>
              <FormField label="Monthly amount ($)" error={form.formState.errors.priceMonthly?.message} hint="Charged each month">
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="39" {...form.register('priceMonthly')} />
              </FormField>
              <FormField label="Yearly price (display)" hint="Shown as the yearly rate, usually per month">
                <Input className="h-9" placeholder="$31" {...form.register('yearlyPrice')} />
              </FormField>
              <FormField label="Yearly amount ($)" error={form.formState.errors.priceYearly?.message} hint="Charged once per year — the total">
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="372" {...form.register('priceYearly')} />
              </FormField>
              <FormField label="Period">
                <Input className="h-9" placeholder="/month" {...form.register('period')} />
              </FormField>
              <FormField
                label="Trial days"
                error={form.formState.errors.trialPeriodDays?.message}
                hint="Free trial at checkout, handled by Creem. Blank = no trial."
              >
                <Input className="h-9" type="number" min="1" max="365" placeholder="No trial" {...form.register('trialPeriodDays')} />
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
                <Input className="h-9" placeholder="Get started" {...form.register('cta')} />
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

          {isEdit && (
            <Card className="border-destructive/30">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Danger zone</CardTitle>
                  <CardDescription>Deleting a plan does not change organizations already on it.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={saving || deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Delete plan
                </Button>
              </CardContent>
            </Card>
          )}
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

            <CardSection icon={Plug} title="Creem" description="Products that power checkout and webhook mapping.">
              {!isEdit || !plan ? (
                <p className="text-xs text-muted-foreground">
                  Save the plan first — Creem products are linked to a saved plan.
                </p>
              ) : formDirty ? (
                <p className="flex items-start gap-2 text-xs text-amber-600">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Save your changes first, then create, sync, or link Creem products.
                </p>
              ) : creemStatus.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {periods.map((p) => (
                    <CreemPeriodRow
                      key={p.period}
                      label={p.period === 'yearly' ? 'Yearly' : 'Monthly'}
                      status={p}
                      busy={busyPeriod === p.period}
                      actionsDisabled={saving}
                      onCreate={() => runCreemAction(p.period, () => createCreem.mutateAsync({ period: p.period }))}
                      onSync={() => runCreemAction(p.period, () => syncCreem.mutateAsync({ period: p.period }))}
                      onLink={() => runCreemAction(p.period, () => linkCreem.mutateAsync({ period: p.period }))}
                    />
                  ))}
                  {creemGlobal.data && !creemGlobal.data.configured && (
                    <p className="text-xs text-destructive">Creem API key is not configured on the server.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => creemStatus.refetch()}
                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3" />
                    Re-check
                  </button>
                </div>
              )}
            </CardSection>

            <CardSection icon={BadgeCheck} title="Preview" description="How this plan appears on the pricing page.">
              <div className={cn('rounded-xl border p-4', isHighlighted ? 'border-primary/40' : 'border-border/60')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{previewName || 'Plan name'}</p>
                  {previewBadge && (
                    <Badge variant="secondary" className="border border-primary/20 bg-primary/15 text-primary">{previewBadge}</Badge>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular-nums">{previewPrice || '—'}</span>
                </div>
                {trialDays && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <Check className="size-3" />
                    {trialDays}-day free trial at checkout
                  </p>
                )}
                {isComingSoon && <p className="mt-2 text-[11px] text-muted-foreground">Shown as coming soon</p>}
                {!isActive && <p className="mt-2 text-[11px] text-muted-foreground">Hidden from the pricing page</p>}
              </div>
            </CardSection>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete the "${plan?.name}" plan?`}
        description="Organizations already on this plan keep their access, but the plan disappears from the pricing page and can no longer be purchased."
        confirmText="Delete plan"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
