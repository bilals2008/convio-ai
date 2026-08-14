import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { ProfileInformationCard } from '@/components/settings/profile-information-card'
import { AccountOverviewCard } from '@/components/settings/account-overview-card'
import { LoginActivityTable } from '@/components/settings/login-activity-table'
import { ConnectedAccountsCard } from '@/components/settings/connected-accounts-card'
import { PasswordChangeCard } from '@/components/settings/password-change-card'
import { DangerZoneCard } from '@/components/settings/danger-zone-card'
import {
  ProfileFormProvider,
  useCreateProfileForm,
} from '@/components/settings/profile-form-context'
import { useProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'


export default function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const profileForm = useCreateProfileForm()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Profile" description="Manage your account information and preferences." />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const {
    form: {
      handleSubmit,
      formState: { isDirty },
    },
    onSubmit,
    isSaving,
  } = profileForm

  return (
    <ProfileFormProvider value={profileForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
        <PageHeader
          title="Profile"
          description="Manage your account information and preferences."
          action={
            <Button type="submit" disabled={isSaving || !isDirty}>
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              Save Changes
            </Button>
          }
        />

        <ProfileInformationCard profile={profile} user={user} />
        <AccountOverviewCard />
        <PasswordChangeCard />
        <LoginActivityTable />
        {/* <ConnectedAccountsCard /> */}
        <DangerZoneCard />
      </form>
    </ProfileFormProvider>
  )
}


