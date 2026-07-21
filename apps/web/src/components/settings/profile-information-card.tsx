import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  displayName: z.string().trim().max(100, 'Display name must be 100 characters or less').optional(),
  avatar: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  username: z.string().trim().min(1, 'Username is required').max(30, 'Username must be 30 characters or less'),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

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
  const updateProfile = useUpdateProfile()

  const displayName = profile?.name || user?.name || ''
  const displayEmail = profile?.email || user?.email || ''
  const displayAvatar = profile?.avatar || user?.avatar || undefined
  const initials = getInitials(profile?.name ?? user?.name, displayEmail)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? user?.name ?? '',
      displayName: profile?.name ?? user?.name ?? '',
      avatar: profile?.avatar ?? user?.avatar ?? '',
      username: profile?.name?.toLowerCase().replace(/\s+/g, '_') ?? user?.email?.split('@')[0] ?? '',
      timezone: 'Asia/Karachi',
      language: 'English',
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(
      { name: data.name, avatar: data.avatar || undefined },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update profile')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details and avatar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-20 ring-2 ring-foreground/10">
                {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm">
                <Camera className="size-3.5" />
                Change Avatar
              </Button>
              <p className="text-[11px] text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
            </div>

            <div className="flex-1 space-y-4">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register('name')}
                      disabled={updateProfile.isPending}
                    />
                    {errors.name && (
                      <FieldDescription className="text-destructive">
                        {errors.name.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                    <Input
                      id="displayName"
                      placeholder="Display name"
                      {...register('displayName')}
                      disabled={updateProfile.isPending}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      value={displayEmail}
                      disabled
                      className="flex-1"
                    />
                    <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      Verified
                    </span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    placeholder="username"
                    {...register('username')}
                    disabled={updateProfile.isPending}
                  />
                  <FieldDescription>This is your public username.</FieldDescription>
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

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
              {updateProfile.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
