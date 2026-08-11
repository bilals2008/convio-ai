import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Megaphone, AlertTriangle, Eye, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { adminApi } from '@/admin/services/admin-api'
import { toast } from '@/lib/toast'
import { PRIORITY_META } from '@/components/notifications/notification-styles'

const EVENT_TYPES = [
  { value: 'system.platform_update', label: 'Platform Update' },
  { value: 'system.new_feature', label: 'New Feature' },
  { value: 'system.maintenance', label: 'Maintenance' },
  { value: 'system.security_alert', label: 'Security Alert' },
  { value: 'system.incident', label: 'Incident' },
  { value: 'system.downtime', label: 'Downtime' },
]

const broadcastSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().max(2000).optional(),
  type: z.string(),
  priority: z.string(),
  actionUrl: z.string().url('Enter a valid URL').max(500).optional().or(z.literal('')),
})

type BroadcastValues = z.infer<typeof broadcastSchema>

const userSendSchema = z.object({
  email: z.string().email('Enter a valid email'),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().max(2000).optional(),
  priority: z.string(),
  actionUrl: z.string().url('Enter a valid URL').max(500).optional().or(z.literal('')),
})

type UserSendValues = z.infer<typeof userSendSchema>

interface SentBroadcast {
  title: string
  message?: string
  type: string
  priority: string
  delivered: number
  sentAt: string
}

function loadRecent(): SentBroadcast[] {
  try {
    return JSON.parse(localStorage.getItem('convio:admin-broadcasts') ?? '[]') as SentBroadcast[]
  } catch {
    return []
  }
}

export default function AdminNotificationsPage() {
  const [sending, setSending] = useState(false)
  const [sendingUser, setSendingUser] = useState(false)
  const [recent, setRecent] = useState<SentBroadcast[]>(loadRecent)

  const form = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: '', message: '', type: 'system.platform_update', priority: 'low', actionUrl: '' },
  })

  const userForm = useForm<UserSendValues>({
    resolver: zodResolver(userSendSchema),
    defaultValues: { email: '', title: '', message: '', priority: 'medium', actionUrl: '' },
  })

  const title = useWatch({ control: form.control, name: 'title' })
  const message = useWatch({ control: form.control, name: 'message' })
  const selectedType = useWatch({ control: form.control, name: 'type' })
  const selectedPriority = useWatch({ control: form.control, name: 'priority' })
  const userTitle = useWatch({ control: userForm.control, name: 'title' })
  const userEmail = useWatch({ control: userForm.control, name: 'email' })
  const userPriority = useWatch({ control: userForm.control, name: 'priority' })

  const onSubmit = form.handleSubmit((values) => {
    setSending(true)
    adminApi
      .broadcastNotification({
        title: values.title,
        message: values.message || undefined,
        type: values.type,
        priority: values.priority,
        actionUrl: values.actionUrl || undefined,
      })
      .then((res) => {
        const delivered = res.data?.delivered ?? 0
        toast.success(`Broadcast sent to ${delivered} user${delivered === 1 ? '' : 's'}`)
        const entry: SentBroadcast = {
          title: values.title,
          message: values.message || undefined,
          type: values.type,
          priority: values.priority,
          delivered,
          sentAt: new Date().toISOString(),
        }
        const next = [entry, ...loadRecent()].slice(0, 10)
        localStorage.setItem('convio:admin-broadcasts', JSON.stringify(next))
        setRecent(next)
        form.reset({ title: '', message: '', type: values.type, priority: values.priority, actionUrl: '' })
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || 'Broadcast failed')
      })
      .finally(() => setSending(false))
  })

  const onSubmitUser = userForm.handleSubmit((values) => {
    setSendingUser(true)
    adminApi
      .sendNotification({
        email: values.email,
        title: values.title,
        message: values.message || undefined,
        priority: values.priority,
        actionUrl: values.actionUrl || undefined,
      })
      .then(() => {
        toast.success(`Notification sent to ${values.email}`)
        userForm.reset()
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || 'Failed to send notification')
      })
      .finally(() => setSendingUser(false))
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description="Broadcast platform notifications to every user and monitor recent sends."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Send broadcast
            </CardTitle>
            <CardDescription>
              Delivered in-app to every user in real time. High and critical priorities also trigger email unless muted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bcast-title">Title</Label>
                <Input id="bcast-title" placeholder="Scheduled maintenance tonight" {...form.register('title')} />
                <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bcast-message">Message</Label>
                <Textarea
                  id="bcast-message"
                  rows={4}
                  placeholder="Brief, actionable details users need to know..."
                  maxLength={2000}
                  {...form.register('message')}
                />
                <p className="text-xs text-destructive">{form.formState.errors.message?.message}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bcast-type">Event type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => form.setValue('type', v ?? 'system.platform_update')}
                  >
                    <SelectTrigger id="bcast-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bcast-priority">Priority</Label>
                  <Select
                    value={selectedPriority}
                    onValueChange={(v) => form.setValue('priority', v ?? 'low')}
                  >
                    <SelectTrigger id="bcast-priority" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_META).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bcast-url">Action URL</Label>
                <Input id="bcast-url" placeholder="https://convio.ai/status (optional)" {...form.register('actionUrl')} />
                <p className="text-xs text-destructive">{form.formState.errors.actionUrl?.message}</p>
              </div>

              <Button type="submit" disabled={sending || !title.trim()}>
                {sending ? 'Sending...' : <><Megaphone className="size-4" /> Send broadcast</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Preview
            </CardTitle>
            <CardDescription>How the notification card will look to users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Megaphone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{title || 'Broadcast title'}</p>
                  {message && <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{message}</p>}
                  {!message && (
                    <p className="mt-0.5 text-xs text-muted-foreground italic">Message preview appears here...</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-md border border-border bg-muted px-1 py-0 text-[9px] text-muted-foreground">
                      {PRIORITY_META[selectedPriority]?.label ?? 'Low'}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">System</span>
                    <span className="text-[11px] text-muted-foreground/60">Just now</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPriority === 'critical' && (
              <p className="mt-3 flex items-start gap-1.5 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Critical broadcasts bypass quiet hours and are always emailed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            Send to user
          </CardTitle>
          <CardDescription>Send a notification to a single user by email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usr-email">User email</Label>
                <Input id="usr-email" type="email" placeholder="user@example.com" {...userForm.register('email')} />
                <p className="text-xs text-destructive">{userForm.formState.errors.email?.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-title">Title</Label>
                <Input id="usr-title" placeholder="Your agent needs attention" {...userForm.register('title')} />
                <p className="text-xs text-destructive">{userForm.formState.errors.title?.message}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usr-message">Message</Label>
              <Textarea
                id="usr-message"
                rows={3}
                placeholder="Brief, actionable message for this user..."
                maxLength={2000}
                {...userForm.register('message')}
              />
              <p className="text-xs text-destructive">{userForm.formState.errors.message?.message}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usr-priority">Priority</Label>
                <Select value={userPriority} onValueChange={(v) => userForm.setValue('priority', v ?? 'medium')}>
                  <SelectTrigger id="usr-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_META).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usr-url">Action URL</Label>
                <Input id="usr-url" placeholder="https://convio.ai/agent/123 (optional)" {...userForm.register('actionUrl')} />
                <p className="text-xs text-destructive">{userForm.formState.errors.actionUrl?.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Preview: {userTitle || 'Notification title'}
                {userEmail && ` · to ${userEmail}`}
              </p>
              <Button type="submit" disabled={sendingUser || !userTitle.trim() || !userEmail.trim()}>
                {sendingUser ? 'Sending...' : <><Send className="size-4" /> Send notification</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent broadcasts (this browser)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recent.map((b, i) => (
              <div key={`${b.sentAt}-${i}`} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.title}</p>
                  {b.message && <p className="truncate text-xs text-muted-foreground">{b.message}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {b.delivered} delivered · {new Date(b.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}