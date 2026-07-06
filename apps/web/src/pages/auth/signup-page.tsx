import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Create an account"
        description="Get started with your free account"
      />
      <Card>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
      <AuthFooter mode="signup" />
    </AuthLayout>
  )
}
