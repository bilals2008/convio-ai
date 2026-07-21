import { createContext, useContext } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  displayName: z.string().trim().max(100, 'Display name must be 100 characters or less').optional(),
  avatar: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  username: z.string().trim().min(1, 'Username is required').max(30, 'Username must be 30 characters or less'),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormContextValue {
  form: UseFormReturn<ProfileFormValues>
  onSubmit: (data: ProfileFormValues) => void
  isSaving: boolean
}

const ProfileFormContext = createContext<ProfileFormContextValue | null>(null)

export function useProfileForm() {
  const ctx = useContext(ProfileFormContext)
  if (!ctx) throw new Error('useProfileForm must be used within ProfileFormProvider')
  return ctx
}

export function useCreateProfileForm() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
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
        onSuccess: () => toast.success('Profile updated successfully'),
        onError: (error) => toast.error(error.message || 'Failed to update profile'),
      }
    )
  }

  return { form, onSubmit, isSaving: updateProfile.isPending }
}

export function ProfileFormProvider({
  value,
  children,
}: {
  value: ProfileFormContextValue
  children: React.ReactNode
}) {
  return <ProfileFormContext.Provider value={value}>{children}</ProfileFormContext.Provider>
}
