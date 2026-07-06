import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        description="Sign in to your account to continue"
      />
      <Card>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <AuthFooter mode="login" />
    </AuthLayout>
  )
}
