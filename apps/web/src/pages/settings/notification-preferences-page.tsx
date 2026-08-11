import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Moon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useNotificationPreferences, showNotificationError } from '@/lib/hooks/use-notifications'
import { CATEGORIES, CATEGORY_META } from '@/components/notifications/notification-styles'
import { toast } from '@/lib/toast'
import { LoadingPage } from '@/components/shared/loading'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function TimePicker({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (value: string) => void
  id?: string
}) {
  const [hour, minute] = value ? value.split(':') : ['', '']
  const set = (h: string, m: string) => onChange(h && m ? `${h}:${m}` : '')

  return (
    <div className="flex items-center gap-1">
      <NativeSelect size="sm" id={id} aria-label="Hour" className="w-16" value={hour} onChange={(e) => set(e.target.value, minute)}>
        <NativeSelectOption value="">–</NativeSelectOption>
        {HOURS.map((h) => (
          <NativeSelectOption key={h} value={h}>{h}</NativeSelectOption>
        ))}
      </NativeSelect>
      <span className="text-muted-foreground">:</span>
      <NativeSelect size="sm" aria-label="Minute" className="w-16" value={minute} onChange={(e) => set(hour, e.target.value)}>
        <NativeSelectOption value="">–</NativeSelectOption>
        {MINUTES.map((m) => (
          <NativeSelectOption key={m} value={m}>{m}</NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

const quietHoursSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM (24h format)'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM (24h format)'),
  })
  .refine((v) => v.start !== v.end, { message: 'Start and end must differ', path: ['end'] })

type QuietHoursValues = z.infer<typeof quietHoursSchema>

export default function NotificationPreferencesPage() {
  const { data: prefs, isLoading, update } = useNotificationPreferences()
  const [savingQuiet, setSavingQuiet] = useState(false)

  const quietHoursForm = useForm<QuietHoursValues>({
    resolver: zodResolver(quietHoursSchema),
    defaultValues: { start: '', end: '' },
  })

  const categories = prefs
    ? CATEGORIES.map((c) => ({
        key: c,
        label: CATEGORY_META[c]?.label ?? c,
        inApp: prefs.categorySettings?.[c]?.inApp !== false,
      }))
    : []

  if (isLoading) return <LoadingPage text="Loading notification preferences..." />

  if (!prefs) return null

  const updateField = (patch: Parameters<typeof update.mutate>[0], successMsg: string) => {
    update.mutate(patch, {
      onSuccess: () => toast.success(successMsg),
      onError: showNotificationError,
    })
  }

  const handleQuietHours = quietHoursForm.handleSubmit((values) => {
    setSavingQuiet(true)
    update.mutate(
      { quietHours: { start: values.start, end: values.end } },
      {
        onSuccess: () => {
          toast.success('Quiet hours saved')
          setSavingQuiet(false)
        },
        onError: (e) => {
          showNotificationError(e)
          setSavingQuiet(false)
        },
      }
    )
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notification Preferences"
        description="Choose which notifications you receive and how they reach you."
      />

      <Card>
        <CardHeader>
          <CardTitle>Quiet hours</CardTitle>
          <CardDescription>Non-critical notifications are deferred during this window. Critical alerts are never blocked.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuietHours} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qh-start">Start</Label>
              <TimePicker
                id="qh-start"
                value={quietHoursForm.watch('start')}
                onChange={(v) => quietHoursForm.setValue('start', v, { shouldValidate: true })}
              />
              <p className="text-xs text-destructive">{quietHoursForm.formState.errors.start?.message}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qh-end">End</Label>
              <TimePicker
                id="qh-end"
                value={quietHoursForm.watch('end')}
                onChange={(v) => quietHoursForm.setValue('end', v, { shouldValidate: true })}
              />
              <p className="text-xs text-destructive">{quietHoursForm.formState.errors.end?.message}</p>
            </div>
            <Button type="submit" size="sm" disabled={savingQuiet}>
              {savingQuiet ? 'Saving...' : 'Save quiet hours'}
            </Button>
            {prefs.quietHours?.start && prefs.quietHours?.end && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Moon className="size-3.5" />
                Active {prefs.quietHours.start} – {prefs.quietHours.end}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Fine-tune delivery per category.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label className="capitalize">{cat.label}</Label>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  size="sm"
                  checked={cat.inApp}
                  onCheckedChange={(checked) =>
                    updateField(
                      { categorySettings: { ...prefs.categorySettings, [cat.key]: { ...prefs.categorySettings[cat.key], inApp: checked } } },
                      `${cat.label} in-app notifications updated`
                    )
                  }
                />
                In-app
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}