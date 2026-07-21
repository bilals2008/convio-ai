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

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Profile" description="Manage your account information and preferences." />
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
        title="Profile"
        description="Manage your account information and preferences."
      />

      <ProfileInformationCard profile={profile} user={user} />
      <AccountOverviewCard />
      <SecurityStatusCard />
      <LoginActivityTable />
      <ConnectedAccountsCard />
      <DangerZoneCard />
    </div>
  )
}
