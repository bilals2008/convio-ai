import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, Calendar, Mail, User, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProfile, useUpdateProfile, useDeleteAccount } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  avatar: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

function getRoleBadgeVariant(role: string | undefined): 'owner' | 'admin' | 'member' | 'viewer' {
  if (role === 'owner') return 'owner'
  if (role === 'admin') return 'admin'
  if (role === 'viewer') return 'viewer'
  return 'member'
}

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { org } = useOrg()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const deleteAccount = useDeleteAccount()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? user?.name ?? '',
      avatar: profile?.avatar ?? user?.avatar ?? '',
    },
  })

  const avatarValue = watch('avatar')

  const onSubmit = (data: ProfileValues) => {
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

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'delete my account') {
      setDeleteError('Please type "delete my account" to confirm')
      return
    }
    setDeleteError('')
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        toast.success('Account deleted')
        navigate('/login', { replace: true })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete account')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Profile" description="Manage your personal information" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-64 w-full rounded-xl md:col-span-3" />
          <Skeleton className="h-64 w-full rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  const displayName = profile?.name || user?.name || 'User'
  const displayEmail = profile?.email || user?.email || ''
  const displayAvatar = profile?.avatar || user?.avatar || undefined
  const initials = getInitials(profile?.name ?? user?.name, displayEmail)

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader title="Profile" description="Manage your personal information" />

      {/* ── Hero Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16 rounded-xl ring-1 ring-foreground/10">
            {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} className="rounded-xl" />}
            <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight truncate">{displayName}</h2>
              {org && (
                <Badge variant={getRoleBadgeVariant(org.role)} className="gap-1 text-[11px]">
                  <Shield className="size-3" />
                  {org.role || 'Member'}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {displayEmail}
              </span>
              {profile?.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid ─────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-5">
        {/* Left — Personal Info Form */}
        <div className="space-y-4 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your name and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...register('name')}
                  disabled={updateProfile.isPending}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Camera className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      id="avatar"
                      placeholder="https://example.com/avatar.jpg"
                      className="pl-8"
                      {...register('avatar')}
                      disabled={updateProfile.isPending}
                    />
                  </div>
                  {avatarValue && (
                    <Avatar className="size-8 shrink-0 ring-1 ring-foreground/10">
                      <AvatarImage src={avatarValue} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                {errors.avatar && (
                  <p className="text-xs text-destructive">{errors.avatar.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Paste a direct link to your avatar image
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" disabled={updateProfile.isPending || !isDirty}>
                  {updateProfile.isPending && <Loader2 className="size-3 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Account Details */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                Account Details
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-foreground/5">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{displayEmail}</p>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium truncate">{displayName}</p>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm font-medium">{formatDate(profile.createdAt)}</p>
                </div>
              )}
              {org && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium truncate">{org.name}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant={getRoleBadgeVariant(org?.role)} className="capitalize text-[11px]">
                  {org?.role || 'Member'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteAccount.isPending}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false)
            setDeleteConfirmText('')
            setDeleteError('')
          }
        }}
        title="Delete Account"
        description='Type "delete my account" to confirm. All your data will be permanently deleted.'
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
