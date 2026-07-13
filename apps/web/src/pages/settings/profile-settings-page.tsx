import { useState } from 'react'
import {
  User,
  Shield,
  Bell,
  Save,
  Loader2,
  Mail,
  KeyRound,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  LogOut,
  History,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

// ─── Section Wrapper ──────────────────────────────────────────────────
function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── Setting Row ──────────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ─── Profile Section ──────────────────────────────────────────────────
function ProfileSection({ user, org }: { user: any; org: any }) {
  const [name, setName] = useState(user?.name || '')

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <Section id="profile" title="Profile" description="Your public profile information">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="size-20">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Change
              </button>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input value={org?.name || 'No organization'} disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Account Settings Section ─────────────────────────────────────────
function AccountSettingsSection() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Section id="account" title="Account Settings" description="Manage your account security and sessions">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <KeyRound className="size-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                />
                <TooltipContent side="left" className="text-xs">
                  {showPassword ? 'Hide password' : 'Show password'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <Button size="sm">
            <KeyRound className="size-4" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="size-4" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow label="Authenticator App" description="Use an authenticator app to generate one-time codes">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">Not configured</Badge>
              <Tooltip>
                <TooltipTrigger render={<Button size="sm">Enable</Button>} />
                <TooltipContent side="left" className="text-xs">
                  Set up authenticator app for 2FA
                </TooltipContent>
              </Tooltip>
            </div>
          </SettingRow>
          <Separator />
          <SettingRow label="SMS Backup" description="Receive codes via SMS as a backup method">
            <Tooltip>
              <TooltipTrigger render={<Button size="sm">Setup</Button>} />
              <TooltipContent side="left" className="text-xs">
                Add phone number for SMS codes
              </TooltipContent>
            </Tooltip>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Monitor className="size-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>Sessions where you are currently signed in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { device: 'Chrome on macOS', location: 'New York, US', current: true, time: 'Active now' },
            { device: 'Safari on iPhone', location: 'New York, US', current: false, time: '2 hours ago' },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                {session.device.includes('iPhone') ? (
                  <Smartphone className="size-5 text-muted-foreground" />
                ) : (
                  <Monitor className="size-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {session.device}
                    {session.current && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">This device</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
                </div>
              </div>
              {!session.current && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <LogOut className="size-4" />
                      </Button>
                    }
                  />
                  <TooltipContent side="left" className="text-xs">
                    Sign out from this session
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="size-4" />
            Login History
          </CardTitle>
          <CardDescription>Recent sign-in activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: 'Today, 10:30 AM', ip: '192.168.1.1', status: 'Success', location: 'New York, US' },
              { time: 'Yesterday, 3:15 PM', ip: '192.168.1.1', status: 'Success', location: 'New York, US' },
              { time: 'Jul 12, 9:00 AM', ip: '10.0.0.1', status: 'Success', location: 'Boston, US' },
            ].map((entry, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'size-2 rounded-full',
                    entry.status === 'Success' ? 'bg-success' : 'bg-destructive'
                  )} />
                  <div>
                    <p className="font-medium">{entry.time}</p>
                    <p className="text-xs text-muted-foreground">IP: {entry.ip} · {entry.location}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">{entry.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Notifications Section ────────────────────────────────────────────
function NotificationsSection() {
  const [notifications, setNotifications] = useState({
    emailProduct: true,
    emailSecurity: true,
    emailMarketing: false,
    pushEnabled: true,
    pushMessages: true,
    pushAlerts: true,
  })

  return (
    <Section id="notifications" title="Notifications" description="Control how you receive notifications">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="size-4" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow label="Product Updates" description="New features and improvements">
            <Switch
              size="sm"
              checked={notifications.emailProduct}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, emailProduct: v }))}
            />
          </SettingRow>
          <SettingRow label="Security Alerts" description="Important security notifications">
            <Switch
              size="sm"
              checked={notifications.emailSecurity}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, emailSecurity: v }))}
            />
          </SettingRow>
          <SettingRow label="Marketing" description="Tips, product updates, and inspiration">
            <Switch
              size="sm"
              checked={notifications.emailMarketing}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, emailMarketing: v }))}
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="size-4" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow label="Enable Push Notifications" description="Receive push notifications in your browser">
            <Switch
              size="sm"
              checked={notifications.pushEnabled}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, pushEnabled: v }))}
            />
          </SettingRow>
          <SettingRow label="New Messages" description="When someone sends a message to your chatbot">
            <Switch
              size="sm"
              checked={notifications.pushMessages}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, pushMessages: v }))}
              disabled={!notifications.pushEnabled}
            />
          </SettingRow>
          <SettingRow label="System Alerts" description="Important system notifications">
            <Switch
              size="sm"
              checked={notifications.pushAlerts}
              onCheckedChange={(v) => setNotifications(n => ({ ...n, pushAlerts: v }))}
              disabled={!notifications.pushEnabled}
            />
          </SettingRow>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const { org, isLoading: orgLoading } = useOrg()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
  }

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account and preferences
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Changes
              </Button>
            }
          />
          <TooltipContent side="bottom" className="text-xs">
            Save all changes made on this page
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-8">
        <ProfileSection user={user} org={org} />
        <AccountSettingsSection />
        <NotificationsSection />
      </div>
    </div>
  )
}
