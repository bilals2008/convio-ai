import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || undefined

  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        description="Sign in to your account to continue"
      />
      {searchParams.get('redirect') && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-600">
          Your session has expired. Please sign in again.
        </div>
      )}
      <Card>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
      <AuthFooter mode="login" />
    </AuthLayout>
  )
}
