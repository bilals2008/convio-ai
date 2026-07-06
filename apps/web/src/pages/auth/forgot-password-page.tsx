import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Reset password"
        description="We'll send you a link to reset your password"
      />
      <Card>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
      <AuthFooter mode="forgot" />
    </AuthLayout>
  )
}
