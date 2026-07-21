import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { useUpdatePassword } from '@/lib/hooks/use-security'

export function PasswordChangeCard() {
  const updatePassword = useUpdatePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({})

  const validate = () => {
    const newErrors: { current?: string; new?: string; confirm?: string } = {}

    if (!currentPassword) {
      newErrors.current = 'Current password is required'
    }

    if (!newPassword) {
      newErrors.new = 'New password is required'
    } else if (newPassword.length < 8) {
      newErrors.new = 'Password must be at least 8 characters'
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    updatePassword.mutate(
      { newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated successfully')
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setErrors({})
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update password')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-4" />
          Change Password
        </CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              {errors.current && <FieldError>{errors.current}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <FieldDescription>Must be at least 8 characters.</FieldDescription>
              {errors.new && <FieldError>{errors.new}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
            </Field>

            <div>
              <Button type="submit" disabled={updatePassword.isPending}>
                {updatePassword.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Update Password
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
