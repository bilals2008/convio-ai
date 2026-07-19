import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing')

  return (
    <AuthLayout>
      <AuthHeader
        title="Create an account"
        description="Get started with your free account"
      />
      <Card>
        <CardContent>
          <SignupForm plan={plan ?? undefined} billing={billing ?? undefined} />
        </CardContent>
      </Card>
      <AuthFooter mode="signup" />
    </AuthLayout>
  )
}
