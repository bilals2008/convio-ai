import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import {
  User,
  Shield,
  Bell,
  Palette,
  Brain,
  Code2,
  CreditCard,
  Trash2,
  Save,
  Loader2,
  Mail,
  Building2,
  KeyRound,
  Smartphone,
  Monitor,
  Users,
  UserPlus,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  Copy,
  Plus,
  Webhook,
  BookOpen,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  LogOut,
  ArrowUpRight,
  Receipt,
  CreditCard as PaymentIcon,
  TrendingUp,
  Lock,
  Fingerprint,
  Link2,
  Settings2,
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
import { Skeleton } from '@/components/shared/loading'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import api, { apiKeys as apiKeysApi } from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Navigation Config ────────────────────────────────────────────────
type SectionId =
  | 'profile'
  | 'personal'
  | 'account'
  | 'organization'
  | 'notifications'
  | 'appearance'
  | 'ai-preferences'
  | 'api-developer'
  | 'security'
  | 'billing'
  | 'data-privacy'
  | 'danger-zone'

interface NavItem {
  id: SectionId
  label: string
  icon: React.ElementType
  group?: string
  danger?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: User, group: 'Account' },
  { id: 'personal', label: 'Personal Information', icon: Mail },
  { id: 'account', label: 'Account Settings', icon: Settings2 },
  { id: 'organization', label: 'Organization', icon: Building2, group: 'Workspace' },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'Preferences' },
  { id: 'ai-preferences', label: 'AI Preferences', icon: Brain },
  { id: 'api-developer', label: 'API & Developer', icon: Code2, group: 'Developer' },
  { id: 'security', label: 'Security', icon: Shield, group: 'Privacy' },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Lock },
  { id: 'danger-zone', label: 'Danger Zone', icon: Trash2, danger: true },
]

// ─── Sticky Save Bar ──────────────────────────────────────────────────
function SaveBar({
  hasChanges,
  onSave,
  onReset,
  saving,
}: {
  hasChanges: boolean
  onSave: () => void
  onReset: () => void
  saving: boolean
}) {
  if (!hasChanges) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <p className="text-sm text-muted-foreground">You have unsaved changes</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

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
function ProfileSection({ user, org, onSave, saving }: any) {
  const [name, setName] = useState(user?.name || '')
  const [hasChanges, setHasChanges] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  const handleChange = (val: string) => {
    setName(val)
    setHasChanges(val !== (user?.name || ''))
  }

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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={name}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    defaultValue={user?.email?.split('@')[0] || ''}
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user?.email || ''} disabled />
                    <Badge variant="secondary" className="shrink-0">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value="Owner" disabled />
                </div>
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

// ─── Personal Information Section ─────────────────────────────────────
function PersonalInformationSection() {
  return (
    <Section id="personal" title="Personal Information" description="Manage your personal details">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input id="job-title" placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Inc." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="UTC-5 (Eastern)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English (US)" />
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
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
          <Button variant="outline" size="sm">
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
              <Badge variant="outline" className="text-xs">Not configured</Badge>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </SettingRow>
          <Separator />
          <SettingRow label="SMS Backup" description="Receive codes via SMS as a backup method">
            <Button variant="outline" size="sm">Setup</Button>
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
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <LogOut className="size-4" />
                </Button>
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
                <Badge variant="outline" className="text-xs">{entry.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Organization Section ─────────────────────────────────────────────
function OrganizationSection({ org }: { org: any }) {
  return (
    <Section id="organization" title="Organization" description="Your organization details and membership">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue={org?.name || ''} placeholder="Organization name" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input defaultValue={org?.slug || ''} placeholder="organization-slug" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{org?.plan || 'free'}</Badge>
              <Button variant="outline" size="sm">
                <ArrowUpRight className="size-3" />
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              Members
            </span>
            <Button variant="outline" size="sm">
              <UserPlus className="size-4" />
              Invite
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'You', email: 'you@example.com', role: 'Owner' },
              { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
              { name: 'Bob Wilson', email: 'bob@example.com', role: 'Member' },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.role === 'Owner' ? 'default' : 'secondary'} className="text-xs">
                  {member.role}
                </Badge>
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

// ─── Appearance Section ───────────────────────────────────────────────
function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [sidebarBehavior, setSidebarBehavior] = useState<'auto' | 'manual'>('auto')

  return (
    <Section id="appearance" title="Appearance" description="Customize how Convio looks and feels">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: MonitorIcon },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <Icon className={cn('size-5', theme === value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-xs font-medium', theme === value ? 'text-foreground' : 'text-muted-foreground')}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="flex items-center gap-2">
              {['green', 'blue', 'purple', 'orange', 'rose'].map((color) => (
                <button
                  key={color}
                  className={cn(
                    'size-8 rounded-full border-2 transition-all',
                    color === 'green' && 'border-primary ring-2 ring-primary/20',
                    color === 'green' && 'bg-primary',
                    color === 'blue' && 'bg-info border-transparent',
                    color === 'purple' && 'bg-[hsl(270,65%,60%)] border-transparent',
                    color === 'orange' && 'bg-[hsl(38,92%,50%)] border-transparent',
                    color === 'rose' && 'bg-[hsl(0,84%,60%)] border-transparent',
                  )}
                  aria-label={`${color} accent`}
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Density</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['comfortable', 'compact'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setDensity(option)}
                  className={cn(
                    'rounded-lg border-2 p-3 text-left transition-colors',
                    density === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <span className="text-sm font-medium capitalize">{option}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option === 'comfortable' ? 'More spacing, easier to read' : 'Dense layout, more content visible'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <SettingRow label="Sidebar Behavior" description="How the sidebar behaves when navigating">
            <div className="flex items-center gap-2">
              {(['auto', 'manual'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSidebarBehavior(option)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                    sidebarBehavior === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </SettingRow>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── AI Preferences Section ───────────────────────────────────────────
function AIPreferencesSection() {
  const [prefs, setPrefs] = useState({
    provider: 'openai',
    model: 'gpt-4o',
    streaming: true,
    temperature: 0.7,
    maxTokens: 4096,
  })

  return (
    <Section id="ai-preferences" title="AI Preferences" description="Configure your default AI settings">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default AI Provider</Label>
              <Input
                value={prefs.provider}
                onChange={(e) => setPrefs(p => ({ ...p, provider: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Model</Label>
              <Input
                value={prefs.model}
                onChange={(e) => setPrefs(p => ({ ...p, model: e.target.value }))}
              />
            </div>
          </div>

          <SettingRow label="Response Streaming" description="Stream AI responses in real-time">
            <Switch
              size="sm"
              checked={prefs.streaming}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, streaming: v }))}
            />
          </SettingRow>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Default Temperature</Label>
              <span className="text-sm font-mono text-muted-foreground">{prefs.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={prefs.temperature}
              onChange={(e) => setPrefs(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Token Limit</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={prefs.maxTokens}
                onChange={(e) => setPrefs(p => ({ ...p, maxTokens: parseInt(e.target.value) || 0 }))}
                className="max-w-[120px]"
              />
              <span className="text-sm text-muted-foreground">tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── API & Developer Section ──────────────────────────────────────────
function APIDeveloperSection({ orgId }: { orgId?: string }) {
  const [showKey, setShowKey] = useState<string | null>(null)

  const { isLoading } = useQuery({
    queryKey: ['api-keys', orgId],
    queryFn: async () => {
      const res = await apiKeysApi.list(orgId!)
      return res.data.data
    },
    enabled: !!orgId,
  })

  return (
    <Section id="api-developer" title="API & Developer" description="Manage API keys and developer tools">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <KeyRound className="size-4" />
              API Keys
            </span>
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Create Key
            </Button>
          </CardTitle>
          <CardDescription>Manage your API keys for programmatic access</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-2">
              {[
                { name: 'Production Key', key: 'sk_live_...abc123', created: 'Jul 1, 2026', lastUsed: '2 hours ago' },
                { name: 'Development Key', key: 'sk_test_...xyz789', created: 'Jun 15, 2026', lastUsed: '5 minutes ago' },
              ].map((apiKey, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{apiKey.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {showKey === apiKey.name ? apiKey.key : 'sk_••••••••'}
                      </code>
                      <button
                        onClick={() => setShowKey(showKey === apiKey.name ? null : apiKey.name)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showKey === apiKey.name ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      </button>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Copy className="size-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Created {apiKey.created} · Last used {apiKey.lastUsed}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Webhook className="size-4" />
            Webhooks
          </CardTitle>
          <CardDescription>Configure webhook endpoints for real-time events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Webhook className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No webhooks configured</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="size-4" />
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Fingerprint className="size-4" />
            Personal Access Tokens
          </CardTitle>
          <CardDescription>Tokens for CLI and SDK access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Fingerprint className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No personal access tokens</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="size-4" />
              Generate Token
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="size-4" />
            SDK Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { lang: 'JavaScript', pkg: 'npm install @convio/sdk' },
              { lang: 'Python', pkg: 'pip install convio-sdk' },
              { lang: 'cURL', pkg: 'REST API' },
            ].map((sdk) => (
              <div key={sdk.lang} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{sdk.lang}</p>
                <code className="text-xs text-muted-foreground font-mono mt-1 block">{sdk.pkg}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Security Section ─────────────────────────────────────────────────
function SecuritySection() {
  return (
    <Section id="security" title="Security" description="Manage your account security settings">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="size-4" />
            Connected Accounts
          </CardTitle>
          <CardDescription>Third-party accounts linked to your profile</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {[
            { name: 'Google', connected: true, email: 'john@gmail.com' },
            { name: 'GitHub', connected: false, email: '' },
            { name: 'Microsoft', connected: false, email: '' },
          ].map((account) => (
            <SettingRow
              key={account.name}
              label={account.name}
              description={account.connected ? account.email : 'Not connected'}
            >
              <Button variant={account.connected ? 'ghost' : 'outline'} size="sm">
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </SettingRow>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="size-4" />
            OAuth Providers
          </CardTitle>
          <CardDescription>Manage OAuth provider configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Shield className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              OAuth is managed through Supabase Auth
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <KeyRound className="size-4" />
            Backup Codes
          </CardTitle>
          <CardDescription>One-time use codes for account recovery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">You have <strong>8</strong> backup codes remaining</p>
              <p className="text-xs text-muted-foreground mt-0.5">Last generated 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">Regenerate</Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Billing Section ──────────────────────────────────────────────────
function BillingSection() {
  return (
    <Section id="billing" title="Billing" description="Manage your subscription and payments">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CreditCard className="size-4" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Free Plan</h3>
                <Badge variant="secondary">Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                1,000 messages/month · 1 agent · 1 knowledge base
              </p>
            </div>
            <Button>
              <ArrowUpRight className="size-4" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="size-4" />
            Usage Statistics
          </CardTitle>
          <CardDescription>Current billing period usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Messages', used: 245, total: 1000, unit: '' },
            { label: 'AI Tokens', used: 15420, total: 50000, unit: '' },
            { label: 'Knowledge Base', used: 1, total: 1, unit: 'base' },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  {item.used.toLocaleString()}{item.unit ? ` ${item.unit}` : ''} / {item.total.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Receipt className="size-4" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Receipt className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No invoices yet</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PaymentIcon className="size-4" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <PaymentIcon className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No payment methods on file</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="size-4" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Data & Privacy Section ───────────────────────────────────────────
function DataPrivacySection() {
  return (
    <Section id="data-privacy" title="Data & Privacy" description="Control your data and privacy settings">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SettingRow
            label="Export Data"
            description="Download all your data including conversations, agents, and settings"
          >
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </SettingRow>
          <Separator />
          <SettingRow
            label="Conversation History"
            description="Store conversation history for analytics and improvement"
          >
            <Switch size="sm" defaultChecked />
          </SettingRow>
          <Separator />
          <SettingRow
            label="Usage Analytics"
            description="Help improve Convio by sharing anonymous usage data"
          >
            <Switch size="sm" defaultChecked />
          </SettingRow>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Danger Zone Section ──────────────────────────────────────────────
function DangerZoneSection({ orgName }: { orgName: string }) {
  const [showDeleteOrgConfirm, setShowDeleteOrgConfirm] = useState(false)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  return (
    <Section id="danger-zone" title="Danger Zone" description="Irreversible actions that affect your account">
      <Card className="border-destructive/30">
        <CardContent className="pt-6 space-y-4">
          <div className="rounded-lg bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive">Delete Organization</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete <strong>{orgName}</strong> and all its data including agents,
                  conversations, knowledge bases, and widgets. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteOrgConfirm(!showDeleteOrgConfirm)}
                >
                  Delete Organization
                </Button>
                {showDeleteOrgConfirm && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Type <strong className="text-foreground">delete</strong> to confirm:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "delete"'
                        className="max-w-[200px]"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={confirmText !== 'delete'}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="size-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive">Delete Account</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. You will be
                  immediately logged out and lose access to all resources.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteAccountConfirm(!showDeleteAccountConfirm)}
                >
                  Delete Account
                </Button>
                {showDeleteAccountConfirm && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Type <strong className="text-foreground">delete my account</strong> to confirm:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "delete my account"'
                        className="max-w-[250px]"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={confirmText !== 'delete my account'}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const { org, orgId, isLoading: orgLoading } = useOrg()
  const [activeSection, setActiveSection] = useState<SectionId>('profile')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setHasChanges(false)
  }

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6">
          <Skeleton className="h-[600px] w-56 shrink-0" />
          <Skeleton className="flex-1 h-[600px]" />
        </div>
      </div>
    )
  }

  // Group nav items
  const grouped = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'Account'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, preferences, and security settings
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar nav */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2 px-3">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {items.map(({ id, label, icon: Icon, danger }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                        activeSection === id
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        danger && 'text-destructive/80 hover:text-destructive'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8 pb-24">
          {/* Mobile section selector */}
          <div className="lg:hidden">
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value as SectionId)}
              className="w-full rounded-lg border bg-card px-3 py-2 text-sm"
            >
              {NAV_ITEMS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          <ProfileSection user={user} org={org} onSave={handleSave} saving={saving} />
          <PersonalInformationSection />
          <AccountSettingsSection />
          <OrganizationSection org={org} />
          <NotificationsSection />
          <AppearanceSection />
          <AIPreferencesSection />
          <APIDeveloperSection orgId={orgId} />
          <SecuritySection />
          <BillingSection />
          <DataPrivacySection />
          <DangerZoneSection orgName={org?.name || 'Organization'} />
        </div>
      </div>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onReset={() => setHasChanges(false)} saving={saving} />
    </div>
  )
}
