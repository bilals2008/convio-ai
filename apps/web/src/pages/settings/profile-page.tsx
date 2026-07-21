import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  Bell,
  Key,
  LinkIcon,
  Settings,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { ProfileInformationCard } from '@/components/settings/profile-information-card'
import { AccountOverviewCard } from '@/components/settings/account-overview-card'
import { SecurityStatusCard } from '@/components/settings/security-status-card'
import { LoginActivityTable } from '@/components/settings/login-activity-table'
import { ConnectedAccountsCard } from '@/components/settings/connected-accounts-card'
import { DangerZoneCard } from '@/components/settings/danger-zone-card'
import { useProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User, href: '/settings/profile' },
  { id: 'security', label: 'Security', icon: Shield, href: '/settings/security' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
  { id: 'api-keys', label: 'API Keys', icon: Key, href: '/settings/provider-keys' },
  { id: 'connected', label: 'Connected Accounts', icon: LinkIcon, href: '/settings/connected' },
  { id: 'preferences', label: 'Preferences', icon: Settings, href: '/settings/preferences' },
  { id: 'privacy', label: 'Privacy', icon: Eye, href: '/settings/privacy' },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, href: '/settings/danger' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const [activeTab, setActiveTab] = useState('profile')

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Settings / Profile" description="Manage your account information and preferences." />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-96 w-full rounded-xl md:col-span-3" />
          <Skeleton className="h-96 w-full rounded-xl md:col-span-2" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Settings / Profile"
        description="Manage your account information and preferences."
      />

      {/* ── Tab Navigation ────────────────────────────────── */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.href !== '/settings/profile') {
                  navigate(tab.href)
                } else {
                  setActiveTab(tab.id)
                }
              }}
              className={`
                relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className="size-3.5" />
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Profile Content ───────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Two Column: Profile Info + Account Overview */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ProfileInformationCard profile={profile} user={user} />
            </div>
            <div className="lg:col-span-2">
              <AccountOverviewCard />
            </div>
          </div>

          {/* Quick Security Status */}
          <SecurityStatusCard />

          {/* Recent Login Activity */}
          <LoginActivityTable />

          {/* Connected Accounts */}
          <ConnectedAccountsCard />

          {/* Danger Zone */}
          <DangerZoneCard />
        </div>
      )}
    </div>
  )
}
