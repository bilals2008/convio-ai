import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'
import { useProfileForm } from './profile-form-context'
import { AvatarUploadModal } from './avatar-upload-modal'

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

interface ProfileInformationCardProps {
  profile: ReturnType<typeof useProfile>['data']
  user: ReturnType<typeof useAuth>['user']
}

export function ProfileInformationCard({ profile, user }: ProfileInformationCardProps) {
  const { form, isSaving } = useProfileForm()
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form
  const [modalOpen, setModalOpen] = useState(false)

  const displayEmail = profile?.email || user?.email || ''
  const watchedName = watch('name')
  const watchedAvatar = watch('avatar')
  const displayAvatar = watchedAvatar || profile?.avatar || user?.avatar || undefined
  const displayName = watchedName || profile?.name || user?.name || 'Your name'
  const initials = getInitials(watchedName || profile?.name || user?.name, displayEmail)

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {/* Hero banner */}
      <div className="relative h-28 overflow-hidden bg-muted/30">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + identity row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
          <div className="relative -mt-12 shrink-0">
              <Avatar className="size-24 rounded-2xl ring-4 ring-card shadow-lg after:rounded-2xl">
                {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} className="rounded-2xl" />}
                <AvatarFallback className="rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon-sm"
                className="absolute -bottom-1.5 -right-1.5 size-8 rounded-full shadow-md ring-2 ring-card"
                title="Change avatar"
                onClick={() => setModalOpen(true)}
              >
                <Camera className="size-3.5" />
              </Button>
              <AvatarUploadModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                userId={user?.id || ''}
                currentAvatar={displayAvatar}
                currentInitials={initials}
                onAvatarSaved={(url) => setValue('avatar', url, { shouldDirty: true })}
              />
            </div>

          <div className="min-w-0 flex-1 sm:pb-1">
            <h2 className="truncate text-lg font-semibold leading-tight">{displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
          </div>
        </div>

        {/* Form */}
        <FieldGroup className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" placeholder="Your name" {...register('name')} disabled={isSaving} />
              {errors.name && (
                <FieldDescription className="text-destructive">{errors.name.message}</FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
              <Input
                id="displayName"
                placeholder="Display name"
                {...register('displayName')}
                disabled={isSaving}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input id="email" value={displayEmail} disabled />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Timezone</FieldLabel>
              <Select
                value={watch('timezone')}
                onValueChange={(val) => setValue('timezone', val, { shouldDirty: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select timezone</SelectLabel>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Language</FieldLabel>
              <Select
                value={watch('language')}
                onValueChange={(val) => setValue('language', val, { shouldDirty: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select language</SelectLabel>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
      </div>
    </div>
  )
}
